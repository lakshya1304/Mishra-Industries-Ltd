// Centralized Rendering Engine
function renderShop(filterCategory = 'All', searchQuery = '') {
    const products = JSON.parse(localStorage.getItem("Mishra_Products")) || [];
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Filtering Logic
    const filtered = products.filter(product => {
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-3 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No products found matching your search.</div>`;
        return;
    }

    filtered.forEach(product => {
        grid.innerHTML += `
        <div onclick="viewProductDetails('${product.id}')" 
             class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative animate__animated animate__fadeIn">
            <div class="h-60 bg-gray-50 flex items-center justify-center p-6">
                <img src="${product.image}" class="transition duration-500 group-hover:scale-110 object-contain h-full">
                <span class="absolute top-4 right-4 bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </div>
            <div class="p-6">
                <p class="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">${product.category}</p>
                <h3 class="font-bold text-blue-900 text-lg mb-4 truncate">${product.name}</h3>
                <div class="flex items-center justify-between">
                    <span class="text-2xl font-black text-blue-900">₹${product.price.toLocaleString()}</span>
                    <button onclick="event.stopPropagation(); addToCart('${product.name}', ${product.price})" 
                            class="bg-blue-900 text-white p-4 rounded-xl hover:bg-orange-500 transition-all shadow-lg active:scale-90">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });
}

// Global Search & Filter Handlers
function handleSearch(e) {
    renderShop('All', e.target.value);
}

function filterByCategory(category) {
    renderShop(category, '');
}

function viewProductDetails(id) {
    localStorage.setItem("current_view_id", id);
    window.location.href = 'products-details.html';
}

document.addEventListener('DOMContentLoaded', () => renderShop());

const mishraProducts = [
    { id: "21011", name: "Anchor Roma 1-Way Switch", price: 45, category: "Switches", image: "./Anchor Switches/Anchor Roma 1-Way Switch.jpeg" },
    { id: "21022", name: "Anchor Roma 2-Way Switch", price: 65, category: "Switches", image: "./Anchor Switches/Anchor Roma 2-Way Switch.jpeg" },
    { id: "21033", name: "Anchor Roma 1-Way Switch with Indicator", price: 85, category: "Switches", image: "./Anchor Switches/Anchor Roma 1-Way Switch with Indicator.jpeg" },
    { id: "30840", name: "Anchor Roma 20A DP Switch", price: 210, category: "Switchgear", image: "./Anchor Switches/Anchor Roma Switch (Fan Mark Special Branding).jpg" },
    { id: "21044", name: "Anchor Roma Bell Push Switch", price: 95, category: "Switches", image: "./Anchor Switches/Anchor Roma Bell Push Switch.jpeg" },
    { id: "21055", name: "Anchor Roma Bell Push with Indicator", price: 130, category: "Switches", image: "./Anchor Switches/Anchor Roma Bell Push Switch with Indicator.jpeg" },
    { id: "21510", name: "Anchor 1-Way Switch (10AX)", price: 40, category: "Switches", image: "./Anchor Switches/1-Way Switch (10AX).jpeg" },
    { id: "34964", name: "1-Way Switch with Neon Indicator", price: 75, category: "Switches", image: "./Anchor Switches/1-Way Switch with Neon Indicator.jpeg" },
    { id: "21521", name: "Anchor 2-Way Switch (10AX)", price: 60, category: "Switches", image: "./Anchor Switches/2-Way Switch (10AX).jpeg" },
    { id: "21554", name: "Bell Push Switch (2 Module)", price: 150, category: "Switches", image: "./Anchor Switches/Bell Push Switch (2 Module).jpeg" },
    { id: "30715", name: "Bell Push with Indicator (2 Module)", price: 185, category: "Switches", image: "./Anchor Switches/Bell Push with Indicator (2 Module).jpeg" }
];