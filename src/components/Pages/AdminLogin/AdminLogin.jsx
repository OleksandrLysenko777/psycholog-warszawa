import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [inputVerificationCode, setInputVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const loginResponse = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      if (loginData.success) {
        const sendCodeResponse = await fetch('http://localhost:3001/send-verification-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loginData.email }),
        });

        const sendCodeData = await sendCodeResponse.json();
        console.log('Send code response:', sendCodeData);
        if (sendCodeData.success) {
          alert('Verification code sent to your email.');
          setIsVerified(true);
        } else {
          alert('Failed to send verification code.');
        }
      } else {
        alert('Invalid username or password.');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    console.log('Verifying code:', inputVerificationCode);
    try {
      const verifyResponse = await fetch('http://localhost:3001/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputVerificationCode }),
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);
      if (verifyData.success) {
        alert('Login successful!');
        setIsLoggedIn(true);
      } else {
        alert('Invalid verification code.');
      }
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

  return (
    <div className="admin-login">
      {!isLoggedIn ? (
        !isVerified ? (
          <form onSubmit={handleLogin}>
            <h2>Admin Login</h2>
            <label>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <h2>Email Verification</h2>
            <label>
              Verification Code:
              <input
                type="text"
                value={inputVerificationCode}
                onChange={(e) => setInputVerificationCode(e.target.value)}
                required
              />
            </label>
            <button type="submit">Verify</button>
          </form>
        )
      ) : (
        <div>
          <h2>Welcome, Admin!</h2>
          <a href="/admin-dashboard">Go to Dashboard</a>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
