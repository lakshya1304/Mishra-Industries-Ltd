/**
 * Mishra Industries - Login & Password Recovery Logic
 * Connected to: http://localhost:5000/api/auth
 */

let currentType = 'customer';

// --- UI Toggle Functions ---

function setLoginType(type) {
    currentType = type;
    const btnCust = document.getElementById('btnCustomer');
    const btnRet = document.getElementById('btnRetailer');
    const businessField = document.getElementById('businessField');
    const header = document.getElementById('loginHeader');

    if (type === 'customer') {
        btnCust.classList.add('active-type');
        btnRet.classList.remove('active-type');
        businessField.classList.add('hidden');
        header.innerText = "Customer Login";
    } else {
        btnRet.classList.add('active-type');
        btnCust.classList.remove('active-type');
        businessField.classList.remove('hidden');
        header.innerText = "Retailer Login";
    }
}

function openForgotModal() {
    document.getElementById('otpModal').classList.remove('hidden');
    document.getElementById('emailStep').classList.remove('hidden');
    document.getElementById('otpStep').classList.add('hidden');
}

function closeForgotModal() {
    document.getElementById('otpModal').classList.add('hidden');
}

// --- API Integration Functions ---

/**
 * Handle Login via Backend API
 */
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    const businessName = document.getElementById('loginBusiness').value;

    if (!email || !password) {
        return alert("Please enter both email and password.");
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                accountType: currentType,
                businessName: currentType === 'retailer' ? businessName : undefined
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save Session (JWT and User Details)
            localStorage.setItem("Mishra_Session", JSON.stringify(data));
            alert(`Welcome back, ${data.fullName}!`);
            window.location.href = 'index.html';
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
    const email = document.getElementById('resetEmail').value;

    if (!email.includes('@')) {
        return alert("Please enter a valid Gmail address.");
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Success! A real OTP has been sent to your Gmail.");
            document.getElementById('emailStep').classList.add('hidden');
            document.getElementById('otpStep').classList.remove('hidden');
        } else {
            alert(data.message || "Email not found in our records.");
        }
    } catch (err) {
        console.error("OTP Request Error:", err);
        alert("Failed to reach the email server. Check your internet or backend.");
    }
}

/**
 * Verify OTP and Log User In
 */
async function verifyOTP() {
    const email = document.getElementById('resetEmail').value;
    const otp = document.getElementById('inputOTP').value;

    if (otp.length !== 6) {
        return alert("Please enter the 6-digit code.");
    }

    try {
        // We call a verification endpoint (Create this in backend next)
        const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("Mishra_Session", JSON.stringify(data));
            alert("OTP Verified Successfully! Logging you in...");
            window.location.href = 'index.html';
        } else {
            alert(data.message || "Invalid or expired OTP.");
        }
    } catch (err) {
        console.error("OTP Verification Error:", err);
        alert("Verification failed. Server error.");
    }
}