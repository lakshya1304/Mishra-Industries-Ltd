let selectedType = "customer";
let iti; // Variable to store intlTelInput instance

// Initialize the global phone selector
document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.querySelector("#regPhone");
  iti = window.intlTelInput(phoneInput, {
    separateDialCode: true,
    initialCountry: "in",
    preferredCountries: ["in", "us", "ae", "gb"],
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
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
  const fullName = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPass").value;
  const businessName = document.getElementById("regBusiness").value;

  // Get FULL phone number with country code
  const phone = iti.getNumber();

  const gstNumber =
    document.getElementById("regGST") ?
      document.getElementById("regGST").value.toUpperCase()
    : "";

  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  // Validate phone
  if (!iti.isValidNumber()) {
    return alert("Please enter a valid global phone number.");
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
          phone, // This now sends +CountryCodeNumber
          password,
          accountType: selectedType,
          businessName: selectedType === "retailer" ? businessName : undefined,
          gstNumber: selectedType === "retailer" ? gstNumber : undefined,
        }),
      },
    );

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("mishraUser", JSON.stringify(data));
      window.location.href = "shop.html";
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    console.error("Connection Error:", err);
    alert("Cannot connect to server. Ensure backend is running.");
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
