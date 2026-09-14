const API_URL = 'https://ecommerce-store-jalc.onrender.com/api';

const productDetailsContainer =
  document.getElementById('product-details');

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

async function loadProduct() {
  if (!productId) {
    productDetailsContainer.innerHTML = `
      <div class="empty-state">
        <h2>Product not found</h2>
        <p>No product ID was provided.</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/products/${productId}`
    );

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const product = await response.json();

    productDetailsContainer.innerHTML = `
      <div class="product-detail-card">

        <div class="product-detail-image">
          <img
            src="${product.image}"
            alt="${product.name}"
          >
        </div>

        <div class="product-detail-content">

          <p class="product-category">
            ${product.category}
          </p>

          <h1>${product.name}</h1>

          <div class="product-rating">
            ★ ${product.rating} / 5
          </div>

          <p class="product-detail-description">
            ${product.description}
          </p>

          <h2 class="product-detail-price">
            ₹${product.price}
          </h2>

          <p class="product-stock">
            ${product.stock > 0
              ? `${product.stock} items available`
              : 'Out of stock'}
          </p>

          ${
            product.stock > 0
              ? `
                <div class="quantity-control">
                  <label for="quantity">Quantity</label>

                  <div class="quantity-box">
                    <button type="button" id="decrease">−</button>
                    <span id="quantity">1</span>
                    <button type="button" id="increase">+</button>
                  </div>
                </div>

                <button
                  type="button"
                  id="add-to-cart"
                  class="btn add-cart-btn"
                >
                  Add to Cart
                </button>

                <p id="cart-message" class="cart-message"></p>
              `
              : ''
          }

          <a href="products.html" class="back-link">
            ← Back to Products
          </a>

        </div>

      </div>
    `;

    if (product.stock > 0) {
      setupQuantity(product.stock, productId);
    }

  } catch (error) {
    console.error(error);

    productDetailsContainer.innerHTML = `
      <div class="empty-state">
        <h2>Unable to load product</h2>
        <p>Please try again.</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
  }
}

function setupQuantity(stock, productId) {
  let quantity = 1;

  const quantityElement =
    document.getElementById('quantity');

  const decreaseButton =
    document.getElementById('decrease');

  const increaseButton =
    document.getElementById('increase');

  const addToCartButton =
    document.getElementById('add-to-cart');

  const cartMessage =
    document.getElementById('cart-message');

  decreaseButton.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      quantityElement.textContent = quantity;
    }
  });

  increaseButton.addEventListener('click', () => {
    if (quantity < stock) {
      quantity++;
      quantityElement.textContent = quantity;
    }
  });

  addToCartButton.addEventListener('click', async () => {

    const token = localStorage.getItem('token');

    if (!token) {
      cartMessage.textContent =
        'Please login to add products to your cart.';

      cartMessage.innerHTML +=
        ' <a href="login.html">Login</a>';

      return;
    }

    addToCartButton.disabled = true;
    addToCartButton.textContent = 'Adding...';

    try {
      const response = await fetch(
        `${API_URL}/cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            quantity
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product');
      }

      cartMessage.textContent =
        '✓ Product added to cart successfully!';

      addToCartButton.textContent = 'Added to Cart';

    } catch (error) {
      console.error(error);

      cartMessage.textContent = error.message;

      addToCartButton.disabled = false;
      addToCartButton.textContent = 'Add to Cart';
    }
  });
}

loadProduct();
