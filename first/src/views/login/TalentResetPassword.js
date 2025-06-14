import { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import history from '../../utils/browserHistory';

const TalentResetPassword = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);
   
  if (!token) return <div>Invalid or missing token.</div>;

  return (
    <form
      onSubmit={async e => {
        try{
          e.preventDefault();
          if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          // Call your API to reset password
          await axios.post(`${config.API_URL}/reset-password`, { token, newPassword });
          history.push('/talent/login');
        } catch (err) {
          if (err.response && err.response.status === 400) {
            setError('Invalid or expired token.');
          }
        }
      }}
      className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow"
    >
      <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
      {email && <div className="mb-2 text-sm text-gray-600">For: {email}</div>}
      <input
        type="password"
        placeholder="New password"
        className="w-full border px-3 py-2 rounded mb-3"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm password"
        className="w-full border px-3 py-2 rounded mb-4"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full px-4 py-2 rounded bg-blue-600 text-white"
      >
        Change Password
      </button>
      {success && <div className="mt-2 text-green-600">{success}</div>}
    </form>
  );
};

export default TalentResetPassword;