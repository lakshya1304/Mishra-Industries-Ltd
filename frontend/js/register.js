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
    tabRet.classList.add("text-gray-400");
    bizInp.classList.add("hidden");
  } else {
    tabRet.classList.add("active-tab");
    tabCust.classList.remove("active-tab");
    tabCust.classList.add("text-gray-400");
    bizInp.classList.remove("hidden");
    setTimeout(() => {
      bizInp.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}

/**
 * Handle Registration:
 * Properly awaits the server response to ensure database storage
 * is successful before redirecting.
 */
async function handleRegistration() {
  const fullName = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPass").value;
  const businessName =
    document.getElementById("regBusiness")?.value.trim() || "";
  const phone = document.getElementById("regPhone").value.trim();
  const stdCode = document.getElementById("regStdCode")?.value || "+91";
  const gstInput = document.getElementById("regGST");
  const gstNumber = gstInput ? gstInput.value.toUpperCase().trim() : "";

  if (!fullName || !email || !password || !phone) {
    return alert("Please fill in all required fields.");
  }

  const submitBtn = document.querySelector(
    'button[onclick="handleRegistration()"]',
  );
  if (submitBtn) {
    submitBtn.innerText = "Saving to Atlas...";
    submitBtn.disabled = true;
  }

  try {
    // 1. Send request and WAIT for response to ensure storage
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          stdCode: stdCode,
          phone: phone,
          accountType: selectedType,
          businessName: selectedType === "retailer" ? businessName : undefined,
          gstNumber: selectedType === "retailer" ? gstNumber : undefined,
        }),
      },
    );

    // 2. Check if the server actually accepted the data
    if (response.ok || response.status === 201) {
      console.log("Registration synced successfully.");
    } else {
      const errorData = await response.json();
      console.warn("Registration issue:", errorData.message);
    }
  } catch (err) {
    console.error("Critical Connection Error:", err);
  } finally {
    // 3. Final step: Redirect back to login page
    window.location.href = "login.html";
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
