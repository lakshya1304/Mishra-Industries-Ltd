const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";

function loadCheckoutDetails() {
  // Try both common cart key names to avoid "empty cart" errors
  const cart =
    JSON.parse(localStorage.getItem("mishra_cart")) ||
    JSON.parse(localStorage.getItem("cart")) ||
    [];

  const user = JSON.parse(localStorage.getItem("mishraUser"));
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary"));

  // Only redirect if absolutely no items are found
  if (cart.length === 0) {
    alert(
      "⚠️ Connection Error: Your cart appears to be empty. Please return to the shop.",
    );
    location.href = "shop.html";
    return;
  }

  // Pre-fill shipping info from User profile
  if (user) {
    document.getElementById("custName").value =
      user.fullName || user.name || "";
    document.getElementById("custPhone").value = user.phone || "";
    document.getElementById("custAddress").value = user.address || "";
    document.getElementById("custCity").value = user.city || "";
    document.getElementById("custPin").value = user.pincode || "";
  }

  // Render items into the Bill section
  document.getElementById("cartCount").innerText = `${cart.length} ITEMS`;
  const container = document.getElementById("orderReviewItems");
  container.innerHTML = cart
    .map(
      (item) => `
    <div class="flex justify-between items-center text-[11px] font-bold bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
        <span>${item.quantity}x ${item.name}</span>
        <span>₹${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `,
    )
    .join("");

  // Logic to calculate bill if summary is missing in storage
  let subtotal = 0;
  if (summary && summary.subtotal) {
    subtotal = summary.subtotal;
  } else {
    subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // Update Display
  document.getElementById("displaySubtotal").innerText =
    `₹${subtotal.toLocaleString()}`;
  document.getElementById("displayGst").innerText = `₹${gst.toLocaleString()}`;
  document.getElementById("displayTotal").innerText =
    `₹${total.toLocaleString()}`;

  // Sync back to storage for final order placing
  localStorage.setItem(
    "mishra_bill_summary",
    JSON.stringify({ subtotal, gst, total }),
  );
  localStorage.setItem("mishra_cart", JSON.stringify(cart));
}

async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart"));
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary"));

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const city = document.getElementById("custCity").value.trim();
  const pin = document.getElementById("custPin").value.trim();
  const street = document.getElementById("custAddress").value.trim();

  if (!name || !phone || !street || !city || !pin) {
    return alert("⚠️ Please complete the shipping manifest.");
  }

  // Package order for Payment Gateway
  const pendingOrder = {
    customerName: name,
    phone: phone,
    address: `${street}, ${city} - ${pin}`,
    items: cart,
    totalAmount: summary.total,
    gstAmount: summary.gst,
    status: "Payment Pending",
  };

  localStorage.setItem("pending_mishra_order", JSON.stringify(pendingOrder));

  // Visual feedback before redirect
  document.getElementById("paymentSuccessOverlay").classList.remove("hidden");
  setTimeout(() => {
    location.href = "payment.html";
  }, 1500);
}

document.addEventListener("DOMContentLoaded", loadCheckoutDetails);
