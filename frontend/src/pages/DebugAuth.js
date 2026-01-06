import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function DebugAuth() {
  const [authStatus, setAuthStatus] = useState(null);
  const [cookies, setCookies] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setCookies(document.cookie);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const user = await response.json();
        setAuthStatus({ success: true, user });
      } else {
        setAuthStatus({ success: false, status: response.status });
      }
    } catch (error) {
      setAuthStatus({ success: false, error: error.message });
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: 'test_user_123',
          email: 'test@campus.edu',
          name: 'Test User',
          department: 'CSE',
          year: 2,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        setTestResult({ success: true, user });
        setCookies(document.cookie);
        checkAuth();
      } else {
        const error = await response.text();
        setTestResult({ success: false, status: response.status, error });
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Cookies</h2>
          <pre className="bg-secondary p-4 rounded overflow-auto text-sm">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <button
            onClick={checkAuth}
            className="mb-4 px-4 py-2 bg-accent text-white rounded"
          >
            Check Auth
          </button>
          <pre className="bg-secondary p-4 rounded overflow-auto text-sm">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <button
            onClick={testLogin}
            className="mb-4 px-4 py-2 bg-accent text-white rounded"
          >
            Test Dev Login
          </button>
          {testResult && (
            <pre className="bg-secondary p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Backend URL</h2>
          <p className="text-sm">{BACKEND_URL || 'Not set (will use relative URLs)'}</p>
        </div>
      </div>
    </div>
  );
}

export default DebugAuth;
