// backend/routes/auth.js
const passport = require("passport");
const axios = require("axios");
const express = require("express");
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// GitHub login route
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email", "repo"] })
);

// GitHub callback route
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:3000?error=login_failed",
  }),
  (req, res) => {
    // Successful authentication
    console.log("User after GitHub auth:", req.user);
    // Redirect to React app
    res.redirect("http://localhost:3000/repositories");
  }
);

// Fetch repos using the user's GitHub token
router.get("/repos", ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${req.user.githubToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching repositories:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.send("Logged out");
  });
});

// Get user data
router.get("/user", (req, res) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);

  if (!req.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json(req.user);
});

module.exports = router;
