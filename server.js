

// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// app.use(cors());
// app.use(express.json());

// // 🔹 Serve the frontend UI
// app.use(express.static(path.join(__dirname, "public")));

// // 🔹 Root route (loads UI)
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // --- Health check
// app.get("/health", (req, res) => {
//     res.json({ status: "Server running ✅" });
// });

// // --- Get bundles
// app.get("/bundles", async (req, res) => {
//     try {
//         const network = req.query.network;

//         const response = await axios.get("https://remadata.com/api/bundles", {
//             headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
//         });

//         let bundles = response.data.data || [];

//         if (network) {
//             bundles = bundles.filter(
//                 b => b.network && b.network.toLowerCase() === network.toLowerCase()
//             );
//         }

//         res.json({ bundles });

//     } catch (error) {
//         console.error("Bundle fetch error:", error.message);
//         res.status(500).json({
//             error: "Failed to fetch bundles",
//             details: error.message
//         });
//     }
// });

// // --- Wallet balance
// app.get("/wallet-balance", async (req, res) => {
//     try {
//         const response = await axios.get("https://remadata.com/api/wallet-balance", {
//             headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
//         });

//         res.json(response.data);

//     } catch (error) {
//         console.error("Wallet balance error:", error.response?.data || error.message);
//         res.status(500).json({
//             error: "Failed to get wallet balance",
//             details: error.response?.data || error.message
//         });
//     }
// });

// // --- Buy data
// app.post("/buy-data", async (req, res) => {
//     try {
//         const { phone, plan, network } = req.body;

//         const response = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: `ORDER_${Date.now()}`,
//                 phone,
//                 volumeInMB: parseInt(plan),
//                 networkType: network.toLowerCase()
//             },
//             {
//                 headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {
//         console.error("Buy data error:", error.response?.data || error.message);
//         res.status(500).json({
//             error: "Transaction failed",
//             details: error.response?.data || error.message
//         });
//     }
// });

// // --- Start server
// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

/* =========================
   PROFIT CONFIGURATION
========================= */

const MARKUP_PERCENT = 30; // 30% profit margin

function calculateSellingPrice(cost) {
    const price = cost + (cost * MARKUP_PERCENT / 100);
    return Number(price.toFixed(2));
}

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
    res.json({ status: "Server running" });
});

/* =========================
   GET DATA BUNDLES
========================= */

app.get("/bundles", async (req, res) => {

    try {

        const response = await axios.get(
            "https://remadata.com/api/bundles",
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        const bundles = response.data.data.map(bundle => {

            const costPrice = Number(bundle.price);
            const sellingPrice = calculateSellingPrice(costPrice);

            return {
                id: bundle.id,
                network: bundle.network,
                volume: bundle.volume,
                cost_price: costPrice,
                selling_price: sellingPrice
            };

        });

        res.json({ bundles });

    } catch (error) {

        console.error("Bundle fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch bundles" });

    }

});

/* =========================
   INITIALIZE PAYMENT
========================= */

app.post("/initialize-payment", async (req, res) => {

    try {

        const { email, phone, network, plan, amount } = req.body;

        const reference = "VTU_" + Date.now();

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email,
                amount: Math.round(amount * 100), // convert to pesewas
                reference: reference,
                metadata: {
                    phone,
                    network,
                    plan
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error("Payment initialization error:", error.message);
        res.status(500).json({ error: "Payment initialization failed" });

    }

});

/* =========================
   VERIFY PAYMENT
========================= */

app.get("/verify-payment/:reference", async (req, res) => {

    try {

        const reference = req.params.reference;

        const verify = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const payment = verify.data.data;

        if (payment.status !== "success") {
            return res.json({ status: "payment_failed" });
        }

        const metadata = payment.metadata;

        const phone = metadata.phone;
        const network = metadata.network;
        const plan = metadata.plan;

        /* =========================
           BUY DATA FROM REMADATA
        ========================= */

        const buyData = await axios.post(
            "https://remadata.com/api/buy-data",
            {
                phone: phone,
                volumeInMB: parseInt(plan),
                networkType: network
            },
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        console.log("DATA PURCHASED:", buyData.data);

        res.json({
            payment: "successful",
            data_purchase: buyData.data
        });

    } catch (error) {

        console.error("Verification error:", error.message);
        res.status(500).json({ error: "Verification failed" });

    }

});

/* =========================
   WALLET BALANCE
========================= */

app.get("/wallet-balance", async (req, res) => {

    try {

        const response = await axios.get(
            "https://remadata.com/api/wallet-balance",
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error("Wallet error:", error.message);
        res.status(500).json({ error: "Wallet fetch failed" });

    }

});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});