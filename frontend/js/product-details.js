const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com";
let currentQty = 1;

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    window.location.href = "shop.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/products/${productId}`);
    const product = await response.json();

    // 1. Map Data to UI
    document.getElementById("productName").innerText = product.name;
    document.getElementById("breadcrumbCategory").innerText = product.category;
    document.getElementById("productDescription").innerText =
      product.description ||
      "Premium electrical solution from Mishra Industries.";

    // UPDATED IMAGE LOGIC: Handles Base64 strings (data:) and local Render paths
    let finalImgSrc;
    if (product.image && product.image.startsWith("data:")) {
      // Use Base64 string directly
      finalImgSrc = product.image;
    } else {
      // Fallback for local server paths
      const cleanPath =
        product.image.startsWith("/") ? product.image : `/${product.image}`;
      finalImgSrc = `${API_BASE}${cleanPath}`;
    }
    document.getElementById("productImage").src = finalImgSrc;

    // 2. Pricing and Discount
    const discount = product.discount || 0;
    const finalPrice = product.price - product.price * (discount / 100);
    document.getElementById("productPrice").innerText =
      `₹${finalPrice.toLocaleString()}`;

    if (discount > 0) {
      const badge = document.getElementById("discountBadge");
      badge.innerText = `-${discount}% OFF`;
      badge.classList.remove("hidden");
      document.getElementById("originalPrice").innerText =
        `₹${product.price.toLocaleString()}`;
      document.getElementById("originalPrice").classList.remove("hidden");
    }

    // 3. Stock Status
    const stockEl = document.getElementById("stockStatus");
    const available = product.stock > 0;
    stockEl.innerHTML =
      available ?
        '<i class="fas fa-check-circle mr-2 text-green-500"></i> IN STOCK'
      : '<i class="fas fa-times-circle mr-2 text-red-500"></i> OUT OF STOCK';
    stockEl.className +=
      available ? " bg-green-50 text-green-700" : " bg-red-50 text-red-700";

    // 4. Specs Table
    const specs = [
      { label: "Product Category", value: product.category },
      { label: "Durability", value: "Industrial Grade" },
      { label: "Standard", value: "ISI / Mishra Certified" },
      { label: "Logistics", value: "Standard Surface Dispatch" },
    ];
    document.getElementById("specTable").innerHTML = specs
      .map(
        (s) => `
            <div class="spec-row grid grid-cols-2 p-4 border-b border-slate-100 last:border-0">
                <span class="text-[10px] font-black text-slate-400 uppercase">${s.label}</span>
                <span class="text-xs font-bold text-blue-900">${s.value}</span>
            </div>
        `,
      )
      .join("");

    // 5. Fixed Action: Single Notification Cart
    const cartBtn = document.getElementById("addToCartBtn");
    cartBtn.onclick = (e) => {
      e.preventDefault();
      if (typeof addToCart === "function") {
        // FIXED: Now passing finalPrice, quantity, Base64 image, and original price for the new cart logic
        addToCart(
          product.name,
          finalPrice,
          currentQty,
          finalImgSrc,
          product.price,
        );

        // Visual Button Change instead of Alert pop-ups
        const originalText = cartBtn.innerHTML;
        cartBtn.innerHTML = `<i class="fas fa-check"></i> <span>Updated Basket</span>`;
        cartBtn.classList.replace("bg-[#1e3a8a]", "bg-green-600");

        setTimeout(() => {
          cartBtn.innerHTML = originalText;
          cartBtn.classList.replace("bg-green-600", "bg-[#1e3a8a]");
        }, 2000);
      }
    };
  } catch (err) {
    console.error("Critical Fetch Error:", err);
  }
}

function updateQty(val) {
  currentQty = Math.max(1, currentQty + val);
  document.getElementById("quantityDisplay").innerText = currentQty;
}

document.addEventListener("DOMContentLoaded", loadProductDetails);

// 1. Use the "Hardened" key name: mishraCart
function addToCart(name, price, qty = 1, image = null, originalPrice = null) {
    let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
    const qtyToAdd = parseInt(qty) || 1;

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += qtyToAdd;
    } else {
        // 2. Add with the EXACT keys the cart.html script expects
        cart.push({
            name: name,
            price: price,           // Discounted price
            originalPrice: originalPrice || price, 
            quantity: qtyToAdd,
            image: image || './images/logo.jpeg' // Base64 or path
        });
    }

    localStorage.setItem("mishraCart", JSON.stringify(cart));
    
    // Update the badge if it exists on the page
    if(document.getElementById("cartCount")) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById("cartCount").innerText = total;
    }

    alert(`✅ ${name} added to Mishra Basket!`);
}