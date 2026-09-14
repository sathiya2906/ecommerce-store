const API_URL = 'https://ecommerce-store-jalc.onrender.com/api';

const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

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
      .map(
        (product) => `
          <div class="product-card">

            <img
              src="${product.image.match(/\((https?:\/\/[^)]+)\)/)?.[1] || product.image}"
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

                <a
                  href="product-details.html?id=${product._id}"
                  class="btn"
                >
                  View
                </a>

              </div>

            </div>

          </div>
        `
      )
      .join('');

  } catch (error) {
    console.error(error);

    productsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load products</h3>
        <p>Please make sure the backend server is running.</p>
      </div>
    `;
  }
}

searchInput.addEventListener('input', loadProducts);
categoryFilter.addEventListener('change', loadProducts);

const urlParams = new URLSearchParams(window.location.search);
const initialCategory = urlParams.get('category');

if (initialCategory) {
  categoryFilter.value = initialCategory;
}

loadProducts();
