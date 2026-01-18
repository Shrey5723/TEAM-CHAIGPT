import { useEffect, useState } from 'react';
import { github } from '../api';

export default function GitHubCallback({ code, onSuccess, onError }) {
    const [status, setStatus] = useState('Connecting to GitHub...');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!code) {
            setError('No authorization code received from GitHub');
            if (onError) onError();
            return;
        }

        const exchangeCode = async () => {
            try {
                setStatus('Exchanging code for access token...');
                const result = await github.handleCallback(code);

                if (result.success) {
                    setStatus(`Success! ${result.data.reposCount} repositories synced.`);
                    // Trigger success callback after 2 seconds
                    setTimeout(() => {
                        if (onSuccess) onSuccess();
                    }, 2000);
                } else {
                    setError(result.error || 'Failed to connect GitHub');
                    if (onError) onError();
                }
            } catch (err) {
                setError(err.message || 'Failed to connect GitHub');
                if (onError) onError();
            }
        };

        exchangeCode();
    }, [code, onSuccess, onError]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px'
        }}>
            <div style={{
                padding: '40px',
                background: '#f8f9fa',
                borderRadius: '16px',
                border: '1px solid #dee2e6',
                textAlign: 'center',
                maxWidth: '400px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    {error ? '❌' : '🔄'}
                </div>
                <h2 style={{ marginBottom: '15px' }}>
                    {error ? 'Connection Failed' : 'GitHub OAuth'}
                </h2>
                {error ? (
                    <p style={{ color: '#dc3545', marginBottom: '20px' }}>{error}</p>
                ) : (
                    <>
                        <p style={{ color: '#28a745' }}>{status}</p>
                        <div style={{
                            marginTop: '20px',
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e9ecef',
                            borderTop: '3px solid #28a745',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '20px auto 0'
                        }} />
                    </>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
