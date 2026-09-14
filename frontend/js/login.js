const API_URL = 'https://' + 'ecommerce-store-jalc.onrender.com/api';

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginMessage.textContent = 'Logging in...';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    loginMessage.textContent = 'Login successful!';

    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 800);

  } catch (error) {
    console.error(error);
    loginMessage.textContent = error.message;
  }
});