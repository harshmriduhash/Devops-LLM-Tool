import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../../Utils/UserContext";
import ChatHistory from "../ChatHistory/ChatHistory";
import ChatInput from "../ChatInput/ChatInput";
import { fetchFileTree } from "../../Utils/aiUtils"; // Import the helper

// Import our new functions:
import { decide, action } from "../../Utils/aiUtils";
// fetchRepoRawData, fetchFileContent we define in this file.

function Chat({ repo }) {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [conversationContext, setConversationContext] = useState("");

  // Helper to fetch raw GitHub repo details JSON
  const fetchRepoRawData = async (repoFullName) => {
    const [owner, repo] = repoFullName.split("/");
    const config = { headers: { Authorization: `token ${user.githubToken}` } };
    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      config
    );
    return repoRes.data;
  };

  // Helper to fetch file content
  const fetchFileContent = async (repoFullName, filePath) => {
    const [owner, repo] = repoFullName.split("/");
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const res = await axios.get(url, {
      headers: { Authorization: `token ${user.githubToken}` },
    });
    // decode from Base64
    return atob(res.data.content);
  };

  const sendMessage = async (text) => {
    // 1) Show user message in chat
    setMessages((prev) => [...prev, { sender: "user", text }]);

    // 2) Update conversation context with the user message
    let updatedContext = conversationContext + `\nUser: ${text}`;

    // 3) Step 1: DECIDE
    const decisionString = await decide(updatedContext, text);
    console.log("decisionString:", decisionString);

    // 4) Step 2: ACTION => final answer
    const { finalAssistantText, updatedContext: newContext } = await action({
      decisionString,
      conversationContext: updatedContext,
      userMessage: text,
      fetchRepoRawData,
      fetchFileContent,
      fetchFileTree, // Pass the helper
      selectedRepo: repo.full_name, // Use the passed repo prop
      user, // Pass user context for GitHub token
    });

    // 5) Add final assistant text to the messages
    setMessages((prev) => [
      ...prev,
      { sender: "assistant", text: finalAssistantText },
    ]);

    // 6) Update the conversation context
    setConversationContext(newContext);
  };

  return (
    <div className="chat-container">
      <h2>Gemini AI Chat</h2>
      <ChatHistory messages={messages} />
      <ChatInput sendMessage={sendMessage} />
    </div>
  );
}

export default Chat;
