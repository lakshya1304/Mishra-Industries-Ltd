// Main Site Controller - Mishra Industries
document.addEventListener('DOMContentLoaded', () => {
    console.log("Mishra Industries Site Loaded Successfully");

    // Initialize Tooltips or simple animations
    const productCards = document.querySelectorAll('.category-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('animate__animated', 'animate__pulse');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('animate__animated', 'animate__pulse');
        });
    });
});

// Search functionality placeholder
function handleSearch(event) {
    const query = event.target.value;
    if(query.length > 3) {
        console.log("Searching for: " + query);
    }
}

document.addEventListener('change', (e) => {
    if (e.target.name === 'accType') {
        const companyField = document.getElementById('regCompany').parentElement;
        if (e.target.value === 'customer') {
            companyField.style.opacity = '0.5'; // Just dim it for customers
        } else {
            companyField.style.opacity = '1'; // Full visibility for retailers
        }
    }
});

// Replace the grid content in shop.html using this logic
function renderShop() {
    const products = JSON.parse(localStorage.getItem("Mishra_Products"));
    const grid = document.querySelector('.grid'); // Your main shop grid
    grid.innerHTML = ""; 

    products.forEach(product => {
        grid.innerHTML += `
        <div onclick="viewProduct('${product.id}')" class="bg-white rounded-2xl border border-gray-100 hover-lift overflow-hidden group cursor-pointer relative">
            <div class="h-64 bg-gray-50 flex items-center justify-center p-6">
                <img src="${product.image}" class="group-hover:scale-110 transition h-full object-contain">
            </div>
            <div class="p-6">
                <h3 class="font-bold text-blue-900 text-xl">${product.name}</h3>
                <p class="text-blue-600 font-black text-2xl my-3">₹${product.price}</p>
                <button onclick="event.stopPropagation(); addToCart('${product.name}', ${product.price})" 
                        class="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition">Add to Cart</button>
            </div>
        </div>`;
    });
}

function viewProduct(id) {
    localStorage.setItem("current_view_id", id);
    window.location.href = 'products-details.html';
}

// Registration Logic for Mishra Industries
function handleRegistration() {
    // 1. Capture Form Data
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const pass = document.getElementById('regPass').value;
    const type = document.querySelector('input[name="accType"]:checked').value;
    const business = document.getElementById('regCompany').value;

    // 2. Validation
    if (!name || !email || !phone || !pass) {
        alert("Please fill all required fields.");
        return;
    }
    if (type === 'retail' && !business) {
        alert("Retailers must provide a Business Name.");
        return;
    }

    // 3. Create User Database
    let users = JSON.parse(localStorage.getItem("Mishra_Users")) || [];
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert("Email already registered. Please login.");
        return;
    }

    const newUser = {
        id: "USR-" + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: pass, // In a real app, this would be hashed
        accountType: type,
        businessName: type === 'retail' ? business : null,
        joinDate: new Date().toLocaleDateString()
    };

    // 4. Save and Redirect
    users.push(newUser);
    localStorage.setItem("Mishra_Users", JSON.stringify(users));
    
    alert(`Welcome to Mishra Industries, ${name}! Your ${type} account is ready.`);
    window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("closeMobileMenu");

    // Open/Close Mobile Menu logic for Image 2
    if (mobileBtn && mobileMenu) {
        mobileBtn.onclick = () => {
            mobileMenu.classList.remove("hidden");
            mobileMenu.classList.add("flex");
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("flex");
        };
    }
});

// Global function for toggleCart (so the onclick works)
function toggleCart() {
    const sidebar = document.getElementById("cartSidebar");
    if (sidebar) {
        sidebar.classList.toggle("translate-x-full");
    }
}

// Global helper for mobile links
function closeMenu() {
    document.getElementById("mobileMenu").classList.add("hidden");
}

let slideIndex = 0;
        showSlides();

        function showSlides() {
            let i;
            let slides = document.getElementsByClassName("slide");
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";  
            }
            slideIndex++;
            if (slideIndex > slides.length) {slideIndex = 1}    
            slides[slideIndex-1].style.display = "block";  
            setTimeout(showSlides, 3000); // Change image every 3 seconds
        }

        // Global function for the Cart Button
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('translate-x-full');
    }
}

// Global function to close mobile menu
function closeMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileBtn) {
        mobileBtn.onclick = () => {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
        };
    }

    if (closeBtn) {
        closeBtn.onclick = closeMenu;
    }
});