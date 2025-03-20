import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // To render raw HTML
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // For syntax highlighting
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Syntax highlighting theme
import './ChatHistory.css';

function ChatHistory({ messages }) {
  return (
    <div className="chat-history">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message-container ${msg.sender === 'user' ? 'user' : 'assistant'}`}
        >
          <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
            {msg.sender === 'assistant' ? (
              <ReactMarkdown
                children={msg.text}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              />
            ) : (
              msg.text
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const markdownComponents = {
  h1: ({ node, ...props }) => <h1 className="markdown-h1" {...props} />,
  h2: ({ node, ...props }) => <h2 className="markdown-h2" {...props} />,
  h3: ({ node, ...props }) => <h3 className="markdown-h3" {...props} />,
  h4: ({ node, ...props }) => <h4 className="markdown-h4" {...props} />,
  h5: ({ node, ...props }) => <h5 className="markdown-h5" {...props} />,
  h6: ({ node, ...props }) => <h6 className="markdown-h6" {...props} />,
  p: ({ node, ...props }) => <p className="markdown-paragraph" {...props} />,
  strong: ({ node, ...props }) => <strong className="markdown-bold" {...props} />,
  em: ({ node, ...props }) => <em className="markdown-italic" {...props} />,
  del: ({ node, ...props }) => <del className="markdown-strikethrough" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="markdown-blockquote" {...props} />
  ),
  ul: ({ node, ...props }) => <ul className="markdown-ul" {...props} />,
  ol: ({ node, ...props }) => <ol className="markdown-ol" {...props} />,
  li: ({ node, ...props }) => <li className="markdown-li" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className={inline ? 'markdown-inline-code' : 'markdown-code'}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre className="markdown-pre" {...props}>
      {props.children}
    </pre>
  ),
  a: ({ node, ...props }) => <a className="markdown-link" {...props} />,
  img: ({ node, ...props }) => <img className="markdown-image" {...props} />,
  hr: ({ node, ...props }) => <hr className="markdown-horizontal-rule" {...props} />,
  table: ({ node, ...props }) => <table className="markdown-table" {...props} />,
  thead: ({ node, ...props }) => <thead className="markdown-table-head" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="markdown-table-body" {...props} />,
  tr: ({ node, ...props }) => <tr className="markdown-table-row" {...props} />,
  th: ({ node, ...props }) => <th className="markdown-table-header-cell" {...props} />,
  td: ({ node, ...props }) => <td className="markdown-table-cell" {...props} />,
};

export default ChatHistory;
