let selectedType = "customer";

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
  // 1. Grab values from your floating-label inputs
  const fullName = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const phone = document.getElementById("regPhone").value;
  const password = document.getElementById("regPass").value;
  const businessName = document.getElementById("regBusiness").value;
  const gstNumber =
    document.getElementById("regGST") ?
      document.getElementById("regGST").value.toUpperCase()
    : "";

  // 2. Simple Validation
  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  // GST Validation for Retailers
  if (selectedType === "retailer") {
    if (!businessName) return alert("Business Name is required for Retailers.");
    if (!gstNumber) return alert("GST Number is required for Retailers.");

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      return alert("Please enter a valid 15-digit GST number.");
    }
  }

  try {
    // 3. Send POST request to your Backend
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          accountType: selectedType,
          businessName: selectedType === "retailer" ? businessName : undefined,
          gstNumber: selectedType === "retailer" ? gstNumber : undefined,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      // 4. PERSISTENT LOGIN: Save user data to localStorage immediately
      localStorage.setItem("mishraUser", JSON.stringify(data));

      // 5. INSTANT REDIRECT: Go straight to shop without loading overlay
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
  const text = document.getElementById("strengthText");

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
  if (requirements.len) strength += 20;
  if (requirements.up) strength += 20;
  if (requirements.low) strength += 20;
  if (requirements.num) strength += 20;
  if (requirements.sym) strength += 20;

  bar.style.width = strength + "%";

  if (strength <= 40) {
    bar.className = "h-full transition-all duration-500 bg-red-500";
    text.innerText = "Security Status: At Risk";
    text.style.color = "#ef4444";
  } else if (strength <= 80) {
    bar.className = "h-full transition-all duration-500 bg-orange-500";
    text.innerText = "Strength: Medium (Almost there)";
    text.style.color = "#f97316";
  } else {
    bar.className = "h-full transition-all duration-500 bg-green-500";
    text.innerText = "Strength: Strong (Mishra Standard Secure)";
    text.style.color = "#22c55e";
  }
}
