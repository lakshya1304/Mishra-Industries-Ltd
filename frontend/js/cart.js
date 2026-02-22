function renderFullCart() {
  // FIXED: Now consistently using "mishraCart"
  const cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  const container = document.getElementById("fullCartList");
  const itemCountDisplay = document.getElementById("itemCountDisplay");

  itemCountDisplay.innerText = `${cart.length} Items`;

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="bg-white rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-200 animate__animated animate__fadeIn">
              <div class="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <i class="fas fa-cart-arrow-down text-4xl text-slate-300"></i>
              </div>
              <h3 class="text-2xl font-black text-blue-900 uppercase mb-2">Cart is Empty</h3>
              <p class="text-slate-400 font-medium mb-10">You haven't added any electrical solutions yet.</p>
              <button onclick="location.href='shop.html'" class="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-200">Start Shopping</button>
            </div>`;
    updatePricing(0, 0);
    return;
  }

  let html = "";
  let rawOriginalTotal = 0;
  let discountedTotal = 0;

  cart.forEach((item, index) => {
    const price = parseFloat(item.price) || 0;
    const originalPrice = parseFloat(item.originalPrice) || price;
    const qty = parseInt(item.quantity) || 0;

    const itemOriginal = originalPrice * qty;
    const itemDiscounted = price * qty;

    rawOriginalTotal += itemOriginal;
    discountedTotal += itemDiscounted;

    // Sync image path with shop and Site Editor
    const imageSrc =
      item.image ?
        item.image.startsWith("http") || item.image.startsWith("data:") ?
          item.image
        : `https://mishra-industries-ltd-yjfr.onrender.com${item.image}`
      : "./images/logo.jpeg";

    html += `
            <div class="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row items-center justify-between animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
              <div class="flex items-center space-x-8 w-full md:w-auto">
                <div class="h-28 w-28 bg-slate-50 rounded-[2rem] overflow-hidden p-4 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                  <img src="${imageSrc}" onerror="this.src='./images/logo.jpeg'" class="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700">
                </div>
                <div>
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Industrial</span>
                    <span class="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">ISI Certified</span>
                  </div>
                  <h4 class="font-black text-blue-900 text-2xl tracking-tighter mb-1">${item.name}</h4>
                  <p class="text-xs font-black text-slate-300 uppercase tracking-widest">Rate: ₹${price.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div class="flex items-center justify-between w-full md:w-auto mt-8 md:mt-0 space-x-12">
                <div class="flex items-center bg-slate-100 rounded-2xl p-2 border border-slate-200 shadow-inner">
                  <button onclick="updateQty('${item.name}', -1)" class="w-12 h-12 hover:bg-white rounded-xl transition-all font-black text-blue-900 shadow-sm active:scale-90">-</button>
                  <span class="px-8 font-black text-blue-900 text-lg">${qty}</span>
                  <button onclick="updateQty('${item.name}', 1)" class="w-12 h-12 hover:bg-white rounded-xl transition-all font-black text-blue-900 shadow-sm active:scale-90">+</button>
                </div>
                <div class="text-right min-w-[120px]">
                  <p class="text-[10px] text-slate-300 font-bold line-through mb-1">₹${itemOriginal.toLocaleString("en-IN")}</p>
                  <p class="font-black text-2xl text-blue-900 tracking-tighter">₹${itemDiscounted.toLocaleString("en-IN")}</p>
                </div>
                <button onclick="removeItem('${item.name}')" class="w-14 h-14 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-500">
                  <i class="fas fa-trash-alt text-lg"></i>
                </button>
              </div>
            </div>`;
  });

  container.innerHTML = html;
  updatePricing(rawOriginalTotal, discountedTotal);
}

function updatePricing(original, discounted) {
  const gstRate = 0.18;
  const gstAmount = Math.round(discounted * gstRate);
  const finalTotal = discounted + gstAmount;

  document.getElementById("originalValue").innerText =
    `₹${original.toLocaleString("en-IN")}`;
  document.getElementById("discountValue").innerText =
    `-₹${(original - discounted).toLocaleString("en-IN")}`;
  document.getElementById("subtotal").innerText =
    `₹${discounted.toLocaleString("en-IN")}`;
  document.getElementById("gstAmount").innerText =
    `₹${gstAmount.toLocaleString("en-IN")}`;
  document.getElementById("grandTotal").innerText =
    `₹${finalTotal.toLocaleString("en-IN")}`;

  localStorage.setItem(
    "mishra_bill_summary",
    JSON.stringify({
      subtotal: discounted,
      gst: gstAmount,
      total: finalTotal,
    }),
  );
}

function updateQty(name, delta) {
  let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  const item = cart.find((i) => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((i) => i.name !== name);
    localStorage.setItem("mishraCart", JSON.stringify(cart));
    renderFullCart();
  }
}

function removeItem(name) {
  let cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  cart = cart.filter((i) => i.name !== name);
  localStorage.setItem("mishraCart", JSON.stringify(cart));
  renderFullCart();
}

function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem("mishraCart")) || [];
  if (cart.length === 0) return alert("Your basket is empty!");
  document.body.classList.add("animate__animated", "animate__fadeOut");
  setTimeout(() => {
    location.href = "checkout.html";
  }, 500);
}

document.addEventListener("DOMContentLoaded", renderFullCart);
