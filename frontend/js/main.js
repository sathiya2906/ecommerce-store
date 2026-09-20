const API_URL = 'https://ecommerce-store-jalc.onrender.com/api';

async function addToCart(productId, productName, button) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please login first to add items to cart');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    const originalText = button.textContent;

    button.textContent = '✓ Added!';
    button.style.backgroundColor = '#16a34a';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 2000);

    loadCartCount();

  } catch (error) {
    console.error(error);
    alert('Failed to add to cart. Please try again.');
  }
}


async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');

  if (!container) {
    return;
  }

  container.innerHTML = '<p>Loading products...</p>';

  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      throw new Error('Failed to load products');
    }

    const products = await response.json();

    const featuredProducts = products.slice(0, 6);

    if (featuredProducts.length === 0) {
      container.innerHTML = '<p>No products available.</p>';
      return;
    }

    container.innerHTML = featuredProducts
      .map(
        (product) => `
          <div class="product-card">
            <img 
              src="${product.image}" 
              alt="${product.name}"
            >

            <div class="product-card-content">
              <p class="product-category">
                ${product.category}
              </p>

              <h3>${product.name}</h3>

              <p class="product-description">
                ${product.description}
              </p>

              <div class="product-bottom">
                <strong>₹${product.price}</strong>

                <div class="product-actions">
                  <a 
                    href="product-details.html?id=${product._id}" 
                    class="btn btn-secondary"
                  >
                    View
                  </a>

                  <button 
                    class="btn btn-primary"
                    onclick="addToCart('${product._id}', '${product.name}', this)"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
      )
      .join('');

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p>
        Unable to load products. Please make sure the backend server is running.
      </p>
    `;
  }
}


function updateNavbar() {
  const navLinks = document.querySelector('.nav-links');

  if (!navLinks) {
    return;
  }

  const token = localStorage.getItem('token');
  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  if (token && user) {

    navLinks.innerHTML = `
      <a href="index.html">Home</a>

      <a href="products.html">Products</a>

      <a href="cart.html">
        Cart <span id="cart-count" class="cart-count">0</span>
      </a>

      <span class="user-name">
        Hi, ${user.name}
      </span>

      <button id="logout-btn" class="logout-btn">
        Logout
      </button>
    `;

    document
      .getElementById('logout-btn')
      .addEventListener('click', () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastOrder');

        window.location.href = 'index.html';
      });

    loadCartCount();

  } else {

    navLinks.innerHTML = `
      <a href="index.html">Home</a>

      <a href="products.html">Products</a>

      <a href="cart.html">
        Cart <span id="cart-count" class="cart-count">0</span>
      </a>

      <a href="login.html">Login</a>

      <a href="register.html">Register</a>
    `;
  }
}


async function loadCartCount() {
  const token = localStorage.getItem('token');
  const cartCount = document.getElementById('cart-count');

  if (!token || !cartCount) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return;
    }

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


document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadFeaturedProducts();
});
