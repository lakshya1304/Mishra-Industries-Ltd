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

function showUpiInput() {
  const area = document.getElementById("upiInputArea");
  area.classList.toggle("hidden");

  // Allow typing without parent click interference
  document.getElementById("upiMainCard").onclick = null;
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
  };

  const rzp = new Razorpay(options);

  rzp.on("payment.failed", function (response) {
    alert("Payment Failed: " + response.error.description);
  });

  rzp.open();
}

/* ---------------- UPI DIRECT ---------------- */

async function initiateUPI() {
  const userUpi = document.getElementById("userUpiId").value.trim();

  if (!userUpi.includes("@")) {
    alert("Enter valid UPI ID");
    return;
  }

  const upiUrl = `upi://pay?pa=${COMPANY_UPI}&pn=Mishra%20Industries&am=${pendingOrder.totalAmount}&cu=INR&tn=OrderPayment`;

  // Open UPI App
  window.location.href = upiUrl;

  // Wait for user confirmation
  setTimeout(async () => {
    const confirmed = confirm(
      "Have you completed the payment in your UPI app?",
    );
    if (confirmed) {
      await finalizeTransaction("UPI", `UPI_${Date.now()}`);
      location.href = "order-success.html";
    }
  }, 4000);
}

/* ---------------- FINAL ORDER PROCESS ---------------- */

async function finalizeTransaction(method, transactionId = "N/A") {
  document.getElementById("methodContainer").classList.add("hidden");
  document.getElementById("statusBox").classList.remove("hidden");

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
    alert("Server error while saving order.");
  }
}

/* ---------------- COD ---------------- */

async function finalizeTransactionCOD() {
  await finalizeTransaction("COD", "COD_ORDER");
  location.href = "order-success.html";
}
