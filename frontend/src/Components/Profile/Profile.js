import React, { useContext } from 'react';
import { UserContext } from '../../Utils/UserContext';
import './Profile.css'; // Added for styling

const Profile = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      {user.photos && user.photos.length > 0 && (
        <div className="profile-picture-container">
          <img src={user.photos[0]} alt="Profile" className="profile-picture" />
        </div>
      )}
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Display Name:</strong> {user.displayName}</p>
        <p>
          <strong>GitHub Profile:</strong> 
          <a href={user.profileUrl} target="_blank" rel="noopener noreferrer">
            {user.profileUrl}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Profile;