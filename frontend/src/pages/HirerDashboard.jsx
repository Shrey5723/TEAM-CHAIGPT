import { useState, useEffect } from 'react';
import { corporate } from '../api';

export default function HirerDashboard({ user }) {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Job form state
    const [jobForm, setJobForm] = useState({
        title: '',
        role: '',
        description: '',
        jobType: 'FULL_TIME',
        location: '',
        salary: '',
        requiredSkills: [{ name: '', weight: 0.5 }],
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        const result = await corporate.getMyJobs();
        if (result.success) {
            setJobs(result.data);
        }
        setLoading(false);
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        const skills = jobForm.requiredSkills.filter(s => s.name.trim());
        const result = await corporate.createJob({
            ...jobForm,
            requiredSkills: skills,
        });
        if (result.success) {
            setMessage('Job created!');
            setJobForm({
                title: '',
                role: '',
                description: '',
                jobType: 'FULL_TIME',
                location: '',
                salary: '',
                requiredSkills: [{ name: '', weight: 0.5 }],
            });
            loadJobs();
        } else {
            setMessage(result.error || 'Failed');
        }
    };

    const addSkillRow = () => {
        setJobForm({
            ...jobForm,
            requiredSkills: [...jobForm.requiredSkills, { name: '', weight: 0.5 }],
        });
    };

    const updateSkill = (index, field, value) => {
        const updated = [...jobForm.requiredSkills];
        updated[index][field] = field === 'weight' ? parseFloat(value) : value;
        setJobForm({ ...jobForm, requiredSkills: updated });
    };

    const loadApplicants = async (jobId) => {
        setSelectedJob(jobId);
        const result = await corporate.getRecommendedApplicants(jobId);
        if (result.success) {
            setApplicants(result.data);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Hirer Dashboard</h2>
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
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(167, 139, 250, 0.4)'
                    }}
                >
                    🧠 Skill Twin - Analyze Applicant
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

            {/* Create Job Form */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Create Job Posting</h3>
                <form onSubmit={handleCreateJob}>
                    <input
                        placeholder="Job Title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <input
                        placeholder="Role (e.g., Backend, Frontend)"
                        value={jobForm.role}
                        onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <textarea
                        placeholder="Description"
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '60px' }}
                    />
                    <select
                        value={jobForm.jobType}
                        onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                        style={{ marginBottom: '10px', padding: '8px' }}
                    >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="FREELANCE">Freelance</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                    <input
                        placeholder="Location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <input
                        placeholder="Salary"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />

                    <h4>Required Skills (with weights)</h4>
                    {jobForm.requiredSkills.map((skill, idx) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                            <input
                                placeholder="Skill name"
                                value={skill.name}
                                onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                                style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                            />
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={skill.weight}
                                onChange={(e) => updateSkill(idx, 'weight', e.target.value)}
                                style={{ padding: '8px', width: '80px' }}
                            />
                            <span style={{ marginLeft: '5px' }}>weight</span>
                        </div>
                    ))}
                    <button type="button" onClick={addSkillRow} style={{ marginBottom: '15px', padding: '5px 10px' }}>
                        + Add Skill
                    </button>
                    <br />
                    <button type="submit" style={{ padding: '10px 20px' }}>Create Job</button>
                </form>
            </section>

            {/* My Jobs */}
            <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>My Job Postings</h3>
                {jobs.length > 0 ? (
                    <ul>
                        {jobs.map((job) => (
                            <li key={job.id} style={{ marginBottom: '15px' }}>
                                <strong>{job.title}</strong> - {job.role} ({job.jobType})<br />
                                Skills: {(job.requiredSkills || []).map(s => `${s.name}(${s.weight})`).join(', ')}<br />
                                <button
                                    onClick={() => loadApplicants(job.id)}
                                    style={{ marginTop: '5px', padding: '5px 10px' }}
                                >
                                    View Recommended Applicants
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No jobs posted yet.</p>
                )}
            </section>

            {/* Recommended Applicants */}
            {selectedJob && (
                <section style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Recommended Applicants</h3>
                    {applicants.length > 0 ? (
                        <ul>
                            {applicants.map((a) => (
                                <li key={a.applicantId} style={{ marginBottom: '10px' }}>
                                    <strong>{a.name}</strong><br />
                                    Match Score: <strong>{Math.round(a.matchScore * 100)}%</strong><br />
                                    Matched Skills: {a.matchedSkills.join(', ') || 'None'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No matching applicants found.</p>
                    )}
                </section>
            )}
        </div>
    );
}
