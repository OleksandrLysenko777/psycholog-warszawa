import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [content, setContent] = useState({ welcomeMessage: '' });

  useEffect(() => {
    fetch('http://localhost:3001/content')
      .then((response) => response.json())
      .then((data) => setContent(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  const handleUpdateContent = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/update-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Content updated successfully!');
        } else {
          alert('Failed to update content.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <form onSubmit={handleUpdateContent}>
        <label>
          Welcome Message:
          <textarea
            value={content.welcomeMessage}
            onChange={(e) => setContent({ ...content, welcomeMessage: e.target.value })}
            required
            style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px' }}>Update Content</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
