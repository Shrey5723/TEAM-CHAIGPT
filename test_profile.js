
const fetch = require('node-fetch');

async function testProfile() {
    console.log('1. Logging in...');
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
    console.log('Login successful.');

    console.log('2. checking existing profile...');
    const getRes = await fetch('http://localhost:3000/api/applicant/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    // It might return 404 if not found, that's expected.
    if (getRes.status === 200) {
        console.log('Profile exists, attempting UPDATE...');
        const updateRes = await fetch('http://localhost:3000/api/applicant/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bio: 'Updated bio from test script ' + Date.now() })
        });
        const updateData = await updateRes.json();
        console.log('Update Result:', JSON.stringify(updateData, null, 2));
    } else {
        console.log('Profile not found (or error), attempting CREATE...');
        const createRes = await fetch('http://localhost:3000/api/applicant/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bio: 'Created bio from test script', linkedInUrl: 'https://linkedin.com/in/test' })
        });
        const createData = await createRes.json();
        console.log('Create Result:', JSON.stringify(createData, null, 2));
    }
}

testProfile();
