// const API_BASE = "https://remadata-retaile1-app.onrender.com"; // Your Render backend

// let selectedNetwork = "";

// // Select network
// function selectNetwork(network) {
//     selectedNetwork = network.toLowerCase();
//     document.getElementById("log").textContent =
//         "Loading bundles for " + selectedNetwork.toUpperCase() + "...";
//     loadBundles(selectedNetwork);
// }

// // Load bundles
// async function loadBundles(network) {
//     try {
//         const response = await fetch(`${API_BASE}/bundles?network=${network}`);
//         const json = await response.json();

//         const bundles = Array.isArray(json.bundles) ? json.bundles : [];
//         const planSelect = document.getElementById("plan");
//         planSelect.innerHTML = '<option value="">Select plan</option>';

//         bundles.forEach(bundle => {
//             const option = document.createElement("option");
//             option.value = bundle.volumeInMB;
//             option.textContent = `${bundle.name} - GHS ${bundle.price}`;
//             planSelect.appendChild(option);
//         });

//         document.getElementById("log").textContent =
//             bundles.length ? "Bundles loaded successfully ✅" : "No bundles available";

//     } catch (error) {
//         document.getElementById("log").textContent =
//             "Error loading bundles: " + error.message;
//         console.error("Bundle load error:", error);
//     }
// }

// // Get wallet balance
// async function getWalletBalance() {
//     try {
//         const response = await fetch(`${API_BASE}/wallet-balance`);
//         const json = await response.json();

//         if (json.status === "success" && json.data) {
//             document.getElementById("balance").textContent =
//                 `Balance: ${json.data.balance} ${json.data.currency}`;
//             document.getElementById("log").textContent =
//                 "Wallet balance retrieved ✅";
//         } else {
//             document.getElementById("log").textContent =
//                 "Failed to fetch wallet balance";
//         }
//     } catch (error) {
//         document.getElementById("log").textContent =
//             "Balance error: " + error.message;
//         console.error("Wallet balance error:", error);
//     }
// }

// // Buy bundle
// async function buyBundle() {
//     const phone = document.getElementById("phone").value.trim();
//     const planVolume = document.getElementById("plan").value;

