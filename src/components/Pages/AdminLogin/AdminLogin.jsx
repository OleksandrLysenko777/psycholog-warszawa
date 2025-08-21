import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// helpers для работы с токеном
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}
function clearAuthToken() {
  localStorage.removeItem('authToken');
  delete axios.defaults.headers.common.Authorization;
}

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputVerificationCode, setInputVerificationCode] = useState('');
  const [emailFor2FA, setEmailFor2FA] = useState('');
  const [isVerifiedStep, setIsVerifiedStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // на всякий случай чистим старый токен перед новым логином
      clearAuthToken();

      // 1) логин по логину/паролю
      const { data: loginData } = await axios.post(`${API_BASE}/login`, {
        username,
        password,
      });

      if (!loginData?.success) {
        alert('Invalid username or password.');
        return;
      }

      // если сервер уже выдал JWT — сохраним (иногда токен дают сразу)
      if (loginData.token) {
        setAuthToken(loginData.token);
      }

      // 2) отправляем код на email
      const email = loginData.email;
      setEmailFor2FA(email || '');

      const { data: sendCodeData } = await axios.post(
        `${API_BASE}/send-verification-code`,
        { email }
      );

      if (sendCodeData?.success) {
        alert('Verification code sent to your email.');
        setIsVerifiedStep(true);
      } else {
        clearAuthToken();
        alert('Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      clearAuthToken();
      alert('Login error. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 3) верификация кода (предпочтительно здесь сервер возвращает финальный JWT)
      const { data: verifyData } = await axios.post(`${API_BASE}/verify-code`, {
        code: inputVerificationCode,
      });

      if (!verifyData?.success) {
        clearAuthToken();
        alert('Invalid verification code.');
        return;
      }

      // если сервер вернул токен — обновим его (перепишет токен из шага логина)
      if (verifyData.token) {
        setAuthToken(verifyData.token);
      }

      alert('Login successful!');
      if (typeof onLogin === 'function') {
        onLogin(username, password); // для обратной совместимости
      }
      navigate('/start');
    } catch (error) {
      console.error('Error during verification:', error);
      clearAuthToken();
      alert('Verification error. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {!isVerifiedStep ? (
        <form onSubmit={handleLogin}>
          <h2>Admin Login</h2>

          <label>
            Username:
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <h2>Email Verification</h2>
          {emailFor2FA && (
            <p style={{ marginTop: -10, opacity: 0.8 }}>
              Code was sent to: <strong>{emailFor2FA}</strong>
            </p>
          )}

          <label>
            Verification Code:
            <input
              type="text"
              value={inputVerificationCode}
              onChange={(e) => setInputVerificationCode(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={loading} onClick={() => { setIsVerifiedStep(false); setInputVerificationCode(''); }}>
              Back
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminLogin;
