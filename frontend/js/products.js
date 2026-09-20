const API_URL = 'https://ecommerce-store-jalc.onrender.com/api';

const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Add product to cart
async function addToCart(productId, button) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please login first to add items to cart');
    window.location.href = 'login.html';
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Adding...';

  try {
    const response = await fetch(`${API_URL}/cart/add`, {
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

    button.textContent = '✓ Added!';
    button.style.backgroundColor = '#16a34a';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
      button.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('Add to cart error:', error);

    alert('Failed to add to cart. Please try again.');

    button.textContent = originalText;
    button.disabled = false;
  }
}

// Load products
async function loadProducts() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;

  productsContainer.innerHTML = '<p>Loading products...</p>';

  try {
    const params = new URLSearchParams();

    if (search) {
      params.append('search', search);
    }

    if (category) {
      params.append('category', category);
    }

    const queryString = params.toString();

    const response = await fetch(
      `${API_URL}/products${queryString ? `?${queryString}` : ''}`
    );

    if (!response.ok) {
      throw new Error('Failed to load products');
    }

    const products = await response.json();

    if (products.length === 0) {
      productsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No products found</h3>
          <p>Try a different search or category.</p>
        </div>
      `;

      return;
    }

    productsContainer.innerHTML = products
      .map((product) => {
        const imageUrl =
          product.image?.match(/\((https?:\/\/[^)]+)\)/)?.[1] ||
          product.image ||
          '';

        return `
          <div class="product-card">

            <img
              src="${imageUrl}"
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
                    onclick="addToCart('${product._id}', this)"
                  >
                    Add to Cart
                  </button>

                </div>

              </div>

            </div>

          </div>
        `;
      })
      .join('');

  } catch (error) {
    console.error('Load products error:', error);

    productsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load products</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

// Search and category filter
searchInput.addEventListener('input', loadProducts);
categoryFilter.addEventListener('change', loadProducts);

// Set initial category
const urlParams = new URLSearchParams(window.location.search);
const initialCategory = urlParams.get('category');

if (initialCategory) {
  categoryFilter.value = initialCategory;
}

// Load products when page opens
loadProducts();
