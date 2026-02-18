// Hardened Mishra Industries Cart Engine
let cart = [];

// 1. Initial Data Load with Safety Gate
try {
  // Attempt to load from localStorage, handle cases where browser blocks access
  const savedData = localStorage.getItem("mishraCart");
  cart = savedData ? JSON.parse(savedData) : [];
} catch (e) {
  console.error(
    "Mishra Industries: Storage Access Denied by Browser. Turn off Tracking Prevention.",
    e,
  );
  cart = [];
}

/**
 * 2. Add to Cart Function
 * Handles pricing strings like "₹1,500" and converts to pure numbers
 */
function addToCart(name, price, qty = 1) {
  const qtyToAdd = parseInt(qty) || 1;

  // Hardened Pricing Fix: Strip symbols (₹, ,) to prevent ₹0 Subtotal
  const cleanPrice =
    typeof price === "string" ?
      parseFloat(price.replace(/[^0-9.]/g, ""))
    : parseFloat(price);

  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += qtyToAdd;
  } else {
    cart.push({
      name: name,
      price: cleanPrice,
      quantity: qtyToAdd,
    });
  }

  saveAndRefresh(name, qtyToAdd);
}

/**
 * 3. Save & Global UI Update
 * Syncs memory with storage and re-calculates all pricing
 */
function saveAndRefresh(lastAddedName = null, qty = 0) {
  try {
    localStorage.setItem("mishraCart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save to local storage. Check browser permissions.");
  }

  updateCartBadge();
  renderCart();

  if (lastAddedName) {
    showNotification(lastAddedName, qty);
  }
}

/**
 * 4. UI Rendering & Subtotal Calculation
 * Directly solves the ₹0 Subtotal bug by forcing math on every render
 */
function renderCart() {
  const cartItemsList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItemsList) return;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-slate-300">
                <i class="fas fa-shopping-basket text-4xl mb-4 opacity-20"></i>
                <p class="font-black uppercase text-[10px] tracking-widest">Basket is empty</p>
            </div>`;
    if (cartTotal) cartTotal.innerText = "₹0";
    return;
  }

  let html = "";
  let grandTotal = 0;

  cart.forEach((item) => {
    // Force calculation using numbers
    const lineTotal = (item.price || 0) * (item.quantity || 0);
    grandTotal += lineTotal;

    html += `
            <div class="flex items-center justify-between border-b border-slate-50 pb-4 mb-4 animate__animated animate__fadeIn">
                <div class="flex flex-col text-left">
                    <span class="font-black text-blue-900 text-sm">${item.name}</span>
                    <span class="text-xs text-orange-500 font-bold uppercase">₹${(item.price || 0).toLocaleString("en-IN")}</span>
                </div>
                <div class="flex items-center space-x-3 bg-slate-50 p-1 rounded-xl">
                    <button onclick="changeQuantity('${item.name}', -1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-red-50 hover:text-red-500">-</button>
                    <span class="text-xs font-black text-blue-900 w-4 text-center">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-green-50 hover:text-green-500">+</button>
                    <button onclick="deleteProduct('${item.name}')" class="ml-1 text-slate-300 hover:text-red-500 transition-colors">
                        <i class="fas fa-trash-alt text-[10px]"></i>
                    </button>
                </div>
            </div>`;
  });

  cartItemsList.innerHTML = html;

  // Updates the Sidebar Total with the Indian Rupee format
  if (cartTotal) {
    cartTotal.innerText = "₹" + grandTotal.toLocaleString("en-IN");
  }
}

/**
 * 5. Helper Functions
 */
function changeQuantity(name, amount) {
  const item = cart.find((i) => i.name === name);
  if (item) {
    item.quantity += amount;
    if (item.quantity <= 0) deleteProduct(name);
    else saveAndRefresh();
  }
}

function deleteProduct(name) {
  cart = cart.filter((item) => item.name !== name);
  saveAndRefresh();
}

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.innerText = totalItems;
}

/**
 * 6. Notification System
 */
let isNotificationActive = false;
function showNotification(name, qty) {
  if (isNotificationActive) return;
  isNotificationActive = true;

  const toast = document.getElementById("cartToast");
  if (toast) {
    const toastName = document.getElementById("toastProductName");
    if (toastName) toastName.innerText = `${qty} x ${name}`;
    toast.style.top = "20px";
    setTimeout(() => {
      toast.style.top = "-100px";
      isNotificationActive = false;
    }, 3000);
  } else {
    alert(`✅ ${qty} x ${name} added to Mishra Industries basket.`);
    isNotificationActive = false;
  }
}

// Ensure the UI is ready on every page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCart();
});
