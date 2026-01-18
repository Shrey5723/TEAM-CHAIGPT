
const fetch = require('node-fetch');

async function testCgpaUpdate() {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john.developer@example.com', password: 'password123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('Login failed:', loginData);
        return;
    }

    const token = loginData.data.token;
    console.log('Got token, proceeding to update CGPA...');

    // 2. Update CGPA
    const cgpaRes = await fetch('http://localhost:3000/api/applicant/resume/cgpa', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cgpa: '8.9/10' })
    });

    const cgpaData = await cgpaRes.json();
    console.log('Update Result:', JSON.stringify(cgpaData, null, 2));
}

testCgpaUpdate();
