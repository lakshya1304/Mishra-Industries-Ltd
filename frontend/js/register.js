let selectedType = "customer";

document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.querySelector("#regPhone");

  // Only allow digits for the mobile number field
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
});

function toggleType(type) {
  selectedType = type;
  const tabCust = document.getElementById("tabCustomer");
  const tabRet = document.getElementById("tabRetailer");
  const bizInp = document.getElementById("bizContainer");

  if (type === "customer") {
    tabCust.classList.add("active-tab");
    tabRet.classList.remove("active-tab");
    tabRet.classList.add("text-gray-400");
    bizInp.classList.add("hidden");
  } else {
    tabRet.classList.add("active-tab");
    tabCust.classList.remove("active-tab");
    tabCust.classList.add("text-gray-400");
    bizInp.classList.remove("hidden");
  }
}

async function handleRegistration() {
  const fullName = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPass").value;
  const businessName = document.getElementById("regBusiness").value.trim();
  const phone = document.getElementById("regPhone").value.trim();

  // GST extraction fix
  const gstInput = document.getElementById("regGST");
  const gstNumber = gstInput ? gstInput.value.toUpperCase().trim() : "";

  // Field validation
  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  // Basic validation (10 digits)
  if (phone.length !== 10) {
    return alert("Please enter a valid 10-digit mobile number.");
  }

  if (selectedType === "retailer") {
    if (!businessName) return alert("Business Name is required for Retailers.");
    if (!gstNumber) return alert("GST Number is required for Retailers.");

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber))
      return alert("Please enter a valid 15-digit GST number.");
  }

  try {
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone: phone,
          accountType: selectedType,
          businessName: selectedType === "retailer" ? businessName : undefined,
          gstNumber: selectedType === "retailer" ? gstNumber : undefined,
        }),
      },
    );

    const data = await response.json();

    if (response.status === 201 || response.ok) {
      // SUCCESS: Clear localStorage just in case and redirect
      alert("Registration Successful! Please login.");
      window.location.href = "login.html";
    } else {
      // ERROR: Show the exact message from the backend
      alert(
        data.message ||
          "Registration failed. Please try a different email or phone.",
      );
    }
  } catch (err) {
    console.error("Connection Error:", err);
    alert(
      "Cannot connect to server. Ensure backend is running and Atlas IP is whitelisted.",
    );
  }
}

function checkPasswordStrength() {
  const password = document.getElementById("regPass").value;
  const bar = document.getElementById("strengthBar");

  const requirements = {
    len: password.length >= 8,
    up: /[A-Z]/.test(password),
    low: /[a-z]/.test(password),
    num: /[0-9]/.test(password),
    sym: /[@$!%*?&]/.test(password),
  };

  Object.keys(requirements).forEach((req) => {
    const el = document.getElementById(`req-${req}`);
    if (el) {
      el.className =
        requirements[req] ?
          "requirement-item met font-black uppercase tracking-tighter"
        : "requirement-item unmet font-black uppercase tracking-tighter";
    }
  });

  let strength = 0;
  Object.values(requirements).forEach((met) => {
    if (met) strength += 20;
  });

  bar.style.width = strength + "%";
  bar.className =
    strength <= 40 ? "h-full transition-all duration-500 bg-red-500"
    : strength <= 80 ? "h-full transition-all duration-500 bg-orange-500"
    : "h-full transition-all duration-500 bg-green-500";
}
