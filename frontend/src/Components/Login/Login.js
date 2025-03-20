import React from 'react';
import './Login.css'; // Import the CSS file
import logo from '../../Assets/github-logo.png'; // Import logo from assets folder

function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/github';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title">Welcome to LLM DevOps Tool</h1>
        <button onClick={handleLogin} className="login-button">
          Login with GitHub
        </button>
      </div>
    </div>
  );
}

export default Login;
