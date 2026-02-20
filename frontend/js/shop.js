let currentBrand = "All";
let currentCategory = null; // Added to support category tracking
const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";

async function renderShop() {
  const grid = document.getElementById("productGrid");
  const countDisplay = document.getElementById("productCount");
  const priceRange = document.getElementById("priceRange");
  const priceDisplay = document.getElementById("priceDisplay");
  const searchInput = document.getElementById("searchInput");

  // 1. Initial Loading State
  grid.innerHTML = `
        <div class="col-span-full h-96 flex flex-col items-center justify-center space-y-4">
            <div class="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] animate-pulse">Syncing Mishra Atlas</p>
        </div>`;

  try {
    // 2. Fetch live inventory from MongoDB Atlas
    const response = await fetch(`${API_BASE}/api/products/all`);
    const products = await response.json();

    // 3. Process UI Controls
    const maxPrice = parseInt(priceRange.value);
    priceDisplay.innerText = `₹${maxPrice.toLocaleString()}`;
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = document.getElementById("sortSelect").value;

    // Capture Multiple Categories from checkboxes
    const selectedCategories = Array.from(
      document.querySelectorAll(".cat-check:checked"),
    ).map((cb) => cb.value.toLowerCase());

    // 4. Unified Filter Logic
    let filtered = products.filter((p) => {
      const finalPrice = p.price - (p.price * (p.discount || 0)) / 100;

      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm);

      // FIXED: Brand matching logic to check the 'company' field from your DB
      const matchesBrand =
        currentBrand === "All" ||
        currentBrand === null ||
        (p.company && p.company.toLowerCase() === currentBrand.toLowerCase());

      const matchesPrice = finalPrice <= maxPrice;

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((c) => p.category.toLowerCase().includes(c));

      return matchesSearch && matchesBrand && matchesPrice && matchesCategory;
    });

    // 5. Sorting Logic
    if (sortValue === "low") filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === "high") filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    countDisplay.innerText = `${filtered.length} Items Found Under ₹${maxPrice.toLocaleString()}`;

    // 6. Clear Loading Message and Render Cards
    grid.innerHTML = "";
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full h-64 flex flex-col items-center justify-center space-y-4">
                <i class="fas fa-search text-4xl text-slate-200"></i>
                <p class="text-slate-300 font-black uppercase tracking-widest text-[10px]">No results match your filters</p>
            </div>`;
      return;
    }

    filtered.forEach((product, i) => {
      const finalPrice =
        product.price - (product.price * (product.discount || 0)) / 100;

      // UPDATED IMAGE LOGIC: Handles Base64 strings (data:) and local Render paths
      let finalImgSrc;
      if (product.image && product.image.startsWith("data:")) {
        // Use Base64 string directly from database
        finalImgSrc = product.image;
      } else {
        // Fallback for local server paths
        const cleanPath =
          product.image.startsWith("/") ? product.image : `/${product.image}`;
        finalImgSrc = `${API_BASE}${cleanPath}`;
      }

      grid.innerHTML += `
                <div onclick="location.href='product-details.html?id=${product._id}'" 
                     class="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 animate__animated animate__fadeInUp relative"
                     style="animation-delay: ${i * 0.05}s">
                    <div class="h-72 bg-slate-50 p-12 flex items-center justify-center relative overflow-hidden">
                        <img src="${finalImgSrc}" 
                             onerror="this.src='./images/logo.jpeg'"
                             class="h-full w-full object-contain group-hover:scale-110 transition-transform duration-1000">
                        ${
                          product.discount > 0 ?
                            `
                        <div class="absolute top-6 left-6 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg z-10">
                            -${product.discount}%
                        </div>`
                          : ""
                        }
                    </div>
                    <div class="p-8">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">${product.company || "Mishra Atlas"}</p>
                                <h3 class="text-blue-900 font-black text-base leading-tight group-hover:text-orange-600 transition-colors">${product.name}</h3>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-8 border-t border-slate-50 pt-6">
                            <div>
                                <p class="text-2xl font-black text-blue-900">₹${finalPrice.toLocaleString()}</p>
                                ${product.discount > 0 ? `<p class="text-[10px] text-slate-300 line-through font-bold">₹${product.price.toLocaleString()}</p>` : ""}
                            </div>
                            <button onclick="event.stopPropagation(); addToCart('${product.name}', ${finalPrice}, 1, '${finalImgSrc}', ${product.price})" 
                                    class="bg-blue-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-orange-500 transition-all shadow-xl active:scale-90">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
    });
  } catch (err) {
    console.error("Fetch failed:", err);
    grid.innerHTML = `<div class="col-span-full h-96 flex flex-col items-center justify-center text-red-500 space-y-4">
            <i class="fas fa-wifi text-3xl"></i>
            <p class="font-black tracking-widest text-xs uppercase">DATABASE OFFLINE: CHECK ATLAS CONNECTION</p>
        </div>`;
  }
}

// Voice Recognition Feature
function startVoiceSearch() {
  const micIcon = document.getElementById("micIcon");
  const searchInput = document.getElementById("searchInput");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Browser not supported");

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.onstart = () =>
    micIcon.classList.add("fa-spin", "text-orange-500");
  recognition.onresult = (e) => {
    searchInput.value = e.results[0][0].transcript;
    renderShop();
  };
  recognition.onend = () =>
    micIcon.classList.remove("fa-spin", "text-orange-500");
  recognition.start();
}

// Photo Search Feature
function handlePhotoSearch(event) {
  const file = event.target.files[0];
  const searchInput = document.getElementById("searchInput");
  if (!file) return;
  searchInput.value = "Analyzing image...";
  setTimeout(() => {
    const name = file.name.toLowerCase();
    if (name.includes("switch")) searchInput.value = "Switch";
    else if (name.includes("wire") || name.includes("cable"))
      searchInput.value = "Cable";
    else searchInput.value = "Electrical";
    renderShop();
  }, 1500);
}

function filterByBrand(brand) {
  // If 'All' is selected, set currentBrand to null so it doesn't filter by company
  currentBrand = brand === "All" ? null : brand;

  // Update UI button styles
  document.querySelectorAll(".filter-chip").forEach((btn) => {
    // Check for exact match with the button text
    const isMatch = btn.innerText.trim() === brand;
    btn.classList.toggle("active", isMatch);

    if (isMatch) {
      btn.classList.add("bg-blue-900", "text-white");
      btn.classList.remove("bg-white", "text-slate-500");
    } else {
      btn.classList.remove("bg-blue-900", "text-white");
      btn.classList.add("bg-white", "text-slate-500");
    }
  });

  // Re-render the shop with the new brand filter applied
  renderShop();
}

document.addEventListener("DOMContentLoaded", () => {
  renderShop();
  document.getElementById("priceRange").addEventListener("input", renderShop);
  document.getElementById("sortSelect").addEventListener("change", renderShop);
  document.getElementById("searchInput").addEventListener("input", renderShop); // Added missing search trigger
  document.querySelectorAll(".cat-check").forEach((check) => {
    check.addEventListener("change", renderShop);
  });
});

