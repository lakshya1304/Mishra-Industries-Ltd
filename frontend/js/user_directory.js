let allUsersData = [];
const API_BASE = "https://mishra-industries-ltd-yjfr.onrender.com/api";

async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE}/auth/all-users`);
    allUsersData = await response.json();
    renderUserLists(allUsersData);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderUserLists(users) {
  const customerList = document.getElementById("customerList");
  const retailerList = document.getElementById("retailerList");
  const customerCount = document.getElementById("customerCount");
  const retailerCount = document.getElementById("retailerCount");

  customerList.innerHTML = "";
  retailerList.innerHTML = "";

  let cCount = 0;
  let rCount = 0;

  users.forEach((user) => {
    const isRetailer = user.accountType === "retailer";
    if (isRetailer) rCount++;
    else cCount++;

    const userCard = `
            <div class="p-5 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative animate__animated animate__fadeIn">
                <div class="flex justify-between items-start">
                    <div class="space-y-1 w-full">
                        <div class="flex items-center gap-2">
                            <h4 class="font-black text-blue-900 text-sm uppercase tracking-tight">${user.fullName}</h4>
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        </div>
                        <p class="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <i class="fas fa-envelope text-blue-300 w-3"></i> ${user.email}
                        </p>
                        <p class="text-[10px] text-gray-500 font-black flex items-center gap-1">
                            <i class="fas fa-phone text-green-500 w-3"></i> ${user.phone || "No Number"}
                        </p>
                        ${
                          isRetailer ?
                            `
                            <div class="mt-3 grid grid-cols-1 gap-2">
                                <div class="px-3 py-1.5 bg-orange-100 rounded-xl border border-orange-200">
                                    <p class="text-[9px] text-orange-600 font-black uppercase"><i class="fas fa-building mr-1"></i> ${user.businessName || "Business"}</p>
                                </div>
                                <div class="px-3 py-1.5 bg-blue-900 rounded-xl border border-blue-800">
                                    <p class="text-[8px] text-blue-200 font-black uppercase tracking-widest">GSTID</p>
                                    <p class="text-[10px] text-orange-500 font-black uppercase tracking-tighter">${user.gstNumber || "N/A"}</p>
                                </div>
                            </div>`
                          : ""
                        }
                        
                        <div class="mt-4 flex gap-2">
                            <button onclick="viewUserOrders('${user._id}', '${user.fullName}')" class="px-4 py-1.5 bg-white text-blue-900 border border-blue-100 rounded-lg text-[9px] font-black uppercase hover:bg-blue-900 hover:text-white transition-all shadow-sm">
                                <i class="fas fa-receipt mr-1"></i> View Orders
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 ml-2">
                        <span class="text-[9px] font-black text-gray-300 uppercase bg-white px-2 py-1 rounded-lg border border-gray-100">ID: ${user._id.slice(-4)}</span>
                        <button onclick="deleteUser('${user._id}', '${user.fullName}')" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>`;

    if (isRetailer) retailerList.innerHTML += userCard;
    else customerList.innerHTML += userCard;
  });

  customerCount.innerText = `${cCount} Total`;
  retailerCount.innerText = `${rCount} Total`;
}

// Order History Sync
async function viewUserOrders(userId, userName) {
  try {
    const response = await fetch(`${API_BASE}/orders/all`);
    const allOrders = await response.json();
    const userOrders = allOrders.filter(
      (o) => o.user && (o.user._id === userId || o.user === userId),
    );

    if (userOrders.length === 0) {
      alert(`${userName} has not placed any orders yet.`);
    } else {
      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      alert(
        `History for ${userName}:\n- Total Orders: ${userOrders.length}\n- Lifetime Value: ₹${totalSpent.toLocaleString()}\n\nPlease check the "Orders List" page for manifest details.`,
      );
    }
  } catch (err) {
    alert("Error fetching user order history.");
  }
}

function filterUsers() {
  const query = document.getElementById("directorySearch").value.toLowerCase();
  const filtered = allUsersData.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.gstNumber && u.gstNumber.toLowerCase().includes(query)),
  );
  renderUserLists(filtered);
}

function exportToExcel() {
  if (allUsersData.length === 0) return alert("No data to export.");
  const excelData = allUsersData.map((user, index) => ({
    "Sl No.": index + 1,
    "Full Name": user.fullName,
    Email: user.email,
    Phone: user.phone || "N/A",
    Type: user.accountType.toUpperCase(),
    Business: user.businessName || "Individual",
    GST: user.gstNumber || "N/A",
  }));
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mishra_Users");
  XLSX.writeFile(
    workbook,
    `Mishra_User_Database_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

async function deleteUser(userId, userName) {
  if (!confirm(`Delete ${userName}? This will remove all associated access.`))
    return;
  try {
    const response = await fetch(`${API_BASE}/auth/delete-user/${userId}`, {
      method: "DELETE",
    });
    if (response.ok) fetchUsers();
  } catch (err) {
    console.error(err);
  }
}

async function deleteAllUsers() {
  if (
    confirm("三重 Triple Warning: Delete ALL users?") &&
    confirm("Are you sure? This cannot be undone.")
  ) {
    try {
      await fetch(`${API_BASE}/auth/delete-all-users`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchUsers);
