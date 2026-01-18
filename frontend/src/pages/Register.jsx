import { useState } from 'react';
import { auth } from '../api';

export default function Register({ onRegister, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'APPLICANT',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await auth.register(formData);
            if (result.success) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                onRegister(result.data.user);
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Name:</label><br />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Role:</label><br />
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="APPLICANT">Applicant</option>
                        <option value="HIRER">Hirer</option>
                    </select>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
                    Login
                </button>
            </p>
        </div>
    );
}
