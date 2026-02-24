/**
 * Mishra Industries - Login & Password Recovery Logic
 * Connected to: https://mishra-industries-ltd-yjfr.onrender.com/api/auth
 */

let currentType = "customer";
let countdown;

// --- UI Toggle Functions ---

/**
 * Optimized for mobile: Ensures active states are clear on touch screens
 */
function setLoginType(type) {
  currentType = type;
  const btnCust = document.getElementById("btnCustomer");
  const btnRet = document.getElementById("btnRetailer");
  const businessField = document.getElementById("businessField");
  const header = document.getElementById("loginHeader");

  if (type === "customer") {
    btnCust.classList.add("active-type");
    btnRet.classList.remove("active-type");
    businessField.classList.add("hidden");
    header.innerText = "Customer Login";
  } else {
    btnRet.classList.add("active-type");
    btnCust.classList.remove("active-type");
    businessField.classList.remove("hidden");
    header.innerText = "Retailer Login";
  }
}

/**
 * Mobile Fix: Disables background scroll when modal is open for better UX
 */
function openForgotModal() {
  const modal = document.getElementById("otpModal");
  modal.classList.remove("hidden");
  modal.style.display = "flex"; // Ensures centering on mobile
  document.getElementById("emailStep").classList.remove("hidden");
  document.getElementById("otpStep").classList.add("hidden");
  document.body.style.overflow = "hidden";
}

function closeForgotModal() {
  const modal = document.getElementById("otpModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
  document.body.style.overflow = "auto"; // Restores scroll
  clearInterval(countdown);
}

// --- API Integration Functions ---

/**
 * Handle Login via Backend API
 */
async function handleLogin() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPass").value;
  const businessName = document.getElementById("loginBusiness")?.value || "";

  if (!email || !password) {
    return alert("Please enter both email and password.");
  }

  try {
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          accountType: currentType,
          businessName: currentType === "retailer" ? businessName : undefined,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      // Corrected Key to 'mishraUser' to sync with Index/Shop navigation
      localStorage.setItem("mishraUser", JSON.stringify(data));
      window.location.href = "shop.html";
    } else {
      alert(data.message || "Invalid Credentials");
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Server is offline. Please start the backend.");
  }
}

/**
 * Handle Forgot Password - Request Real Gmail OTP from Backend
 */
async function sendOTP() {
  const email = document.getElementById("resetEmail").value;
  const sendBtn = document.getElementById("sendOtpBtn");

  if (!email.includes("@")) {
    return alert("Please enter a valid Gmail address.");
  }

  // Visual feedback for mobile users
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
  sendBtn.disabled = true;

  try {
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      alert("Success! A real OTP has been sent to your Gmail.");
      document.getElementById("emailStep").classList.add("hidden");
      document.getElementById("otpStep").classList.remove("hidden");
      document.getElementById("resendBtn").classList.add("hidden");
      startTimer(180); // Start 3-minute timer
    } else {
      alert(data.message || "Email not found in our records.");
    }
  } catch (err) {
    console.error("OTP Request Error:", err);
    alert("Failed to reach the email server.");
  } finally {
    sendBtn.innerHTML = "Send OTP";
    sendBtn.disabled = false;
  }
}

/**
 * Timer Logic for OTP Expiry
 */
function startTimer(duration) {
  let timer = duration,
    minutes,
    seconds;
  clearInterval(countdown);
  const timerDisplay = document.getElementById("timer");
  if (!timerDisplay) return;

  const timerText = timerDisplay.parentElement;
  timerText.classList.remove("hidden");

  countdown = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    timerDisplay.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    if (--timer < 0) {
      clearInterval(countdown);
      document.getElementById("resendBtn").classList.remove("hidden");
      timerText.classList.add("hidden");
    }
  }, 1000);
}

/**
 * Verify OTP and Update Password Permanently
 */
async function handleResetPassword() {
  const email = document.getElementById("resetEmail").value;
  const otp = document.getElementById("inputOTP").value;
  const newPassword = document.getElementById("newResetPass").value;

  if (otp.length !== 6) {
    return alert("Please enter the 6-digit code.");
  }

  if (!newPassword) {
    return alert("Please enter your new password.");
  }

  try {
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      alert(
        "Password updated permanently! Please login with your new credentials.",
      );
      closeForgotModal();
      location.reload();
    } else {
      alert(data.message || "Invalid or expired OTP.");
    }
  } catch (err) {
    console.error("Reset Error:", err);
    alert("Reset failed. Server error.");
  }
}

// Global listener to ensure modal closes on ESC key for desktop admins
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeForgotModal();
});
