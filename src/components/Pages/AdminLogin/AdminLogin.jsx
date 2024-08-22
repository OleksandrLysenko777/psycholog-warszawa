import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputVerificationCode, setInputVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

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
      if (loginData.success) {
        const sendCodeResponse = await fetch('http://localhost:3001/send-verification-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loginData.email }),
        });

        const sendCodeData = await sendCodeResponse.json();
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

    try {
      const verifyResponse = await fetch('http://localhost:3001/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputVerificationCode }),
      });

      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        alert('Login successful!');
        onLogin(username, password); // Передаем данные для логина
        navigate('/admin-dashboard'); // Перенаправляем на AdminDashboard после успешной верификации
      } else {
        alert('Invalid verification code.');
      }
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

  return (
    <div className="admin-login">
      {!isVerified ? (
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
      )}
    </div>
  );
};

export default AdminLogin;
