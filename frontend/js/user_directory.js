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

    // UPDATED: Added flex-col sm:flex-row and adjusted padding for mobile
    const userCard = `
            <div class="p-4 md:p-5 bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative animate__animated animate__fadeIn mb-4">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div class="space-y-1 w-full flex-1">
                        <div class="flex items-center gap-2">
                            <h4 class="font-black text-blue-900 text-sm uppercase tracking-tight truncate">${user.fullName}</h4>
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                        </div>
                        <p class="text-[10px] text-gray-400 font-bold flex items-center gap-1 break-all">
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
                                    <p class="text-[9px] text-orange-600 font-black uppercase truncate"><i class="fas fa-building mr-1"></i> ${user.businessName || "Business"}</p>
                                </div>
                                <div class="px-3 py-1.5 bg-blue-900 rounded-xl border border-blue-800">
                                    <p class="text-[8px] text-blue-200 font-black uppercase tracking-widest">GSTID</p>
                                    <p class="text-[10px] text-orange-500 font-black uppercase tracking-tighter">${user.gstNumber || "N/A"}</p>
                                </div>
                            </div>`
                          : ""
                        }
                        
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button onclick="viewUserOrders('${user._id}', '${user.fullName}')" class="flex-1 sm:flex-none px-4 py-2 bg-white text-blue-900 border border-blue-100 rounded-lg text-[9px] font-black uppercase hover:bg-blue-900 hover:text-white transition-all shadow-sm">
                                <i class="fas fa-receipt mr-1"></i> View Orders
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-none pt-3 sm:pt-0">
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

// MODERN ORDER POPUP
async function viewUserOrders(userId, userName) {
  const modal = document.getElementById("orderHistoryModal");
  const list = document.getElementById("modalOrderList");
  const lifetimeDisplay = document.getElementById("modalLifetimeValue");
  const nameDisplay = document.getElementById("modalUserName");

  list.innerHTML = `<div class="p-10 text-center"><i class="fas fa-circle-notch fa-spin text-blue-900 text-2xl"></i></div>`;
  modal.classList.remove("hidden");
  // Mobile Fix: Set modal flex to ensure centering
  modal.style.display = "flex";
  nameDisplay.innerText = `${userName.split(" ")[0]}'s History`;

  try {
    const response = await fetch(`${API_BASE}/orders/all`);
    const allOrders = await response.json();
    const userOrders = allOrders.filter(
      (o) => o.user && (o.user._id === userId || o.user === userId),
    );

    if (userOrders.length === 0) {
      list.innerHTML = `
                <div class="py-12 text-center">
                    <i class="fas fa-box-open text-slate-200 text-5xl mb-4"></i>
                    <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No orders found</p>
                </div>`;
      lifetimeDisplay.innerText = "₹0";
    } else {
      let lifetime = 0;
      // UPDATED: Optimized order items for narrow width view
      list.innerHTML = userOrders
        .map((o) => {
          lifetime += o.totalAmount;
          const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          });
          return `
                    <div class="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-900 transition-all gap-2">
                        <div class="min-w-0">
                            <p class="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 truncate">#${o._id.slice(-6).toUpperCase()}</p>
                            <p class="text-xs font-black text-blue-900">${date}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-sm font-black text-blue-900 tracking-tighter">₹${o.totalAmount.toLocaleString()}</p>
                            <span class="text-[8px] font-black uppercase text-emerald-500">${o.status || "Pending"}</span>
                        </div>
                    </div>`;
        })
        .join("");
      lifetimeDisplay.innerText = `₹${lifetime.toLocaleString()}`;
    }
  } catch (err) {
    list.innerHTML = `<p class="p-10 text-center text-red-500 font-bold">Sync Failed</p>`;
  }
}

function closeOrderModal() {
  const modal = document.getElementById("orderHistoryModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
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
