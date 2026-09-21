async function testRegister() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jean Test',
        email: 'jeantest@example.com',
        password: 'Password123!'
      })
    });
    console.log('Register HTTP Status:', res.status);
    const json = await res.json();
    console.log('Register Response JSON:', json);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testRegister();
