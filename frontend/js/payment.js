const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";
const RAZORPAY_KEY = "rzp_test_SIoHu8r1UyV1bT";
const COMPANY_UPI = "sachinmishrapb@upi";

const pendingOrder = JSON.parse(localStorage.getItem("pending_mishra_order"));
const user = JSON.parse(localStorage.getItem("mishraUser"));

if (!pendingOrder) {
  location.href = "shop.html";
} else {
  document.getElementById("payAmount").innerText =
    `₹${pendingOrder.totalAmount.toLocaleString()}`;
  document.getElementById("orderIdTag").innerText =
    `Order #MI-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ---------------- UPI INPUT FIX ---------------- */

/**
 * Mobile-Optimized: Toggle UPI input area and prevent parent clicks
 */
function showUpiInput() {
  const area = document.getElementById("upiInputArea");
  if (area) {
    area.classList.toggle("hidden");
    // Ensure the input scrolls into view on small screens
    if (!area.classList.contains("hidden")) {
      area.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Allow typing without parent click interference
  const upiCard = document.getElementById("upiMainCard");
  if (upiCard) upiCard.onclick = null;
}

/* ---------------- RAZORPAY ---------------- */

function initiateRazorpay() {
  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(pendingOrder.totalAmount * 100),
    currency: "INR",
    name: "Mishra Industries",
    description: "Secure Order Payment",
    image: "./images/logo.jpeg",
    handler: async function (response) {
      await finalizeTransaction("Razorpay", response.razorpay_payment_id);
      location.href = "order-success.html";
    },
    prefill: {
      name: pendingOrder.customerName,
      contact: pendingOrder.phone,
      email: pendingOrder.email || "",
    },
    theme: { color: "#1e3a8a" },
    // Enable better modal behavior on mobile browsers
    modal: {
      ondismiss: function () {
        console.log("Checkout form closed by user");
      },
    },
  };

  const rzp = new Razorpay(options);

  rzp.on("payment.failed", function (response) {
    alert("Payment Failed: " + response.error.description);
  });

  rzp.open();
}

/* ---------------- UPI DIRECT ---------------- */

/**
 * Optimized for Mobile Deep Linking: Handles redirects to UPI apps
 */
async function initiateUPI() {
  const userUpi = document.getElementById("userUpiId").value.trim();

  if (!userUpi.includes("@")) {
    alert("Enter valid UPI ID");
    return;
  }

  const upiUrl = `upi://pay?pa=${COMPANY_UPI}&pn=Mishra%20Industries&am=${pendingOrder.totalAmount}&cu=INR&tn=OrderPayment`;

  // Visual feedback for mobile user
  const upiBtn = document.querySelector("#upiInputArea button");
  if (upiBtn) upiBtn.innerText = "Redirecting...";

  // Open UPI App
  window.location.href = upiUrl;

  // Wait for user confirmation (Increased delay for mobile task-switching)
  setTimeout(async () => {
    const confirmed = confirm(
      "Have you completed the payment in your UPI app?",
    );
    if (confirmed) {
      await finalizeTransaction("UPI", `UPI_${Date.now()}`);
      location.href = "order-success.html";
    } else {
      if (upiBtn) upiBtn.innerText = "Pay via UPI App";
    }
  }, 5000);
}

/* ---------------- FINAL ORDER PROCESS ---------------- */

/**
 * Responsive Transition: Hides method container and shows centered status box
 */
async function finalizeTransaction(method, transactionId = "N/A") {
  const container = document.getElementById("methodContainer");
  const statusBox = document.getElementById("statusBox");

  if (container) container.classList.add("hidden");
  if (statusBox) {
    statusBox.classList.remove("hidden");
    // Ensure the status box is centered on mobile viewports
    statusBox.scrollIntoView({ behavior: "smooth" });
  }

  const finalOrderData = {
    ...pendingOrder,
    paymentMethod: method,
    transactionId: transactionId,
    status: method === "COD" ? "Pending" : "Paid",
    orderDate: new Date(),
  };

  try {
    const response = await fetch(`${API_BASE}/api/orders/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token || ""}`,
      },
      body: JSON.stringify(finalOrderData),
    });

    if (response.ok) {
      localStorage.setItem(
        "last_order_customer",
        JSON.stringify(finalOrderData),
      );
      localStorage.removeItem("mishra_cart");
      localStorage.removeItem("pending_mishra_order");
    } else {
      alert("Order saving failed in backend.");
    }
  } catch (err) {
    console.error("Order Sync Error:", err);
    alert("Server error while saving order.");
  }
}

/* ---------------- COD ---------------- */

async function finalizeTransactionCOD() {
  // Mobile touch feedback
  const codBtn = document.querySelector(
    "button[onclick='finalizeTransactionCOD()']",
  );
  if (codBtn) codBtn.innerText = "Processing COD...";

  await finalizeTransaction("COD", "COD_ORDER");
  location.href = "order-success.html";
}

// Ensure proper mobile focus management
document.addEventListener("DOMContentLoaded", () => {
  const upiInput = document.getElementById("userUpiId");
  if (upiInput) {
    upiInput.addEventListener("focus", () => {
      // Prevent mobile keyboard from squashing the UI
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
});
