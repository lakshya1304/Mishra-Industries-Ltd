let selectedType = "customer";

document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.querySelector("#regPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
    phoneInput.addEventListener("touchstart", function (e) {
      if (window.innerWidth < 768) {
        this.style.fontSize = "16px";
      }
    });
  }
});

function toggleType(type) {
  selectedType = type;
  const tabCust = document.getElementById("tabCustomer");
  const tabRet = document.getElementById("tabRetailer");
  const bizInp = document.getElementById("bizContainer");

  if (type === "customer") {
    tabCust.classList.add("active-tab");
    tabRet.classList.remove("active-tab");
    bizInp.classList.add("hidden");
  } else {
    tabRet.classList.add("active-tab");
    tabCust.classList.remove("active-tab");
    bizInp.classList.remove("hidden");
    setTimeout(() => {
      bizInp.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}

/**
 * Handle Registration:
 * Fired with a small delay to ensure data is sent to Database
 * before the page redirect occurs.
 */
async function handleRegistration() {
  const fullName = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPass").value;
  const businessName =
    document.getElementById("regBusiness")?.value.trim() || "";
  const phone = document.getElementById("regPhone").value.trim();
  const gstInput = document.getElementById("regGST");
  const gstNumber = gstInput ? gstInput.value.toUpperCase().trim() : "";

  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  const submitBtn = document.querySelector(
    'button[onclick="handleRegistration()"]',
  );
  if (submitBtn) {
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;
  }

  // 1. Fire the request to the database
  fetch("https://mishra-industries-ltd-yjfr.onrender.com/api/auth/register", {
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
  });

  // 2. WAIT for 500ms so the request isn't cancelled by the browser
  // Then redirect to login.
  setTimeout(() => {
    window.location.href = "login.html";
  }, 600);
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
          "requirement-item met font-black uppercase tracking-tighter text-[9px] md:text-[10px]"
        : "requirement-item unmet font-black uppercase tracking-tighter text-[9px] md:text-[10px]";
    }
  });

  let strength = 0;
  Object.values(requirements).forEach((met) => {
    if (met) strength += 20;
  });

  if (bar) {
    bar.style.width = strength + "%";
    bar.className =
      strength <= 40 ? "h-full transition-all duration-500 bg-red-500"
      : strength <= 80 ? "h-full transition-all duration-500 bg-orange-500"
      : "h-full transition-all duration-500 bg-green-500";
  }
}
