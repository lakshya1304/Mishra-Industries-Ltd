const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";
const pendingOrder = JSON.parse(localStorage.getItem("pending_mishra_order"));
const UPI_ID = "9431775160@ibl";

if (!pendingOrder) {
  location.href = "shop.html";
} else {
  document.getElementById("payAmount").innerText =
    `₹${pendingOrder.totalAmount.toLocaleString()}`;
}

/**
 * Mobile UPI Deep Linking
 * This opens GPay/PhonePe directly on mobile devices
 */
function initiateUPI() {
  const amount = pendingOrder.totalAmount;
  const name = encodeURIComponent("Mishra Industries");
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${name}&am=${amount}&cu=INR`;

  // Attempt to open the UPI app
  window.location.href = upiUrl;

  // After a delay, ask user if they completed the payment
  setTimeout(() => {
    if (confirm("Have you completed the payment in your UPI app?")) {
      finalizeTransaction("UPI_PAID");
    }
  }, 5000);
}

async function finalizeTransaction(method) {
  const statusBox = document.getElementById("statusBox");
  const cards = document.querySelectorAll(".pay-card");

  // Hide options and show processing
  cards.forEach((c) => c.classList.add("hidden"));
  statusBox.classList.remove("hidden");

  const finalOrderData = {
    ...pendingOrder,
    paymentMethod: method,
    status:
      method === "COD" ? "Confirmed (COD)" : "Confirmed (UPI Pending Verify)",
  };

  try {
    const response = await fetch(`${API_BASE}/api/orders/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalOrderData),
    });

    if (response.ok) {
      localStorage.setItem(
        "last_order_customer",
        JSON.stringify({
          name: finalOrderData.customerName,
          address: finalOrderData.address,
        }),
      );
      localStorage.removeItem("pending_mishra_order");
      localStorage.removeItem("mishra_cart"); // Clean cart on success

      setTimeout(() => {
        location.href = "order-success.html";
      }, 2000);
    }
  } catch (err) {
    alert("Fulfillment Node Error. Please try again.");
    location.reload();
  }
}
