import { useState, useEffect } from 'react';
import { applicant, github, corporate } from '../api';

export default function ApplicantDashboard({ user }) {
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [repos, setRepos] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Form states
    const [profileForm, setProfileForm] = useState({ bio: '', linkedInUrl: '', courseraUrl: '' });
    const [resumeFile, setResumeFile] = useState(null);
    const [showResumeForm, setShowResumeForm] = useState(false);
    const [certForm, setCertForm] = useState({ name: '', companyName: '', platform: '' });


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileRes, skillsRes, reposRes, jobsRes] = await Promise.all([
                applicant.getProfile().catch(() => ({ success: false })),
                applicant.getSkills().catch(() => ({ success: false })),
                github.getRepos().catch(() => ({ success: false })),
                corporate.getRecommendedJobs().catch(() => ({ success: false })),
            ]);

            if (profileRes.success) setProfile(profileRes.data);
            if (skillsRes.success) setSkills(skillsRes.data);
            if (reposRes.success) setRepos(reposRes.data);
            if (jobsRes.success) setRecommendedJobs(jobsRes.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        const result = await applicant.createProfile(profileForm);
        if (result.success) {
            setProfile(result.data);
            setMessage('Profile created!');
        } else {
            setMessage(result.error || 'Failed');
        }
    };

    const handleResumeUpload = async (e) => {
        e.preventDefault();
        if (!resumeFile) return;
        const result = await applicant.uploadResume(resumeFile);
        if (result.success) {
            setMessage('Resume uploaded!');
            loadData();
        } else {
            setMessage(result.error || 'Failed');
        }
    };

    const handleCertManual = async (e) => {
        e.preventDefault();
        if (!certForm.name || !certForm.companyName || !certForm.platform) return;
        const result = await applicant.addCertificateManual(certForm);
        if (result.success) {
            setMessage('Certificate added! Skill derived.');
            setCertForm({ name: '', companyName: '', platform: '' });
            loadData();
        } else {
            setMessage(result.error || 'Failed');
        }
    };

    const handleGithubConnect = async () => {
        try {
            const result = await github.getAuthUrl();
            if (result.success && result.data.authUrl) {
                window.location.href = result.data.authUrl;
            } else {
                setMessage('Failed to get GitHub auth URL');
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to initiate GitHub connection');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Applicant Dashboard</h2>
            <p>Welcome, {user.name} ({user.email})</p>

            {/* Skill Twin X-Factor Button */}
            <div style={{ marginTop: '15px', marginBottom: '15px', display: 'flex', gap: '15px' }}>
                <button
                    onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`http://localhost:8005?token=${token}`, '_blank');
                    }}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(52, 211, 153, 0.4)'
                    }}
                >
                    🧠 Skill Twin X-Factor
                </button>

                <button
                    onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`http://localhost:8006?token=${token}`, '_blank');
                    }}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                    }}
                >
                    🚀 TechStack Analysis
                </button>
            </div>

            {message && <p style={{ color: 'green', background: '#e0ffe0', padding: '10px' }}>{message}</p>}

            {/* Profile Section */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Profile</h3>
                {profile ? (
                    <div>
                        <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
                        <p><strong>LinkedIn:</strong> {profile.linkedInUrl || 'Not set'}</p>
                        <p><strong>Coursera:</strong> {profile.courseraUrl || 'Not set'}</p>
                        <p><strong>Resume:</strong> {profile.resume ? profile.resume.filename : 'Not uploaded'}</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreateProfile}>
                        <input
                            placeholder="Bio"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                        />
                        <input
                            placeholder="LinkedIn URL"
                            value={profileForm.linkedInUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, linkedInUrl: e.target.value })}
                            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                        />
                        <input
                            placeholder="Coursera URL"
                            value={profileForm.courseraUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, courseraUrl: e.target.value })}
                            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px' }}>Create Profile</button>
                    </form>
                )}
            </section>

            {/* Resume Upload */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Resume</h3>
                {profile?.resume && (
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: '#166534', fontSize: '1.2em' }}>✓</span>
                            <span style={{ color: '#166534', fontWeight: '600' }}>Resume Uploaded</span>
                        </div>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9em' }}>
                            File: <strong>{profile.resume.filename}</strong>
                            {profile.resume.cgpa && (
                                <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>
                                    CGPA: {profile.resume.cgpa}
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {(!profile?.resume || showResumeForm) ? (
                    <form onSubmit={handleResumeUpload}>
                        <p style={{ marginBottom: '10px', fontSize: '0.9em', color: '#666' }}>
                            {profile?.resume ? 'Upload a new file to replace the current one:' : 'Upload your resume (PDF only) to extract skills:'}
                        </p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setResumeFile(e.target.files[0])}
                            style={{ marginRight: '10px' }}
                        />
                        <button type="submit" style={{ padding: '8px 15px' }}>
                            {profile?.resume ? 'Replace Resume' : 'Upload Resume'}
                        </button>
                        {profile?.resume && (
                            <button
                                type="button"
                                onClick={() => setShowResumeForm(false)}
                                style={{ marginLeft: '10px', padding: '8px 15px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                ) : (
                    <button
                        onClick={() => setShowResumeForm(true)}
                        style={{ padding: '8px 15px', cursor: 'pointer' }}
                    >
                        Re-upload Resume
                    </button>
                )}
            </section>

            {/* Add Certificate Manually */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Add Certificate</h3>
                <form onSubmit={handleCertManual}>
                    <input
                        placeholder="Certificate Name (e.g., Deep Learning Specialization)"
                        value={certForm.name}
                        onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <input
                        placeholder="Course Provider (e.g., deeplearning.ai)"
                        value={certForm.companyName}
                        onChange={(e) => setCertForm({ ...certForm, companyName: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <select
                        value={certForm.platform}
                        onChange={(e) => setCertForm({ ...certForm, platform: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    >
                        <option value="">Select Platform</option>
                        <option value="Coursera">Coursera</option>
                        <option value="Udemy">Udemy</option>
                        <option value="edX">edX</option>
                        <option value="LinkedIn Learning">LinkedIn Learning</option>
                        <option value="Udacity">Udacity</option>
                        <option value="Pluralsight">Pluralsight</option>
                        <option value="Other">Other</option>
                    </select>
                    <button type="submit" style={{ padding: '10px 20px' }}>Add Certificate</button>
                </form>

                {/* Show existing certificates */}
                {profile?.certificates?.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                        <strong>Your Certificates:</strong>
                        <ul>
                            {profile.certificates.map((c) => (
                                <li key={c.id}>
                                    <strong>{c.name}</strong> by {c.companyName} ({c.platform})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* GitHub Connect */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Connect GitHub</h3>
                <p style={{ marginBottom: '15px', color: '#666' }}>
                    Connect your GitHub account to verify your coding skills. We analyze your repositories to derive validated skills.
                </p>
                {repos.length > 0 && (
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#166534', fontSize: '1.2em' }}>✓</span>
                            <span style={{ color: '#166534', fontWeight: '600' }}>GitHub Connected</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleGithubConnect}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#24292e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    <svg height="20" width="20" viewBox="0 0 16 16" fill="white">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    {repos.length > 0 ? 'Reconnect / Sync Again' : 'Connect with GitHub'}
                </button>
                {repos.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }}></div>
                            <strong>Connected - {repos.length} Repositories Synced</strong>
                        </div>
                        <ul style={{ maxHeight: '150px', overflowY: 'auto', paddingLeft: '20px' }}>
                            {repos.map((r) => (
                                <li key={r.id} style={{ marginBottom: '5px' }}>
                                    <a href={r.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0366d6', textDecoration: 'none' }}>
                                        {r.repoName}
                                    </a>
                                    <span style={{ color: '#666', fontSize: '0.9em' }}>
                                        {' '} - {r.languages.join(', ') || 'No language detected'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Derived Skills */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Derived Skills</h3>
                {skills.length > 0 ? (
                    <ul>
                        {skills.map((s) => (
                            <li key={s.id}>
                                <strong>{s.name}</strong> - Source: {s.source}, Confidence: {Math.round(s.confidence * 100)}%
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No skills derived yet. Upload certificates or connect GitHub.</p>
                )}
            </section>

            {/* Recommended Jobs */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Recommended Jobs</h3>
                {recommendedJobs.length > 0 ? (
                    <ul>
                        {recommendedJobs.map((j) => (
                            <li key={j.id} style={{ marginBottom: '10px' }}>
                                <strong>{j.title}</strong> - {j.role}<br />
                                Match Score: <strong>{Math.round(j.matchScore * 100)}%</strong><br />
                                Matched Skills: {j.matchedSkills.join(', ') || 'None'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No job recommendations yet.</p>
                )}
            </section>
        </div>
    );
}
