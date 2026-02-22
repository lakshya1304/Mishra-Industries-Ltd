const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com/api";

function loadCheckoutDetails() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart")) || [];
  const user = JSON.parse(localStorage.getItem("mishraUser"));
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary"));

  if (cart.length === 0) {
    alert("⚠️ Your cart is empty. Redirecting to shop.");
    window.location.href = "shop.html";
    return;
  }

  // Mandatory Login Logic
  if (!user || !user.token) {
    alert(
      "🔐 Authentication Required: Please login to Mishra Industries to proceed with payment.",
    );
    window.location.href = "login.html";
    return;
  }

  // Pre-fill user data
  document.getElementById("custName").value = user.fullName || user.name || "";
  document.getElementById("custPhone").value = user.phone || "";
  document.getElementById("custAddress").value = user.address || "";
  document.getElementById("custCity").value = user.city || "";
  document.getElementById("custPin").value = user.pincode || "";

  const container = document.getElementById("orderReviewItems");
  container.innerHTML = cart
    .map(
      (item) => `
    <div class="flex justify-between items-center text-[11px] font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
        <div class="flex flex-col">
          <span>${item.name}</span>
          <span class="text-[9px] opacity-50 font-normal">Qty: ${item.quantity}</span>
        </div>
        <span>₹${(item.price * item.quantity).toLocaleString()}</span>
    </div>`,
    )
    .join("");

  if (summary) {
    document.getElementById("displaySubtotal").innerText =
      `₹${summary.subtotal.toLocaleString()}`;
    document.getElementById("displayGst").innerText =
      `₹${summary.gst.toLocaleString()}`;
    document.getElementById("displayTotal").innerText =
      `₹${summary.total.toLocaleString()}`;
  }
}

async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart"));
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary"));
  const user = JSON.parse(localStorage.getItem("mishraUser"));

  // Check login again just in case
  if (!user || !user.token) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const city = document.getElementById("custCity").value.trim();
  const pin = document.getElementById("custPin").value.trim();

  if (!name || !phone || !address) {
    return alert("⚠️ Please provide full shipping details.");
  }

  const fullAddress = `${address}, ${city} - ${pin}`;

  // Pack order for Payment Page AND Backend Sync
  const orderData = {
    customerName: name,
    phone: phone,
    address: fullAddress,
    items: cart,
    totalAmount: summary.total,
    userId: user._id, // Connected to User ID
    status: "Payment Pending",
  };

  localStorage.setItem("pending_mishra_order", JSON.stringify(orderData));

  // Show transition overlay and redirect
  document.getElementById("paymentSuccessOverlay").classList.remove("hidden");
  setTimeout(() => {
    window.location.href = "payment.html";
  }, 1200);
}

document.addEventListener("DOMContentLoaded", loadCheckoutDetails);
