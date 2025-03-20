import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../../Utils/UserContext';

function FileTree({ item }) {
  const { user } = useContext(UserContext);
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const { username, repoName } = useParams();

  const toggleExpand = async () => {
    if (!expanded && item.type === 'dir') {
      try {
        const res = await axios.get(item.url, {
          headers: {
            Authorization: `token ${user.githubToken}`,
          },
        });
        setChildren(res.data);
      } catch (err) {
        console.error('Error fetching directory contents:', err);
      }
    }
    setExpanded(!expanded);
  };

  if (item.type === 'dir') {
    return (
      <li>
        <span onClick={toggleExpand} style={{ cursor: 'pointer' }}>
          {item.name}
        </span>
        {expanded && children.length > 0 && (
          <ul style={{ listStyleType: 'none' }}>
            {children.map((child) => (
              <FileTree key={child.sha} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // If it's a file, link to the CodeViewer page
  // We'll craft something like: /repositories/:username/:repoName/blob/path/to/file
  const fileViewerPath = `/repositories/${username}/${repoName}/blob/${item.path}`;

  return (
    <li>
      <Link to={fileViewerPath} style={{ textDecoration: 'none', color: 'inherit' }}>
        {item.name}
      </Link>
    </li>
  );
}

export default FileTree;
