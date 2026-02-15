async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:5000/api/auth/all-users");
    const users = await response.json();

    const customerList = document.getElementById("customerList");
    const retailerList = document.getElementById("retailerList");

    // Clear existing content
    customerList.innerHTML = "";
    retailerList.innerHTML = "";

    users.forEach((user) => {
      const userCard = `
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                    <div>
                        <h4 class="font-black text-blue-900 text-sm uppercase">${user.fullName}</h4>
                        <p class="text-[10px] text-gray-400 font-bold">${user.email}</p>
                        ${user.businessName ? `<p class="text-[10px] text-orange-500 font-black mt-1 uppercase"><i class="fas fa-building mr-1"></i> ${user.businessName}</p>` : ""}
                    </div>
                    <div class="text-[10px] font-black text-gray-300 uppercase group-hover:text-blue-900 transition-colors">
                        ID: ${user._id.slice(-4)}
                    </div>
                </div>
            `;

      if (user.accountType === "retailer") {
        retailerList.innerHTML += userCard;
      } else {
        customerList.innerHTML += userCard;
      }
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

// Automatically load users when page opens
document.addEventListener("DOMContentLoaded", fetchUsers);

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/all-users');
        const users = await response.json();

        const customerList = document.getElementById('customerList');
        const retailerList = document.getElementById('retailerList');

        customerList.innerHTML = '';
        retailerList.innerHTML = '';

        users.forEach(user => {
            // Check if user is retailer to show business name
            const isRetailer = user.accountType === 'retailer';
            
            const userCard = `
                <div class="p-5 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <h4 class="font-black text-blue-900 text-sm uppercase tracking-tight">${user.fullName}</h4>
                            <p class="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <i class="fas fa-envelope text-blue-300"></i> ${user.email}
                            </p>
                            <p class="text-[10px] text-gray-500 font-black flex items-center gap-1">
                                <i class="fas fa-phone text-green-500"></i> ${user.phone || 'No Number'}
                            </p>
                            
                            ${isRetailer && user.businessName ? `
                                <div class="mt-2 inline-block px-3 py-1 bg-orange-100 rounded-full">
                                    <p class="text-[9px] text-orange-600 font-black uppercase">
                                        <i class="fas fa-building mr-1"></i> ${user.businessName}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                        <span class="text-[9px] font-black text-gray-300 uppercase bg-white px-2 py-1 rounded-lg border border-gray-100">
                            ID: ${user._id.slice(-4)}
                        </span>
                    </div>
                </div>
            `;

            if (isRetailer) {
                retailerList.innerHTML += userCard;
            } else {
                customerList.innerHTML += userCard;
            }
        });
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// Keep your auto-update logic
document.addEventListener('DOMContentLoaded', fetchUsers);
setInterval(fetchUsers, 5000);