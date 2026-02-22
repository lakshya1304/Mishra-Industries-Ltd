const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";
let currentQty = 1;
let currentProduct = null;

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    window.location.href = "shop.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/products/${productId}`);
    currentProduct = await response.json();

    document.getElementById("productName").innerText = currentProduct.name;
    document.getElementById("breadcrumbCategory").innerText =
      currentProduct.category;
    document.getElementById("productDescription").innerText =
      currentProduct.description ||
      "Official premium industrial-grade solution.";
    document.getElementById("productImage").src = getCleanImagePath(
      currentProduct.image,
    );

    const discount = currentProduct.discount || 0;
    const finalPrice = Math.floor(
      currentProduct.price - currentProduct.price * (discount / 100),
    );
    document.getElementById("productPrice").innerText =
      `₹${finalPrice.toLocaleString()}`;

    if (discount > 0) {
      document.getElementById("discountBadge").innerText = `${discount}% OFF`;
      document.getElementById("discountBadge").classList.remove("hidden");
      document.getElementById("originalPrice").innerText =
        `₹${currentProduct.price.toLocaleString()}`;
      document.getElementById("originalPrice").classList.remove("hidden");
    }

    const available = currentProduct.stock > 0;
    document.getElementById("stockStatus").innerHTML =
      available ?
        '<i class="fas fa-check-circle mr-2 text-green-500"></i> IN STOCK'
      : '<i class="fas fa-times-circle mr-2 text-red-500"></i> OUT OF STOCK';
    document.getElementById("stockStatus").className =
      `flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`;

    renderSpecs(currentProduct);
    loadRecommendations(currentProduct.category, currentProduct._id);
    updateCartBadge();
    AOS.init();
  } catch (err) {
    console.error(err);
  }
}

function getCleanImagePath(img) {
  if (!img) return "./images/logo.jpeg";
  if (img.startsWith("data:") || img.startsWith("http")) return img;
  return `${API_BASE}${img.startsWith("/") ? img : "/" + img}`;
}

function renderSpecs(product) {
  const specs = [
    { label: "Company / Brand", value: product.company },
    { label: "Category", value: product.category },
    { label: "Durability", value: "Industrial Grade" },
    { label: "Standard", value: "ISI / Mishra Certified" },
  ];
  document.getElementById("specTable").innerHTML = specs
    .map(
      (s) => `
        <div class="spec-row grid grid-cols-2 p-5 border-b border-slate-50 hover:bg-slate-100/50 transition-colors">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s.label}</span>
            <span class="text-xs font-bold text-blue-900">${s.value}</span>
        </div>`,
    )
    .join("");
}

async function loadRecommendations(category, currentId) {
  try {
    const response = await fetch(`${API_BASE}/api/products/all`);
    const allProducts = await response.json();
    const recommended = allProducts
      .filter((p) => p.category === category && p._id !== currentId)
      .slice(0, 8);
    document.getElementById("recommendationSlider").innerHTML = recommended
      .map((p) => {
        const disc = p.discount || 0;
        const price = Math.floor(p.price - p.price * (disc / 100));
        return `
            <div onclick="location.href='product-details.html?id=${p._id}'" class="min-w-[280px] bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-xl transition-all cursor-pointer group">
                <div class="h-40 bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    <img src="${getCleanImagePath(p.image)}" class="h-full object-contain group-hover:scale-110 transition-transform duration-500">
                </div>
                <h4 class="text-sm font-black text-blue-900 truncate mb-2">${p.name}</h4>
                <p class="text-lg font-black text-blue-900">₹${price.toLocaleString()}</p>
            </div>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
  }
}

function updateQty(val) {
  currentQty = Math.max(1, currentQty + val);
  document.getElementById("quantityDisplay").innerText = currentQty;
}

// FIXED: Connected to "mishra_cart" unified key
const addToCartBtn = document.getElementById("addToCartBtn");
if (addToCartBtn) {
  addToCartBtn.onclick = () => {
    if (!currentProduct) return;
    const finalPrice = Math.floor(
      currentProduct.price -
        currentProduct.price * ((currentProduct.discount || 0) / 100),
    );

    let cart = JSON.parse(localStorage.getItem("mishra_cart")) || [];
    const existing = cart.find((item) => item.name === currentProduct.name);

    if (existing) {
      existing.quantity += currentQty;
    } else {
      cart.push({
        name: currentProduct.name,
        price: finalPrice,
        originalPrice: currentProduct.price,
        quantity: currentQty,
        image: getCleanImagePath(currentProduct.image),
      });
    }

    localStorage.setItem("mishra_cart", JSON.stringify(cart));
    updateCartBadge();
    showToast(currentProduct.name);

    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.classList.replace("bg-[#1e3a8a]", "bg-green-600");
    addToCartBtn.innerHTML = `<i class="fas fa-check"></i> <span>Added!</span>`;
    setTimeout(() => {
      addToCartBtn.classList.replace("bg-green-600", "bg-[#1e3a8a]");
      addToCartBtn.innerHTML = originalText;
    }, 2000);
  };
}

function showToast(name) {
  const toast = document.getElementById("cartToast");
  document.getElementById("toastProductName").innerText = name;
  toast.classList.remove("opacity-0", "translate-x-10", "pointer-events-none");
  setTimeout(
    () =>
      toast.classList.add("opacity-0", "translate-x-10", "pointer-events-none"),
    3000,
  );
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("mishra_cart")) || [];
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;
}

document.addEventListener("DOMContentLoaded", loadProductDetails);
