import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const getGeminiModel = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export const decide = async (conversationContext, userMessage) => {
  try {
    const model = getGeminiModel();

    // Decision prompt
    const prompt = `
      You are a helpful assistant. The user has asked something. Decide what action you need:
      
      1) "NEED_REPO_OVERVIEW" if you want the entire repository's raw API JSON. 
         Format: NEED_REPO_OVERVIEW|owner/repo
      
      2) "NEED_A_FILE" if you want the content of a specific file. 
         Format: NEED_A_FILE|path/to/file|in|owner/repo
      
      3) "NONE" if you have enough info and can answer directly.

      Return EXACTLY one line with your decision (no JSON, no extra words).

      EXAMPLES:
      - "NONE"
      - "NEED_REPO_OVERVIEW|octocat/Hello-World"
      - "NEED_A_FILE|src/index.js|in|octocat/Hello-World"

      CONVERSATION CONTEXT:
      ${conversationContext}

      USER MESSAGE:
      "${userMessage}"
    `;

    const result = await model.generateContent(prompt);
    const line = result.response.text().trim();
    return line; // e.g. "NONE" or "NEED_REPO_OVERVIEW|owner/repo" etc.
  } catch (error) {
    console.error('Error in decide():', error);
    return 'NONE'; // fallback
  }
};

/**
 * ACTION:
 * We either:
 *   - fetch repo overview from GitHub
 *   - fetch a file from GitHub
 *   - or do nothing special
 * Then pass everything to generateAIResponse for the final answer.
 */
export const action = async ({
    decisionString,
    conversationContext,
    userMessage,
    fetchRepoRawData,
    fetchFileContent,
    fetchFileTree,
    selectedRepo,
    user,
  }) => {
    let finalAssistantText = '';
    let updatedContext = conversationContext;
  
    let actionType = '';
    let filePath = '';
  
    if (decisionString.startsWith('NONE')) {
      actionType = 'NONE';
    } else if (decisionString.startsWith('NEED_REPO_OVERVIEW')) {
      actionType = 'NEED_REPO_OVERVIEW';
    } else if (decisionString.startsWith('NEED_A_FILE')) {
      actionType = 'NEED_A_FILE';
      const parts = decisionString.split('|');
      filePath = parts[1] || '';
    }
  
    if ((actionType === 'NEED_REPO_OVERVIEW' || actionType === 'NEED_A_FILE') && !selectedRepo) {
      finalAssistantText =
        'No valid repository selected. Please choose a repo from the dropdown.';
      return { finalAssistantText, updatedContext };
    }
  
    try {
      let fileTree = null;
  
      // Fetch the file tree to provide additional repository context
      if (actionType === 'NEED_REPO_OVERVIEW' || actionType === 'NEED_A_FILE') {
        fileTree = await fetchFileTree(selectedRepo, user);
        updatedContext += `\n[System: File tree for ${selectedRepo} below]\n\`\`\`json\n${JSON.stringify(
          fileTree,
          null,
          2
        )}\n\`\`\``;
      }
  
      if (actionType === 'NEED_REPO_OVERVIEW') {
        const rawData = await fetchRepoRawData(selectedRepo);
        updatedContext += `\n[System: Raw GitHub JSON for ${selectedRepo} below]\n\`\`\`json\n${JSON.stringify(
          rawData,
          null,
          2
        )}\n\`\`\``;
  
        finalAssistantText = await generateAIResponse(updatedContext, userMessage);
      } else if (actionType === 'NEED_A_FILE') {
        const content = await fetchFileContent(selectedRepo, filePath);
        updatedContext += `\n[System: Content of ${filePath} below]\n\`\`\`\n${content}\n\`\`\``;
  
        finalAssistantText = await generateAIResponse(updatedContext, userMessage);
      } else {
        // NONE
        finalAssistantText = await generateAIResponse(updatedContext, userMessage);
      }
    } catch (err) {
      console.error('Error in action():', err);
      finalAssistantText = `An error occurred: ${err.message}`;
    }
  
    updatedContext += `\nAssistant: ${finalAssistantText}`;
    return { finalAssistantText, updatedContext };
  };  

/**
 * generateAIResponse:
 * Calls Gemini to produce final Markdown output.
 */
export const generateAIResponse = async (conversationContext, userMessage) => {
  try {
    const model = getGeminiModel();

    const prompt = `
      You are a helpful assistant. Use the conversation context, plus any provided GitHub data, 
      to answer the user's question in Markdown. 
      You do NOT need to request new data now; you have it or not.

      Please return your full answer in Markdown format.

      CONVERSATION CONTEXT:
      ${conversationContext}

      USER MESSAGE:
      "${userMessage}"

      Provide a concise, helpful answer in valid Markdown.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Sorry, something went wrong generating the response.';
  }
};

// Helper to fetch the full file tree of a repository
export const fetchFileTree = async (repoFullName, user) => {
    const [owner, repo] = repoFullName.split('/');
    const config = { headers: { Authorization: `token ${user.githubToken}` } };
  
    const fetchDirectory = async (url) => {
      const res = await axios.get(url, config);
      return res.data.map((item) => ({
        path: item.path,
        type: item.type, // "file" or "dir"
        url: item.type === 'dir' ? item.url : null,
      }));
    };
  
    const buildTree = async (url) => {
      const nodes = await fetchDirectory(url);
      const tree = [];
  
      for (const node of nodes) {
        if (node.type === 'dir') {
          const children = await buildTree(node.url);
          tree.push({ ...node, children });
        } else {
          tree.push(node);
        }
      }
  
      return tree;
    };
  
    // Start with the root directory of the repository
    const rootUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const fileTree = await buildTree(rootUrl);
  
    return fileTree; // Returns the entire tree structure
  };
  