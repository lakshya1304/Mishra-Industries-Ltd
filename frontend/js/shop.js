let currentBrand = "All";
let currentCategory = null;
const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";

async function renderShop() {
  const grid = document.getElementById("productGrid");
  const countDisplay = document.getElementById("productCount");
  const priceRange = document.getElementById("priceRange");
  const priceDisplay = document.getElementById("priceDisplay");
  const searchInput = document.getElementById("searchInput");

  grid.innerHTML = `
        <div class="col-span-full h-96 flex flex-col items-center justify-center space-y-4">
            <div class="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] animate-pulse">Syncing Mishra Atlas</p>
        </div>`;

  try {
    const response = await fetch(`${API_BASE}/api/products/all`);
    const products = await response.json();

    const maxPrice = parseInt(priceRange.value);
    priceDisplay.innerText = `₹${maxPrice.toLocaleString()}`;
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = document.getElementById("sortSelect").value;

    const selectedCategories = Array.from(
      document.querySelectorAll(".cat-check:checked"),
    ).map((cb) => cb.value.toLowerCase());

    let filtered = products.filter((p) => {
      const finalPrice = p.price - (p.price * (p.discount || 0)) / 100;

      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm);

      const matchesBrand =
        currentBrand === "All" ||
        (p.company && p.company.toLowerCase() === currentBrand.toLowerCase());

      const matchesPrice = finalPrice <= maxPrice;

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((c) => p.category.toLowerCase().includes(c));

      return matchesSearch && matchesBrand && matchesPrice && matchesCategory;
    });

    if (sortValue === "low") filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === "high") filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    countDisplay.innerText = `${filtered.length} Items Found Under ₹${maxPrice.toLocaleString()}`;

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
      let finalImgSrc =
        product.image && product.image.startsWith("data:") ?
          product.image
        : `${API_BASE}${product.image.startsWith("/") ? product.image : "/" + product.image}`;

      grid.innerHTML += `
                <div onclick="location.href='product-details.html?id=${product._id}'" 
                     class="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 animate__animated animate__fadeInUp relative"
                     style="animation-delay: ${i * 0.05}s">
                    <div class="h-72 bg-slate-50 p-12 flex items-center justify-center relative overflow-hidden">
                        <img src="${finalImgSrc}" 
                             onerror="this.src='./images/logo.jpeg'"
                             class="h-full w-full object-contain group-hover:scale-110 transition-transform duration-1000">
                        ${product.discount > 0 ? `<div class="absolute top-6 left-6 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg z-10">-${product.discount}%</div>` : ""}
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
  }
}

// FIXED: Robust filterByBrand function with active blue background logic
function filterByBrand(button) {
  currentBrand = button.dataset.brand;

  const chips = document.querySelectorAll(".filter-chip");

  chips.forEach((chip) => {
    chip.classList.remove("bg-blue-900", "text-white", "active");
    chip.classList.add("text-slate-600", "border-slate-100");
  });

  button.classList.remove("text-slate-600", "border-slate-100");
  button.classList.add("bg-blue-900", "text-white", "active");

  renderShop();
}
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

function handlePhotoSearch(event) {
  const file = event.target.files[0];
  const searchInput = document.getElementById("searchInput");
  if (!file) return;
  searchInput.value = "Analyzing image...";
  setTimeout(() => {
    const name = file.name.toLowerCase();
    searchInput.value =
      name.includes("switch") ? "Switch"
      : name.includes("wire") || name.includes("cable") ? "Cable"
      : "Electrical";
    renderShop();
  }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
  renderShop();
  document.getElementById("priceRange").addEventListener("input", renderShop);
  document.getElementById("sortSelect").addEventListener("change", renderShop);
  document.getElementById("searchInput").addEventListener("input", renderShop);
  document.querySelectorAll(".cat-check").forEach((check) => {
    check.addEventListener("change", renderShop);
  });

  const user = JSON.parse(localStorage.getItem("mishraUser"));
  const authWrapper = document.getElementById("authNavWrapper");
  if (user && user.fullName) {
    const initials = user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    authWrapper.innerHTML = `<div class="user-avatar" onclick="location.href='profile.html'" title="My Profile">${initials}</div>`;
  }
});

function addToCart(name, price, qty = 1, image = null, originalPrice = null) {
  let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += parseInt(qty);
  } else {
    cart.push({
      name: name,
      price: price,
      originalPrice: originalPrice || price,
      quantity: parseInt(qty),
      image: image || "./images/logo.jpeg",
    });
  }

  localStorage.setItem("mishraCart", JSON.stringify(cart));
  if (document.getElementById("cartCount")) {
    document.getElementById("cartCount").innerText = cart.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
  }
 updateCartDrawer();
toggleCart();
}

function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.toggle("invisible");
  drawer.querySelector(".cart-drawer").classList.toggle("open");
  updateCartDrawer();
}

function updateCartDrawer() {
  const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";

  const cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  const cartList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");

  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
        Cart is empty
      </div>`;
    cartTotal.innerText = "₹0";
    cartCount.innerText = "0";
    return;
  }

  let total = 0;
  let totalQty = 0;

  cart.forEach((item, index) => {

    // FIX IMAGE PATH
    let imgSrc = item.image;
    if (!imgSrc.startsWith("http") && !imgSrc.startsWith("data:")) {
      imgSrc = API_BASE + (imgSrc.startsWith("/") ? imgSrc : "/" + imgSrc);
    }

    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    totalQty += item.quantity;

    cartList.innerHTML += `
      <div class="flex items-center space-x-4 border-b pb-4">
        
        <img src="${imgSrc}" 
             onerror="this.src='./images/logo.jpeg'"
             class="w-16 h-16 object-contain rounded-xl bg-slate-50">

        <div class="flex-1">
          <h4 class="font-bold text-sm text-blue-900">${item.name}</h4>

          <div class="flex items-center space-x-2 mt-2">
            <button onclick="changeQuantity(${index}, -1)"
              class="w-6 h-6 bg-slate-200 rounded flex items-center justify-center font-bold">-</button>

            <span class="text-sm font-bold">${item.quantity}</span>

            <button onclick="changeQuantity(${index}, 1)"
              class="w-6 h-6 bg-slate-200 rounded flex items-center justify-center font-bold">+</button>
          </div>

          <p class="font-black text-blue-900 mt-2">
            ₹${itemTotal.toLocaleString()}
          </p>
        </div>

        <button onclick="removeFromCart(${index})"
          class="text-red-500 font-bold text-xl hover:scale-110 transition">
          &times;
        </button>
      </div>`;
  });

  cartTotal.innerText = `₹${total.toLocaleString()}`;
  cartCount.innerText = totalQty;
}

function changeQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("mishraCart", JSON.stringify(cart));
  updateCartDrawer();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("mishraCart", JSON.stringify(cart));
  updateCartDrawer();
}