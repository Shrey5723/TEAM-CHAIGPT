import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import HirerDashboard from './pages/HirerDashboard';
import Notifications from './pages/Notifications';
import GitHubCallback from './pages/GitHubCallback';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [githubCode, setGithubCode] = useState(null);

  useEffect(() => {
    // Check for GitHub OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && window.location.pathname === '/github/callback') {
      setGithubCode(code);
      // Clear the URL params
      window.history.replaceState({}, '', '/');
    }

    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
    setShowNotifications(false);
  };

  // Navigation bar
  const NavBar = () => (
    <nav style={{
      background: '#333',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0 }}>Corporate Sector Portal</h1>
      {user && (
        <div>
          <span style={{ marginRight: '15px' }}>
            {user.name} ({user.role})
          </span>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Notifications
          </button>
          <button
            onClick={() => { setShowNotifications(false); setPage('dashboard'); }}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Dashboard
          </button>
          <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );

  // Render based on state
  if (!user) {
    return (
      <div>
        <NavBar />
        {page === 'login' ? (
          <>
            <Login onLogin={handleLogin} />
            <p style={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <button
                onClick={() => setPage('register')}
                style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <Register
            onRegister={handleLogin}
            onSwitchToLogin={() => setPage('login')}
          />
        )}
      </div>
    );
  }

  // Handle GitHub OAuth callback
  if (githubCode && user) {
    return (
      <div>
        <NavBar />
        <GitHubCallback
          code={githubCode}
          onSuccess={() => {
            setGithubCode(null);
            setPage('dashboard');
          }}
          onError={() => setGithubCode(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      {showNotifications ? (
        <Notifications />
      ) : user.role === 'APPLICANT' ? (
        <ApplicantDashboard user={user} />
      ) : (
        <HirerDashboard user={user} />
      )}
    </div>
  );
}

export default App;
