// Main Site Controller - Mishra Industries
document.addEventListener("DOMContentLoaded", () => {
  console.log("Mishra Industries Site Loaded Successfully");

  // Initialize Tooltips or simple animations
  const productCards = document.querySelectorAll(".category-card");

  productCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("animate__animated", "animate__pulse");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("animate__animated", "animate__pulse");
    });
  });
});

// Search functionality placeholder
function handleSearch(event) {
  const query = event.target.value;
  if (query.length > 3) {
    console.log("Searching for: " + query);
  }
}

document.addEventListener("change", (e) => {
  if (e.target.name === "accType") {
    const companyField = document.getElementById("regCompany").parentElement;
    if (e.target.value === "customer") {
      companyField.style.opacity = "0.5"; // Just dim it for customers
    } else {
      companyField.style.opacity = "1"; // Full visibility for retailers
    }
  }
});

// Replace the grid content in shop.html using this logic
function renderShop() {
  const products = JSON.parse(localStorage.getItem("Mishra_Products"));
  const grid = document.querySelector(".grid"); // Your main shop grid
  if (!grid) return;
  grid.innerHTML = "";

  products.forEach((product) => {
    grid.innerHTML += `
        <div onclick="viewProduct('${product.id}')" class="bg-white rounded-2xl border border-gray-100 hover-lift overflow-hidden group cursor-pointer relative">
            <div class="h-48 md:h-64 bg-gray-50 flex items-center justify-center p-6">
                <img src="${product.image}" class="group-hover:scale-110 transition h-full object-contain">
            </div>
            <div class="p-6">
                <h3 class="font-bold text-blue-900 text-lg md:text-xl">${product.name}</h3>
                <p class="text-blue-600 font-black text-xl md:text-2xl my-3">₹${product.price}</p>
                <button onclick="event.stopPropagation(); addToCart('${product.name}', ${product.price})" 
                        class="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition text-sm">Add to Cart</button>
            </div>
        </div>`;
  });
}

function viewProduct(id) {
  localStorage.setItem("current_view_id", id);
  window.location.href = "products-details.html";
}

// Registration Logic for Mishra Industries
function handleRegistration() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const phone = document.getElementById("regPhone").value;
  const pass = document.getElementById("regPass").value;
  const type = document.querySelector('input[name="accType"]:checked').value;
  const business = document.getElementById("regCompany").value;

  if (!name || !email || !phone || !pass) {
    alert("Please fill all required fields.");
    return;
  }
  if (type === "retail" && !business) {
    alert("Retailers must provide a Business Name.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("Mishra_Users")) || [];

  if (users.find((u) => u.email === email)) {
    alert("Email already registered. Please login.");
    return;
  }

  const newUser = {
    id: "USR-" + Date.now(),
    name: name,
    email: email,
    phone: phone,
    password: pass,
    accountType: type,
    businessName: type === "retail" ? business : null,
    joinDate: new Date().toLocaleDateString(),
  };

  users.push(newUser);
  localStorage.setItem("Mishra_Users", JSON.stringify(users));

  alert(
    `Welcome to Mishra Industries, ${name}! Your ${type} account is ready.`,
  );
  window.location.href = "login.html";
}

// Mobile Menu Responsive Logic
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeMobileMenu");

  // Standard Hamburger Logic
  if (hamburger && navLinks) {
    hamburger.onclick = () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("is-active");
    };
  }

  // Modal Style Mobile Menu Logic
  if (mobileBtn && mobileMenu) {
    mobileBtn.onclick = () => {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex");
      document.body.style.overflow = "hidden"; // Prevent background scroll
    };
  }

  if (closeBtn) {
    closeBtn.onclick = closeMenu;
  }
});

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  if (sidebar) {
    sidebar.classList.toggle("translate-x-full");
  }
}

function closeMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

// Slideshow Controller
let slideIndex = 0;
showSlides();

function showSlides() {
  let slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].style.display = "block";
  setTimeout(showSlides, 3000);
}

// Profile and Session Handling
function updateNavbarProfile() {
  const sessionData = localStorage.getItem("Mishra_Session");
  if (sessionData) {
    const user = JSON.parse(sessionData);
    const nameElement = document.getElementById("userNameDisplay");
    const authButtons = document.getElementById("authButtons");
    const profileArea = document.getElementById("userProfileArea");

    if (nameElement) {
      nameElement.innerText = user.fullName.split(" ")[0];
    }
    if (authButtons) authButtons.classList.add("hidden");
    if (profileArea) profileArea.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("mishraUser"));
  const wrapper = document.getElementById("authNavWrapper");

  if (user && user.fullName && wrapper) {
    const initials = user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    // Responsive Avatar logic
    wrapper.innerHTML = `
            <div class="user-avatar-nav active:scale-95 transition-transform" onclick="location.href='profile.html'" title="My Profile">
                ${initials}
            </div>
        `;
  }
});

// Query Form Integration
const queryForm = document.getElementById("queryForm");
if (queryForm) {
  queryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("querySubmitBtn");
    btn.disabled = true;
    btn.innerText = "Sending...";

    const queryData = {
      name: document.getElementById("queryName").value,
      email: document.getElementById("queryEmail").value,
      message: document.getElementById("queryMessage").value,
    };

    try {
      const res = await fetch(
        "https://mishra-industries-ltd-yjfr.onrender.com/api/queries/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryData),
        },
      );
      if (res.ok) {
        alert("✅ Query sent successfully! We will contact you soon.");
        queryForm.reset();
      }
    } catch (err) {
      alert("❌ Failed to send query.");
    } finally {
      btn.disabled = false;
      btn.innerText = "Send Message";
    }
  });
}
