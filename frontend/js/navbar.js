const NAVBAR_API_URL = 'https://ecommerce-store-jalc.onrender.com/api';

function updateNavbar() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="cart.html">Cart <span id="cart-count" class="cart-count">0</span></a>
      <span class="user-name">Hi, ${user.name}</span>
      <button id="logout-btn" class="logout-btn">Logout</button>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });

    loadCartCount();
  } else {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="cart.html">Cart <span id="cart-count" class="cart-count">0</span></a>
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

async function loadCartCount() {
  const token = localStorage.getItem('token');
  const cartCount = document.getElementById('cart-count');

  if (!token || !cartCount) return;

  try {
    const response = await fetch(`${NAVBAR_API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const cart = await response.json();

    const totalQuantity = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cartCount.textContent = totalQuantity;
  } catch (error) {
    console.error('Failed to load cart count:', error);
  }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
