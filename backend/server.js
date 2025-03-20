// backend/server.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');


// Gemini library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1) Connect DB + Load Models
const connectDB = require('./config/db');
connectDB();
const User = require('./models/User'); // same user model

// 2) Passport / Auth Setup
require('./passport'); // your GitHubStrategy config

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// 3) Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'someRandomSecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// 4) Normal routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// 5) Webhook signature verify
function verifyGithubSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) throw new Error('Missing X-Hub-Signature-256 header');

  const hmac = crypto.createHmac('sha256', process.env.GH_WEBHOOK_SECRET);
  hmac.update(buf);
  const digest = 'sha256=' + hmac.digest('hex');

  if (signature !== digest) throw new Error('Signature mismatch');
}

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      if (req.headers['x-hub-signature-256']) {
        verifyGithubSignature(req, res, buf);
      }
    },
  })
);

// 6) Webhook route
// ---------------------
//  Gemini Utilities
// ---------------------

// Helper to instantiate the Gemini model
function getGeminiModel() {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  // For this example, we use "gemini-1.5-flash"; adjust as needed
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

/**
 * Generates a code-review comment via Gemini, given a prompt string.
 */
async function generateGeminiPRComment(promptText) {
  try {
    console.log('[Gemini] Generating PR comment...');
    const model = getGeminiModel();
    const result = await model.generateContent(promptText);

    console.log('[Gemini] Response received successfully.');
    return result.response.text(); // The AI-generated text
  } catch (err) {
    console.error('[Gemini Error]', err);
    return 'Error generating AI response.';
  }
}

// ---------------------
//  Webhook Endpoint
// ---------------------
app.post('/github-webhook', async (req, res) => {
  // Basic log messages
  console.log('[Webhook] Request received.');
  const ghEvent = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];
  console.log(`[Webhook] Event received: ${deliveryId} (${ghEvent})`);

  const payload = req.body;

  try {
    if (ghEvent === 'pull_request' && payload.action === 'opened') {
      console.log('[Webhook] Handling "pull_request" event with action "opened".');
      const pr = payload.pull_request;
      const repo = payload.repository;

      // Extract key info
      const owner = repo.owner.login;
      const repoName = repo.name;
      const pullNumber = pr.number;
      const prUserLogin = pr.user.login;

      console.log(`[PR Info] PR #${pullNumber} opened in ${owner}/${repoName} by ${prUserLogin}`);

      // 1) Retrieve user's GitHub token from DB or fallback to an app-level token
      let userToken;
      const dbUser = await User.findOne({ githubUsername: prUserLogin });
      if (dbUser) {
        console.log(`[DB] Found user token for ${prUserLogin}.`);
        userToken = dbUser.githubToken;
      } else {
        console.log('[DB] No user token found, using fallback app token.');
        userToken = process.env.OAUTH_APP_TOKEN; // Make sure you have OAUTH_APP_TOKEN in .env if using fallback
      }

      if (!userToken) {
        console.error('[Error] No token available to proceed.');
        return res.status(200).send('No token found, cannot comment.');
      }

      // 2) Gather changed files in this PR
      const filesUrl = pr._links.self.href.replace('{/number}', '') + '/files';
      console.log(`[GitHub API] Fetching changed files from: ${filesUrl}`);
      const fileRes = await axios.get(filesUrl, {
        headers: { Authorization: `token ${userToken}` },
      });
      const changedFiles = fileRes.data;
      console.log(`[GitHub API] Retrieved ${changedFiles.length} changed files.`);

      // Summarize changes to feed into Gemini
      let changesSummary = '';
      changedFiles.forEach((file) => {
        changesSummary += `\nFile: ${file.filename}\n`;
        changesSummary += `Status: ${file.status}\n`;
        if (file.patch) {
          changesSummary += `Diff:\n${file.patch}\n`;
        }
        changesSummary += '-----------------\n';
      });

      // 3) Prepare the Gemini prompt
      const geminiPrompt = `
You are a code-review assistant. A pull request was just created. Below are the changes in diff format:

${changesSummary}

Please analyze these changes and prepare a concise but thorough code review comment (in Markdown) highlighting:

- Potential improvements,
- Questions or clarifications for the author,
- Overall assessment of the changes.

Return only the code review comment in valid Markdown.
      `;

      // 4) Generate AI-based code review
      console.log('[Gemini] Sending prompt to Gemini...');
      const geminiResponse = await generateGeminiPRComment(geminiPrompt);

      // 5) Post the AI-generated comment back to GitHub
      const commentUrl = `https://api.github.com/repos/${owner}/${repoName}/issues/${pullNumber}/comments`;
      console.log(`[GitHub API] Posting comment to: ${commentUrl}`);
      await axios.post(
        commentUrl,
        { body: geminiResponse },
        { headers: { Authorization: `token ${userToken}` } }
      );

      console.log('[GitHub API] Comment posted successfully.');
      return res.status(200).send('Success');
    } else if (ghEvent === 'ping') {
      console.log('[Webhook] Ping event received. Payload:', payload);
      return res.status(200).send('Ping received');
    } else if (ghEvent === 'push') {
      console.log('[Webhook] Push event received. Payload:', payload);
      return res.status(200).send('Push event ignored');
    } else {
      // If not PR opened, ping, or push → ignore
      console.log(`[Webhook] Unsupported event type: ${ghEvent}. Ignoring.`);
      return res.status(200).send('Event ignored');
    }
  } catch (err) {
    console.error('[Error] Webhook processing failed:', err.message);
    console.error(err.stack);
    return res.status(500).send('Error processing webhook');
  }
});

// 7) Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
