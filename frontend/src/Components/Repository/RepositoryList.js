import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../../Utils/UserContext';
import './RepositoryList.css';

function RepositoryList() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);

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

  if (!repos.length) {
    return <div>Loading repositories...</div>;
  }

  return (
    <div className="repositories-container">
      <h1 className="repositories-title">Top Repositories</h1>
      <ul className="repositories-list">
        {repos.slice(0, 3).map((repo) => (
          <li key={repo.id}>
            <Link
              to={`/repositories/${repo.owner.login}/${repo.name}`}
              className="repositories-link"
            >
              {repo.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RepositoryList;
