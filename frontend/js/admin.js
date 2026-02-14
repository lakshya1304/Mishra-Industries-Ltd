// Admin Panel Logic - Mishra Industries
function deleteProduct(productId) {
    if(confirm("Are you sure you want to remove this product from the website?")) {
        console.log("Deleting product: " + productId);
        // This will connect to the Backend API later
        alert("Product removed successfully.");
    }
}

function updateStock(productId, newQuantity) {
    console.log(`Updating Product ${productId} to ${newQuantity} units.`);
    // Real-time stock update logic
    alert("Stock level updated for Mishra Industries Inventory.");
}

// Toggle Add Product Modal
function openEditor() {
    const modal = document.getElementById('productModal');
    if(modal) modal.style.display = 'flex';
}

// Default Product Data for Mishra Industries Limited
const defaultProducts = [
    {
        id: "MI-CB-001",
        name: "Industrial Copper Cable (100m)",
        category: "Cables",
        price: 2499,
        stock: 450,
        status: "Live",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400",
        description: "High-conductivity copper wire designed for mass production and industrial power distribution."
    }
];

// Initialize Storage if empty
if (!localStorage.getItem("Mishra_Products")) {
    localStorage.setItem("Mishra_Products", JSON.stringify(defaultProducts));
}

function getProducts() {
    return JSON.parse(localStorage.getItem("Mishra_Products"));
}

function saveProducts(products) {
    localStorage.setItem("Mishra_Products", JSON.stringify(products));
}

// Function to handle adding a new product from the Site Editor Modal
function handleProductForm() {
    // 1. Capture inputs from the modal
    const title = document.querySelector('#productModal input[type="text"]').value;
    const price = parseFloat(document.querySelector('#productModal input[type="number"]').value);
    const category = document.querySelector('#productModal select').value;
    const description = document.querySelector('#productModal textarea').value;
    
    // Check if fields are filled
    if (!title || !price || !description) {
        alert("Please fill all fields to publish the product.");
        return;
    }

    // 2. Create a unique ID and new product object
    const products = JSON.parse(localStorage.getItem("Mishra_Products")) || [];
    const newId = "MI-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newProduct = {
        id: newId,
        name: title,
        category: category,
        price: price,
        stock: 0, // Initial stock is 0 for new items
        status: "Live",
        image: "https://images.unsplash.com/photo-1558444479-c8a510526a8e?auto=format&fit=crop&w=400", // Default placeholder
        description: description
    };

    // 3. Save to LocalStorage and Refresh
    products.push(newProduct);
    localStorage.setItem("Mishra_Products", JSON.stringify(products));
    
    alert("Product added successfully!");
    location.reload(); // Refresh to show new product in the table
}

// Function to delete a product
function deleteProduct(id) {
    if (confirm("Are you sure you want to remove this product from Mishra Industries?")) {
        let products = JSON.parse(localStorage.getItem("Mishra_Products"));
        products = products.filter(p => p.id !== id);
        localStorage.setItem("Mishra_Products", JSON.stringify(products));
        location.reload();
    }
}

// Function to update inventory levels for a specific product
function updateStock(productId, newQuantity) {
    let products = JSON.parse(localStorage.getItem("Mishra_Products")) || [];
    
    // Find the product and update its stock property
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index].stock = newQuantity;
        localStorage.setItem("Mishra_Products", JSON.stringify(products));
        alert(`Stock updated for ${products[index].name}. Status: ${newQuantity < 10 ? 'CRITICAL' : 'OK'}`);
    }
}

/**
 * Updates inventory levels and refreshes all linked components
 * @param {string} productId - Unique MI SKU code
 * @param {number} newQuantity - New stock count
 */
function updateStock(productId, newQuantity) {
    let products = JSON.parse(localStorage.getItem("Mishra_Products")) || [];
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index].stock = Math.max(0, newQuantity); // Prevents negative stock
        localStorage.setItem("Mishra_Products", JSON.stringify(products));
        
        // Visual confirmation for Admin
        const status = newQuantity < 10 ? 'CRITICAL' : 'STABLE';
        console.log(`[Mishra Admin] SKU: ${productId} updated to ${newQuantity}. Status: ${status}`);
    }
}