    
    document.addEventListener("DOMContentLoaded", () => {
        // 1. SABHI PRODUCTS KA DATA
        const allMishraProducts = [
            {
    id: "21011",
    name: "Anchor Roma 1-Way Switch",
    price: 1460,
    category: "Switches",
    image: "./Anchor Switches/Anchor Roma 1-Way Switch.jpeg",
    description: "Model: 21011. High-Grade Polycarbonate body. 10AX current rating for inductive loads. Tested for 1,00,000 operations. Silver Cadmium Oxide contacts for high conductivity. ISI Marked (IS 3854)."
},
            {
                id: "21022",
                name: "Anchor Roma 2-Way Switch",
                price: 3160,
                category: "Switches",
                image: "./Anchor Switches/Anchor Roma 2-Way Switch.jpeg",
                description: "Model: 21022. Single-pole, double-throw (SPDT). Visual ID: 2 small dots. Ideal for staircase wiring. IP20 protection class. Captive brass terminals for easy installation."
            },
            {
                id: "21033",
                name: "Anchor Roma 1-Way Switch with Indicator",
                price: 3260,
                category: "Switches",
                image: "./Anchor Switches/Anchor Roma 1-Way Switch with Indicator.jpeg",
                description: "Model: 21033. Integrated neon locator lamp (Red LED). Indicator glows when switch is ON. Best for Geysers and Pumps. UV Stabilized fire-retardant material."
            },
            {
                id: "30840",
                name: "Anchor Roma 20A DP Switch",
                price: 3260,
                category: "Switchgear",
                image: "./Anchor Switches/Anchor Roma Switch (Fan Mark Special Branding).jpeg",
                description: "Model: 30840. Heavy-duty 20A Double Pole switch with Fan/Special branding. Specifically rated for 100W SBL loads. Silver Nickel contacts to prevent arcing."
            },
            {
                id: "21044",
                name: "Anchor Roma Bell Push Switch",
                price: 3280,
                category: "Switches",
                image: "./Anchor Switches/Anchor Roma Bell Push Switch.jpeg",
                description: "Model: 21044. Momentary Push-to-Make switch. Features a printed Bell icon. Spring-loaded rocker mechanism. 10A current rating. Polycarbonate shock-resistant body."
            },
            {
                id: "21055",
                name: "Anchor Roma Bell Push with Indicator",
                price: 3500,
                category: "Switches",
                image: "./Anchor Switches/Anchor Roma Bell Push Switch with Indicator.jpeg",
                description: "Model: 21055. Locator indicator glows in the dark (OFF mode). Helps visitors find the doorbell at night. Requires neutral wire for neon. ISI certified safety standards."
            },
            {
                id: "21510",
                name: "Anchor 1-Way Switch (10AX)",
                price: 1660,
                category: "Switches",
                image: "./Anchor Switches/1-Way Switch (10AX).jpeg",
                description: "Model: 21510. Standard 1 Module size. Spark shield internal design. Silver Cadmium Oxide contacts prevent sticking. Suitable for LED drivers and fans."
            },
            {
                id: "34964",
                name: "1-Way Switch with Neon Indicator",
                price: 1880,
                category: "Switches",
                image: "./Anchor Switches/1-Way Switch with Neon Indicator.jpeg",
                description: "Model: 39464. Features built-in red neon light. Long-life neon lamp (thousands of hours). IP20 rated finger-proof terminals. High-grade FR Polycarbonate."
            },
            {
                id: "21521",
                name: "Anchor 2-Way Switch (10AX)",
                price: 1880,
                category: "Switches",
                image: "./Anchor Switches/2-Way Switch (10AX).jpeg",
                description: "Model: 21521. Essential for staircase and bedroom convenience. Soft-click mechanism. Visual ID: Two dots on rocker. Captive screws for fast installation."
            },
            {
                id: "21554",
                name: "Bell Push Switch (2 Module)",
                price: 1880,
                category: "Switches",
                image: "./Anchor Switches/Bell Push Switch (2 Module).jpeg",
                description: "Model: 21554. Wide 2-Module surface area for easy press. Printed Bell symbol. Tested for 1,00,000+ operations. Ideal for luxury residential entrances."
            },
            {
                id: "30715",
                name: "Bell Push with Indicator (2 Module)",
                price: 2060,
                category: "Switches",
                image: "./Anchor Switches/Bell Push with Indicator (2 Module).jpeg",
                description: "Model: 30175. Premium 2-Module doorbell switch with neon indicator. Continuous red glow for night visibility. Fire-retardant UV stabilized body. ISI marked."
            }
        ];

        // Database Sync
        localStorage.setItem("Mishra_Products", JSON.stringify(allMishraProducts));

        // Display Logic
        const currentId = localStorage.getItem("current_view_id");
        const product = allMishraProducts.find((p) => p.id === currentId);

        if (product) {
            document.getElementById("displayName").innerText = product.name;
            document.getElementById("displayPrice").innerText = "₹" + product.price.toLocaleString();
            document.getElementById("displayDescription").innerText = product.description;
            document.getElementById("displayCategory").innerText = product.category;
            document.getElementById("displayImage").src = product.image;
            document.title = `${product.name} | Mishra Industries`;

            document.getElementById("addToCartBtn").onclick = () => {
                const qty = parseInt(document.getElementById("quantityInput").value);
                for (let i = 0; i < qty; i++) {
                    addToCart(product.name, product.price);
                }
                alert(`${qty} units of ${product.name} added to cart!`);
            };
        } else {
            window.location.href = "shop.html";
        }
    });
