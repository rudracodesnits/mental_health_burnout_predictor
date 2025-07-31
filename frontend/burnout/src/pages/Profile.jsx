import React from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('userProfile'));

  if (!user) {
    return <div>No user data available. Please sign up or login first.</div>;
  }

  return (
    <div className="profile-page">
      <h2 className="profile-title">User Profile</h2>
      {user.name && <div className="profile-item"><strong>Name:</strong> {user.name}</div>}
      {user.age && <div className="profile-item"><strong>Age:</strong> {user.age}</div>}
      {user.education && <div className="profile-item"><strong>Education:</strong> {user.education}</div>}
      {user.gender && <div className="profile-item"><strong>Gender:</strong> {user.gender}</div>}
      <div className="profile-item"><strong>Email:</strong> {user.email}</div>
    </div>
  );
};

export default Profile;
