// Corrected Cart Engine for Mishra Industries
let cart = JSON.parse(localStorage.getItem("mishra_cart")) || [];

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name: name, price: price, quantity: 1 });
  }
  saveAndRefresh();
  alert(name + " added to cart!");
}

function changeQuantity(name, amount) {
  const item = cart.find((item) => item.name === name);
  if (item) {
    item.quantity += amount;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.name !== name);
    }
    saveAndRefresh();
  }
}

function saveAndRefresh() {
  localStorage.setItem("mishra_cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");

  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.innerText = totalItems;

  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML =
        '<p class="text-center py-10 text-gray-400">Your cart is empty.</p>';
      if (cartTotal) cartTotal.innerText = "₹0.00";
      return;
    }

    let html = "";
    let grandTotal = 0;

    cart.forEach((item) => {
      grandTotal += item.price * item.quantity;
      // This part creates the visual design for each item
      html += `
            <div class="flex items-center justify-between border-b pb-4 mb-4">
                <div class="flex flex-col">
                    <span class="font-bold text-gray-800 text-sm">${item.name}</span>
                    <span class="text-xs text-blue-600 font-bold">₹${item.price}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="changeQuantity('${item.name}', -1)" class="bg-gray-100 px-2 rounded hover:bg-orange-500 hover:text-white">-</button>
                    <span class="text-sm font-bold">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)" class="bg-gray-100 px-2 rounded hover:bg-orange-500 hover:text-white">+</button>
                </div>
            </div>`;
    });

    cartItemsList.innerHTML = html;
    if (cartTotal) cartTotal.innerText = "₹" + grandTotal.toLocaleString();
  }
}

document.addEventListener("DOMContentLoaded", renderCart);

function showCartToast(name) {
    const toast = document.getElementById('cartToast');
    const toastName = document.getElementById('toastProductName');
    const toastBadge = document.getElementById('toastCartCount');
    const audio = document.getElementById('successSound'); // Get the audio
    
    if(!toast) return;

    // 1. Play Sound
    if(audio) {
        audio.currentTime = 0; // Reset to start if clicked rapidly
        audio.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
    }

    const cart = JSON.parse(localStorage.getItem("Mishra_Cart")) || [];
    
    if(toastBadge) toastBadge.innerText = cart.length;
    if(toastName) toastName.innerText = name;
    
    toast.style.top = "20px";
    
    setTimeout(() => {
        toast.style.top = "-100px";
    }, 3000);
}