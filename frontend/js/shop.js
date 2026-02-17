// Centralized Rendering Engine - Modern & Backend Connected
async function renderShop(filterCategory = "All", searchQuery = "") {
  const grid = document.getElementById("productGrid");
  const countDisplay = document.getElementById("productCount");
  if (!grid) return;

  // Loader Animation
  grid.innerHTML = `
        <div class="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
            <div class="w-12 h-12 border-4 border-blue-900 border-t-orange-500 rounded-full animate-spin"></div>
            <p class="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing Mishra Inventory...</p>
        </div>`;

  try {
    // 1. Fetch live data from MongoDB
    const response = await fetch("http://localhost:5000/api/products/all");
    const products = await response.json();

    // 2. Get Filter Inputs from shop.html
    const maxPrice =
      parseInt(document.getElementById("priceRange").value) || 50000;
    const sortCriteria = document.querySelector("select").value;
    const activeSidebarCats = Array.from(
      document.querySelectorAll(".filter-checkbox:checked"),
    ).map((cb) => cb.nextElementSibling.innerText.trim().toLowerCase());

    // 3. Filtering Logic
    let filtered = products.filter((product) => {
      const productPrice =
        product.price - product.price * ((product.discount || 0) / 100);
      const productCat = product.category.toLowerCase();

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPrice = productPrice <= maxPrice;
      const matchesTopButton =
        filterCategory === "All" ||
        productCat.includes(filterCategory.toLowerCase());
      const matchesSidebar =
        activeSidebarCats.length === 0 ||
        activeSidebarCats.some((cat) => productCat.includes(cat));

      return (
        matchesSearch && matchesPrice && matchesTopButton && matchesSidebar
      );
    });

    // 4. Sorting Logic
    if (sortCriteria === "low") {
      filtered.sort(
        (a, b) =>
          a.price -
          a.price * (a.discount / 100) -
          (b.price - b.price * (b.discount / 100)),
      );
    } else if (sortCriteria === "high") {
      filtered.sort(
        (a, b) =>
          b.price -
          b.price * (b.discount / 100) -
          (a.price - a.price * (a.discount / 100)),
      );
    } else {
      // Newest First (Mongoose default timestamps)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Update UI Count
    if (countDisplay)
      countDisplay.innerText = `Showing ${filtered.length} results under ₹${maxPrice.toLocaleString()}`;

    grid.innerHTML = "";

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No products found matching these filters.</div>`;
      return;
    }

    // 5. Render Animated Cards
    filtered.forEach((product, index) => {
      const originalPrice = product.price;
      const discountPercent = product.discount || 0;
      const discountedPrice =
        originalPrice - originalPrice * (discountPercent / 100);

      grid.innerHTML += `
            <div onclick="viewProductDetails('${product._id}')" 
                 class="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative animate__animated animate__fadeInUp"
                 style="animation-delay: ${index * 0.05}s">
                
                ${
                  discountPercent > 0 ?
                    `
                <div class="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10 animate__animated animate__pulse animate__infinite">
                    ${discountPercent}% OFF
                </div>`
                  : ""
                }

                <div class="h-64 bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden">
                    <img src="http://localhost:5000${product.image}" 
                         onerror="this.src='./images/logo.jpeg'"
                         class="transition-transform duration-700 group-hover:scale-110 object-contain h-full">
                </div>

                <div class="p-6">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-orange-500 text-[10px] font-black uppercase tracking-widest">${product.category}</p>
                        <span class="text-[8px] font-black px-2 py-1 bg-blue-50 text-blue-900 rounded-md">
                            ${product.stock > 0 ? "READY TO SHIP" : "BACKORDER"}
                        </span>
                    </div>
                    <h3 class="font-bold text-blue-900 text-lg mb-4 truncate group-hover:text-orange-600 transition-colors">${product.name}</h3>
                    
                    <div class="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div class="flex flex-col">
                            <span class="text-2xl font-black text-blue-900">₹${discountedPrice.toLocaleString()}</span>
                            ${discountPercent > 0 ? `<span class="text-[10px] text-gray-400 line-through">₹${originalPrice.toLocaleString()}</span>` : ""}
                        </div>
                        <button onclick="event.stopPropagation(); addToCart('${product.name}', ${discountedPrice})" 
                                class="bg-blue-900 text-white w-12 h-12 rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-90 flex items-center justify-center">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    });
  } catch (err) {
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-black tracking-widest">SERVER OFFLINE</div>`;
  }
}

// Initial Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderShop();

  // Listen to all Filter Checkbox changes
  document.querySelectorAll(".filter-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => renderShop());
  });

  // Listen to Price Slider changes
  document
    .getElementById("priceRange")
    .addEventListener("input", () => renderShop());
});

function addToCart(name, price) {
  // 1. Your existing cart logic (saving to localStorage/array)
  let cart = JSON.parse(localStorage.getItem("Mishra_Cart")) || [];
  cart.push({ name, price, id: Date.now() });
  localStorage.setItem("Mishra_Cart", JSON.stringify(cart));

  // 2. Update the Navbar Count
  if (document.getElementById("cartCount")) {
    document.getElementById("cartCount").innerText = cart.length;
  }

  // 3. Trigger the Modern Popup
  showCartToast(name);
}

function showCartToast(name) {
    const toast = document.getElementById('cartToast');
    const toastName = document.getElementById('toastProductName');
    const toastBadge = document.getElementById('toastCartCount');
    
    if(!toast) return;

    // 1. Get the latest count from localStorage
    const cart = JSON.parse(localStorage.getItem("Mishra_Cart")) || [];
    if(toastBadge) toastBadge.innerText = cart.length;

    // 2. Set the product name and slide down
    toastName.innerText = name;
    toast.style.top = "20px";
    
    // 3. Auto-hide
    setTimeout(() => {
        toast.style.top = "-100px";
    }, 3000);
}