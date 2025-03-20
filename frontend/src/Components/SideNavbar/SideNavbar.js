// SideNavbar.js

import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Utils/UserContext';
import axios from 'axios';
import './SideNavbar.css';

function SideNavbar() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [fileTrees, setFileTrees] = useState({});
  const [expandedRepos, setExpandedRepos] = useState({});
  // Define two width values: default and expanded
  const DEFAULT_WIDTH = 250;
  const EXPANDED_WIDTH = 500;
  const [navWidth, setNavWidth] = useState(DEFAULT_WIDTH);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchRepositories = async () => {
      try {
        const res = await axios.get('http://localhost:4000/auth/repos', {
          withCredentials: true,
        });
        setRepos(res.data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
  }, [user]);

  // Toggle the sidebar width on click
  const toggleWidth = () => {
    setNavWidth((prevWidth) =>
      prevWidth === DEFAULT_WIDTH ? EXPANDED_WIDTH : DEFAULT_WIDTH
    );
  };

  const toggleRepo = (repoFullName) => {
    setExpandedRepos((prev) => {
      const newExpandedRepos = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      return {
        ...newExpandedRepos,
        [repoFullName]: !prev[repoFullName],
      };
    });

    if (!fileTrees[repoFullName]) {
      fetchFileTree(repoFullName);
    }

    setRepos((prevRepos) => {
      const repoIndex = prevRepos.findIndex(
        (repo) => `${repo.owner.login}/${repo.name}` === repoFullName
      );
      if (repoIndex === -1) return prevRepos;

      const updatedRepos = [...prevRepos];
      const [selectedRepo] = updatedRepos.splice(repoIndex, 1);
      return [selectedRepo, ...updatedRepos];
    });

    navigate(`/repositories/${repoFullName}`);
  };

  const fetchFileTree = async (repoFullName) => {
    const [owner, repo] = repoFullName.split('/');
    const config = { headers: { Authorization: `token ${user.githubToken}` } };

    try {
      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
        config
      );

      const buildTree = async (url) => {
        const result = await axios.get(url, config);
        return Promise.all(
          result.data.map(async (item) => {
            if (item.type === 'dir') {
              const children = await buildTree(item.url);
              return { name: item.name, type: 'dir', children };
            }
            return { name: item.name, type: 'file', path: item.path };
          })
        );
      };

      const tree = await buildTree(res.request.responseURL);
      setFileTrees((prev) => ({ ...prev, [repoFullName]: tree }));
    } catch (error) {
      console.error('Error fetching file tree:', error);
    }
  };

  return (
    <div ref={navRef} className="side-navbar-container" style={{ width: navWidth }}>
      <nav className="navbar">
        <ul className="nav-list">
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? 'nav-link active profile-btn' : 'nav-link profile-btn'
              }
            >
              Profile
            </NavLink>
          </li>
          {repos.filter((repo) => !repo.archived).map((repo) => {
            const repoFullName = `${repo.owner.login}/${repo.name}`;
            const isExpanded = expandedRepos[repoFullName];

            return (
              <li key={repo.id}>
                <div
                  onClick={() => toggleRepo(repoFullName)}
                  className="repo-name-box"
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isExpanded ? '▼' : '▶'} {repo.name}
                </div>
                {isExpanded && fileTrees[repoFullName] && (
                  <ul className="file-tree">
                    {fileTrees[repoFullName].map((item) => (
                      <FileTreeNode
                        key={item.path || item.name}
                        item={item}
                        username={repo.owner.login}
                        repoName={repo.name}
                      />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Toggle handle for expanding/collapsing the sidebar */}
      <div className="toggle-handle" onClick={toggleWidth}>
        {navWidth === DEFAULT_WIDTH ? '>' : '<'}
      </div>
    </div>
  );
}

const FileTreeNode = ({ item, username, repoName }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleFileClick = () => {
    navigate(`/repositories/${username}/${repoName}/blob/${item.path}`);
  };

  if (item.type === 'dir') {
    return (
      <li>
        <div
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            cursor: 'pointer',
            marginLeft: '10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {expanded ? '▼' : '▶'} {item.name}
        </div>
        {expanded && (
          <ul style={{ marginLeft: '5px', listStyle: 'none' }}>
            {item.children?.map((child) => (
              <FileTreeNode
                key={child.path || child.name}
                item={child}
                username={username}
                repoName={repoName}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <div
        onClick={handleFileClick}
        style={{ textDecoration: 'none', marginLeft: '20px', cursor: 'pointer' }}
      >
        📄 {item.name}
      </div>
    </li>
  );
};

export default SideNavbar;
