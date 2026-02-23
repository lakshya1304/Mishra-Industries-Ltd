let selectedType = "customer";
let iti;

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

  // Allow ONLY digits while typing
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
  const businessName =
    document.getElementById("regBusiness") ?
      document.getElementById("regBusiness").value.trim()
    : "";
  const phoneInput = document.getElementById("regPhone");

  // Get Dial Code and Number separately
  const countryData = iti.getSelectedCountryData();
  const stdCode = `+${countryData.dialCode}`;
  const phone = phoneInput.value.trim();

  const gstNumber =
    document.getElementById("regGST") ?
      document.getElementById("regGST").value.toUpperCase().trim()
    : "";

  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  // Verification based on selected country flag
  if (!iti.isValidNumber()) {
    return alert("Phone number is not valid for the selected country flag.");
  }

  if (selectedType === "retailer") {
    if (!businessName) return alert("Business Name required for Retailer.");
    if (!gstNumber) return alert("GST Number required for Retailer.");
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
          stdCode,
          phone,
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
      // Shows exact error from backend validator
      alert(data.message || data.error || "Registration failed");
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
    if (el)
      el.className =
        requirements[req] ?
          "requirement-item met font-black uppercase tracking-tighter"
        : "requirement-item unmet font-black uppercase tracking-tighter";
  });

  let strength = 0;
  Object.values(requirements).forEach((met) => {
    if (met) strength += 20;
  });
  bar.style.width = strength + "%";
  bar.className =
    strength <= 40 ? "h-full bg-red-500"
    : strength <= 80 ? "h-full bg-orange-500"
    : "h-full bg-green-500";
}
