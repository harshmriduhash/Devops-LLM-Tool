import React from "react";
import "./DashBoard.css"; // Import the CSS file

function Dashboard({ repo }) {
  return (
    <div className="dashboard-container">
      <h3 className="dashboard-title">Repository Details</h3>
      <p className="dashboard-detail">
        <strong>Name:</strong> {repo.name}
      </p>
      <p className="dashboard-detail">
        <strong>Description:</strong> {repo.description}
      </p>
      <p className="dashboard-detail">
        <strong>Owner:</strong> {repo.owner.login}
      </p>
      <p className="dashboard-detail">
        <strong>Stars:</strong> {repo.stargazers_count}
      </p>
      <p className="dashboard-detail">
        <strong>Forks:</strong> {repo.forks_count}
      </p>
      <p className="dashboard-detail">
        <strong>Open Issues:</strong> {repo.open_issues_count}
      </p>
      <p className="dashboard-detail">
        <strong>Watchers:</strong> {repo.watchers_count}
      </p>
      <p className="dashboard-detail">
        <strong>Language:</strong> {repo.language}
      </p>
      <p className="dashboard-detail">
        <strong>Default Branch:</strong> {repo.default_branch}
      </p>
      <p className="dashboard-detail">
        <strong>Created At:</strong>{" "}
        {new Date(repo.created_at).toLocaleDateString()}
      </p>
      <p className="dashboard-detail">
        <strong>Updated At:</strong>{" "}
        {new Date(repo.updated_at).toLocaleDateString()}
      </p>
      <p className="dashboard-detail">
        <strong>Pushed At:</strong>{" "}
        {new Date(repo.pushed_at).toLocaleDateString()}
      </p>
      <p className="dashboard-detail">
        <strong>License:</strong> {repo.license?.name || "No license"}
      </p>
      <p className="dashboard-detail">
        <strong>Repository URL:</strong>{" "}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-link"
        >
          {repo.html_url}
        </a>
      </p>
    </div>
  );
}

export default Dashboard;
