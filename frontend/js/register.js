const API_URL = 'http://' + 'localhost' + ':5000/api';

const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    registerMessage.textContent = 'Passwords do not match';
    return;
  }

  if (password.length < 6) {
    registerMessage.textContent = 'Password must be at least 6 characters';
    return;
  }

  registerMessage.textContent = 'Creating account...';

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    registerMessage.textContent = 'Account created successfully!';

    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 800);

  } catch (error) {
    console.error(error);
    registerMessage.textContent = error.message;
  }
});