//     if (!phone || !planVolume || !selectedNetwork) {
//         alert("Enter phone, select network & plan");
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE}/buy-data`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 phone,
//                 plan: planVolume,
//                 network: selectedNetwork
//             })
//         });

//         const json = await response.json();
//         if (json.status === "success" || json.data) {
//             document.getElementById("log").textContent =
//                 `Data purchase successful ✅ Ref: ${json.data?.ref || ""}`;
//         } else {
//             document.getElementById("log").textContent =
//                 `Purchase failed: ${json.error || "Unknown error"}`;
//         }
//     } catch (error) {
//         document.getElementById("log").textContent =
//             "Buy data error: " + error.message;
//         console.error("Buy data error:", error);
//     }
// }


// const API_BASE = "https://remadata-retaile1-app.onrender.com";

// let selectedNetwork = "";

// // Select network
// function selectNetwork(network) {
//     selectedNetwork = network.toLowerCase();
//     document.getElementById("log").textContent =
//         "Loading bundles for " + selectedNetwork.toUpperCase() + "...";
//     loadBundles(selectedNetwork);
// }


// // Load bundles
// async function loadBundles(network) {

//     try {

//         const response = await fetch(`${API_BASE}/bundles?network=${network}`);
//         const json = await response.json();

//         const bundles = Array.isArray(json.bundles) ? json.bundles : [];

//         const planSelect = document.getElementById("plan");
//         planSelect.innerHTML = '<option value="">Select plan</option>';

//         bundles.forEach(bundle => {

//             const option = document.createElement("option");

//             option.value = bundle.volumeInMB;
//             option.dataset.price = bundle.price;

//             option.textContent = `${bundle.name} - GHS ${bundle.price}`;

//             planSelect.appendChild(option);

//         });

//         document.getElementById("log").textContent =
//             bundles.length ? "Bundles loaded successfully ✅" : "No bundles available";

//     } catch (error) {

//         document.getElementById("log").textContent =
//             "Error loading bundles: " + error.message;

//     }

// }



// // Initialize payment
// async function buyBundle() {

//     const phone = document.getElementById("phone").value.trim();
//     const planSelect = document.getElementById("plan");

//     const plan = planSelect.value;
//     const price = planSelect.options[planSelect.selectedIndex].dataset.price;

//     const email = document.getElementById("email").value;

//     if (!phone || !plan || !selectedNetwork || !email) {

//         alert("Enter email, phone, network and select plan");
//         return;

//     }

//     document.getElementById("log").textContent = "Initializing payment...";

//     try {

//         const response = await fetch(`${API_BASE}/initialize-payment`, {

//             method: "POST",

//             headers: {
//                 "Content-Type": "application/json"
//             },

//             body: JSON.stringify({

//                 email: email,
//                 amount: price,
//                 phone: phone,
//                 plan: plan,
//                 network: selectedNetwork

//             })

//         });

//         const json = await response.json();

//         if (json.data && json.data.authorization_url) {

//             // Redirect to Paystack payment page
//             window.location.href = json.data.authorization_url;

//         } else {

//             document.getElementById("log").textContent =
//                 "Payment initialization failed";

//         }

//     } catch (error) {

//         document.getElementById("log").textContent =
//             "Payment error: " + error.message;

//     }

// }



// // Verify payment after redirect
// async function verifyPayment() {

//     const params = new URLSearchParams(window.location.search);
//     const reference = params.get("reference");

//     if (!reference) return;

//     document.getElementById("log").textContent =
//         "Verifying payment...";

//     try {

//         const response = await fetch(`${API_BASE}/verify-payment/${reference}`);

//         const json = await response.json();

//         if (json.payment === "successful") {

//             document.getElementById("log").textContent =
//                 "Payment successful ✅ Data sent to phone";

//         } else {

//             document.getElementById("log").textContent =
//                 "Payment verification failed";

//         }

//     } catch (error) {

//         document.getElementById("log").textContent =
//             "Verification error: " + error.message;

//     }

// }


// // Run verification on page load
// verifyPayment();

const API_BASE = "https://remadata-retaile1-app.onrender.com";

let selectedNetwork = "";
let selectedPlan = "";
let selectedPrice = 0;

// ----------------------------
// SELECT NETWORK
// ----------------------------
function selectNetwork(network) {
    selectedNetwork = network.toLowerCase();
    document.getElementById("log").textContent =
        "Loading bundles for " + selectedNetwork.toUpperCase() + "...";
    loadBundles(selectedNetwork);
}

// ----------------------------
// LOAD BUNDLES
// ----------------------------
async function loadBundles(network) {
    try {
        const response = await fetch(`${API_BASE}/bundles?network=${network}`);
        const json = await response.json();
        const bundles = Array.isArray(json.bundles) ? json.bundles : [];

        const planSelect = document.getElementById("plan");
        planSelect.innerHTML = '<option value="">Select plan</option>';

        bundles.forEach(bundle => {
            const option = document.createElement("option");
            option.value = bundle.volumeInMB;
            option.dataset.price = bundle.price;
            option.textContent = `${bundle.name} - GHS ${bundle.price}`;
            planSelect.appendChild(option);
        });

        document.getElementById("log").textContent =
            bundles.length ? "Bundles loaded successfully ✅" : "No bundles available";

    } catch (error) {
        document.getElementById("log").textContent =
            "Error loading bundles: " + error.message;
    }
}

// ----------------------------
// BUY BUNDLE (START PAYMENT)
// ----------------------------
async function buyBundle() {
    const phone = document.getElementById("phone").value.trim();
    const planSelect = document.getElementById("plan");
    const plan = planSelect.value;
    const price = planSelect.options[planSelect.selectedIndex]?.dataset.price;
    const email = document.getElementById("email").value.trim();

    if (!phone || !plan || !selectedNetwork || !email) {
        alert("Enter email, phone, network and select plan");
        return;
    }

    document.getElementById("log").textContent = "Initializing payment...";

    try {
        // CALL BACKEND TO GET PAYSTACK AUTHORIZATION URL
        const response = await fetch(`${API_BASE}/initialize-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                amount: price,
                phone,
                plan,
                network: selectedNetwork
            })
        });

        const data = await response.json();

        if (!data.status) {
            document.getElementById("log").textContent =
                "Payment initialization failed";
            return;
        }

        // Redirect user to Paystack Checkout
        window.location.href = data.data.authorization_url;

    } catch (error) {
        document.getElementById("log").textContent =
            "Payment initialization error: " + error.message;
    }
}

// ----------------------------
// VERIFY PAYMENT AFTER REDIRECT
// ----------------------------
async function verifyPayment(reference) {
    try {
        const response = await fetch(`${API_BASE}/verify-payment/${reference}`);
        const json = await response.json();

        if (json.payment === "successful") {
            document.getElementById("log").textContent =
                "Payment verified ✅ Data sent to phone";
        } else {
            document.getElementById("log").textContent =
                "Payment verification failed";
        }
    } catch (error) {
        document.getElementById("log").textContent =
            "Verification error: " + error.message;
    }
}

// ----------------------------
// AUTO VERIFY ON PAGE LOAD (AFTER PAYSTACK REDIRECT)
// ----------------------------
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) {
        document.getElementById("log").textContent =
            "Verifying payment reference: " + reference;
        verifyPayment(reference);
    }
};