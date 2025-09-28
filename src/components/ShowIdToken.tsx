import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

const ShowIdToken = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleGetToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('No user is logged in.');
        return;
      }
      const idToken = await user.getIdToken(true);
      setToken(idToken);
      setError('');
    } catch (e) {
      setError('Failed to get token: ' + e.message);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <button onClick={handleGetToken} style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>
        Show Firebase ID Token
      </button>
      {token && (
        <textarea value={token} readOnly rows={5} style={{ width: '100%', marginTop: '1rem' }} />
      )}
      {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
    </div>
  );
};

export default ShowIdToken;
