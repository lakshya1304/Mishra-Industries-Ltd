async function fetchUsers() {
  try {
    const response = await fetch(
      "https://mishra-industries-ltd-yjfr.onrender.com/api/auth/all-users",
    );
    const users = await response.json();

    const customerList = document.getElementById("customerList");
    const retailerList = document.getElementById("retailerList");

    customerList.innerHTML = "";
    retailerList.innerHTML = "";

    users.forEach((user) => {
      const isRetailer = user.accountType === "retailer";

      const userCard = `
                <div class="p-5 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1 w-full">
                            <h4 class="font-black text-blue-900 text-sm uppercase tracking-tight">${user.fullName}</h4>
                            <p class="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <i class="fas fa-envelope text-blue-300"></i> ${user.email}
                            </p>
                            <p class="text-[10px] text-gray-500 font-black flex items-center gap-1">
                                <i class="fas fa-phone text-green-500"></i> +91 ${user.phone || "No Number"}
                            </p>
                            
                            ${
                              isRetailer ?
                                `
                                <div class="mt-3 grid grid-cols-1 gap-2">
                                    ${
                                      user.businessName ?
                                        `
                                        <div class="px-3 py-1.5 bg-orange-100 rounded-xl border border-orange-200">
                                            <p class="text-[9px] text-orange-600 font-black uppercase">
                                                <i class="fas fa-building mr-1"></i> ${user.businessName}
                                            </p>
                                        </div>
                                    `
                                      : ""
                                    }
                                    <div class="px-3 py-1.5 bg-blue-900 rounded-xl border border-blue-800">
                                        <p class="text-[8px] text-blue-200 font-black uppercase tracking-widest">GST Identification</p>
                                        <p class="text-[10px] text-orange-500 font-black uppercase tracking-tighter">
                                            ${user.gstNumber || "NOT PROVIDED"}
                                        </p>
                                    </div>
                                </div>
                            `
                              : ""
                            }
                        </div>
                        
                        <div class="flex flex-col items-end gap-2 shrink-0 ml-2">
                            <span class="text-[9px] font-black text-gray-300 uppercase bg-white px-2 py-1 rounded-lg border border-gray-100">
                                ID: ${user._id.slice(-4)}
                            </span>
                            <button onclick="deleteUser('${user._id}', '${user.fullName}')" 
                                    class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>
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
async function deleteUser(userId, userName) {
    console.log("Attempting to delete ID:", userId); // Debugging line
    
    if (!userId || userId === 'undefined') {
        return alert("Error: User ID is missing in the frontend.");
    }

    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
        const response = await fetch(`https://mishra-industries-ltd-yjfr.onrender.com/api/auth/delete-user/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ ${userName} removed successfully.`);
            fetchUsers(); // Refresh the directory
        } else {
            // This will alert "User not found in Mishra Atlas" from your backend
            alert(`❌ Error: ${data.message}`);
        }
    } catch (err) {
        alert("❌ Server Error: Check your backend deployment.");
    }
}

async function deleteAllUsers() {
    // Triple confirmation for safety
    const confirm1 = confirm("⚠️ DANGER: You are about to delete EVERY user in the database.");
    if (!confirm1) return;
    
    const confirm2 = confirm("This includes all Customers and Retailers. Are you absolutely sure?");
    if (!confirm2) return;

    try {
        const response = await fetch(`https://mishra-industries-ltd-yjfr.onrender.com/api/auth/delete-all-users`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Database Cleared: ${data.message}`);
            fetchUsers(); // Refresh UI to show empty state
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (err) {
        alert("❌ Server Error: Connection failed.");
    }
}

document.addEventListener("DOMContentLoaded", fetchUsers);
// Optional: Auto-refresh every 30 seconds instead of 5 to save bandwidth
setInterval(fetchUsers, 30000);
