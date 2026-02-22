const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";

function loadCheckoutDetails() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart")) || [];
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary")) || {
    subtotal: 0,
    gst: 0,
    total: 0,
  };

  if (cart.length === 0) {
    location.href = "shop.html";
    return;
  }

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

  document.getElementById("displaySubtotal").innerText =
    `₹${summary.subtotal.toLocaleString()}`;
  document.getElementById("displayGst").innerText =
    `₹${summary.gst.toLocaleString()}`;
  document.getElementById("displayTotal").innerText =
    `₹${summary.total.toLocaleString()}`;
}

async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart"));
  const summary = JSON.parse(localStorage.getItem("mishra_bill_summary"));

  const name = document.getElementById("custName").value;
  const phone = document.getElementById("custPhone").value;
  const city = document.getElementById("custCity").value;
  const pin = document.getElementById("custPin").value;
  const street = document.getElementById("custAddress").value;

  if (!name || !phone || !street || !city || !pin) {
    return alert("⚠️ Please complete the shipping manifest.");
  }

  // Staging order for payment portal
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

  // Show transition overlay and redirect
  document.getElementById("paymentSuccessOverlay").classList.remove("hidden");
  setTimeout(() => {
    location.href = "payment.html";
  }, 1500);
}

document.addEventListener("DOMContentLoaded", loadCheckoutDetails);
