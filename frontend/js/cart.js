const API_URL = 'http://localhost:5000/api';

const cartContainer = document.getElementById('cart-container');

async function loadCart() {
  const token = localStorage.getItem('token');

  if (!token) {
    cartContainer.innerHTML = `
      <div class="empty-state">
        <h2>Please Login</h2>
        <p>You need to login to view your shopping cart.</p>
        <a href="login.html" class="btn">Login</a>
      </div>
    `;
    return;
  }

  cartContainer.innerHTML = '<p>Loading cart...</p>';

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load cart');
    }

    if (!data || data.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to your cart and come back here.</p>
          <a href="products.html" class="btn">Continue Shopping</a>
        </div>
      `;
      return;
    }

    let total = 0;

    const cartItems = data
      .filter((item) => item.product)
      .map((item) => {
        const product = item.product;
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        return `
          <div class="cart-item">

            <img
              src="${product.image}"
              alt="${product.name}"
              class="cart-item-image"
            >

            <div class="cart-item-info">
              <p class="product-category">${product.category}</p>
              <h3>${product.name}</h3>
              <p>₹${product.price} each</p>
            </div>

            <div class="cart-quantity">
              <button
                type="button"
                onclick="updateQuantity('${product._id}', ${item.quantity - 1})"
                ${item.quantity <= 1 ? 'disabled' : ''}
              >
                −
              </button>

              <span>${item.quantity}</span>

              <button
                type="button"
                onclick="updateQuantity('${product._id}', ${item.quantity + 1})"
                ${item.quantity >= product.stock ? 'disabled' : ''}
              >
                +
              </button>
            </div>

            <strong class="cart-item-total">
              ₹${itemTotal}
            </strong>

            <button
              type="button"
              class="remove-btn"
              onclick="removeFromCart('${product._id}')"
            >
              Remove
            </button>

          </div>
        `;
      })
      .join('');

    cartContainer.innerHTML = `
      <div class="cart-layout">

        <div class="cart-items">
          ${cartItems}
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>

          <div class="summary-row">
            <span>Subtotal</span>
            <strong>₹${total}</strong>
          </div>

          <div class="summary-row">
            <span>Delivery</span>
            <strong>FREE</strong>
          </div>

          <hr>

          <div class="summary-total">
            <span>Total</span>
            <strong>₹${total}</strong>
          </div>

          <a href="checkout.html" class="btn checkout-btn">
            Proceed to Checkout
          </a>

          <a href="products.html" class="continue-shopping">
            Continue Shopping
          </a>
        </div>

      </div>
    `;

  } catch (error) {
    console.error(error);

    cartContainer.innerHTML = `
      <div class="empty-state">
        <h2>Unable to Load Cart</h2>
        <p>${error.message}</p>
        <button type="button" class="btn" onclick="loadCart()">
          Try Again
        </button>
      </div>
    `;
  }
}

async function updateQuantity(productId, quantity) {
  if (quantity < 1) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update quantity');
    }

    loadCart();

  } catch (error) {
    alert(error.message);
  }
}

async function removeFromCart(productId) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove product');
    }

    loadCart();

  } catch (error) {
    alert(error.message);
  }
}

loadCart();
