 let selectedType = 'customer';

        function toggleType(type) {
            selectedType = type;
            const tabCust = document.getElementById('tabCustomer');
            const tabRet = document.getElementById('tabRetailer');
            const bizInp = document.getElementById('bizContainer');

            if(type === 'customer') {
                tabCust.classList.add('active-tab');
                tabRet.classList.remove('active-tab');
                tabRet.classList.add('text-gray-400');
                bizInp.classList.add('hidden');
            } else {
                tabRet.classList.add('active-tab');
                tabCust.classList.remove('active-tab');
                tabCust.classList.add('text-gray-400');
                bizInp.classList.remove('hidden');
            }
        }

        function handleRegistration() {
            alert("Mishra Industries: Registering " + selectedType);
        }


        async function handleRegistration() {
    // 1. Grab values from your floating-label inputs
    const fullName = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPass').value;
    const businessName = document.getElementById('regBusiness').value;
    // selectedType is already handled by your toggleType() function

    // 2. Simple Validation
    if (!fullName || !email || !password) {
        return alert("Please fill in all required fields.");
    }

    try {
        // 3. Send POST request to your Backend
        const response = await fetch('https://mishra-industries-ltd-yjfr.onrender.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                accountType: selectedType,
                businessName: selectedType === 'retailer' ? businessName : undefined
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration Successful! Redirecting to login...");
            window.location.href = 'login.html';
        } else {
            alert(data.message || "Registration failed");
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Cannot connect to server. Ensure backend is running.");
    }
}