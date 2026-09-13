const API_URL = 'http://' + 'localhost' + ':5000/api';

const token = localStorage.getItem('token');

const checkoutItems = document.getElementById('checkout-items');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const checkoutMessage = document.getElementById('checkout-message');

let cartItems = [];

if (!token) {
  window.location.href = 'login.html';
}

async function loadCheckoutCart() {
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

    cartItems = data;

    if (cartItems.length === 0) {
      checkoutItems.innerHTML = `
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some products before checkout.</p>
          <a href="products.html" class="btn">Shop Products</a>
        </div>
      `;

      checkoutForm.style.display = 'none';
      return;
    }

    let total = 0;

    checkoutItems.innerHTML = cartItems.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      return `
        <div class="checkout-item">
          <img src="${item.product.image}" alt="${item.product.name}">
          <div>
            <h3>${item.product.name}</h3>
            <p>Qty: ${item.quantity}</p>
          </div>
          <strong>₹${itemTotal}</strong>
        </div>
      `;
    }).join('');

    checkoutSubtotal.textContent = `₹${total}`;
    checkoutTotal.textContent = `₹${total}`;

  } catch (error) {
    console.error(error);

    checkoutItems.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load cart</h3>
        <p>Please try again.</p>
      </div>
    `;
  }
}

checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();

  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;

  checkoutMessage.textContent = 'Placing your order...';

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName,
          address,
          city,
          state,
          pincode
        },
        paymentMethod
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }

    localStorage.setItem('lastOrder', JSON.stringify(data.order));

    checkoutMessage.textContent = 'Order placed successfully!';

    setTimeout(() => {
      window.location.href = 'order-success.html';
    }, 800);

  } catch (error) {
    console.error(error);
    checkoutMessage.textContent = error.message;
  }
});

loadCheckoutCart();
