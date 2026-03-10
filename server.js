

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

// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// // ----------------------------
// // PROFIT CONFIG
// // ----------------------------
// const MARKUP_PERCENT = 30; // Change this if you want higher/lower profit

// function addProfit(price) {
//     return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
// }

// // ----------------------------
// // MIDDLEWARE
// // ----------------------------
// app.use(cors());
// app.use(express.json());

// // Log all incoming requests safely
// app.use((req, res, next) => {
//     console.log("Incoming request:", req.method, req.url, req.body || {});
//     next();
// });

// // Serve frontend
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // ----------------------------
// // HEALTH CHECK
// // ----------------------------
// app.get("/health", (req, res) => {
//     res.json({ status: "VTU backend running ✅" });
// });

// // ----------------------------
// // GET DATA BUNDLES (WITH PROFIT)
// // ----------------------------
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

//         // Add profit markup
//         bundles = bundles.map(bundle => {

//             const costPrice = Number(bundle.price);
//             const sellingPrice = addProfit(costPrice);

//             return {
//                 ...bundle,
//                 cost_price: costPrice,
//                 price: sellingPrice
//             };

//         });

//         res.json({ bundles });

//     } catch (error) {
//         console.error("Bundle error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Failed to fetch bundles" });
//     }
// });

// // ----------------------------
// // WALLET BALANCE
// // ----------------------------
// app.get("/wallet-balance", async (req, res) => {
//     try {
//         const response = await axios.get("https://remadata.com/api/wallet-balance", {
//             headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
//         });
//         res.json(response.data);
//     } catch (error) {
//         console.error("Wallet error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Failed to fetch wallet balance" });
//     }
// });

// // ----------------------------
// // INITIALIZE PAYSTACK PAYMENT
// // ----------------------------
// app.post("/initialize-payment", async (req, res) => {
//     try {

//         const { email, amount, phone, plan, network } = req.body;

//         const reference = `VTU_${Date.now()}`;

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: amount,
//                 reference: reference,
//                 metadata: { phone, plan, network }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {
//         console.error("Paystack init error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Payment initialization failed" });
//     }
// });

// // ----------------------------
// // VERIFY PAYMENT + BUY DATA
// // ----------------------------
// app.get("/verify-payment/:reference", async (req, res) => {
//     try {

//         const reference = req.params.reference;

//         const verify = await axios.get(
//             `https://api.paystack.co/transaction/verify/${reference}`,
//             {
//                 headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
//             }
//         );

//         const payment = verify.data.data;

//         if (payment.status !== "success") {
//             return res.json({ payment: "failed", message: "Payment not successful" });
//         }

//         const metadata = payment.metadata || {};
//         const phone = metadata.phone;
//         const plan = metadata.plan;
//         const network = metadata.network;

//         // Buy data from Remadata
//         const buy = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: reference,
//                 phone: phone,
//                 volumeInMB: parseInt(plan),
//                 networkType: network.toLowerCase()
//             },
//             {
//                 headers: { "X-API-KEY": process.env.REMADATA_API_KEY }
//             }
//         );

//         res.json({ payment: "successful", data_purchase: buy.data });

//     } catch (error) {
//         console.error("Verification error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Verification failed" });
//     }
// });

// // ----------------------------
// // START SERVER
// // ----------------------------
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

/* =========================
   PROFIT CONFIG
========================= */

const MARKUP_PERCENT = 30;

function addProfit(price) {
    return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
}

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url, req.body || {});
    next();
});

/* =========================
   SERVE FRONTEND
========================= */

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
    res.json({ status: "VTU backend running ✅" });
});

/* =========================
   GET DATA BUNDLES (WITH PROFIT)
========================= */

app.get("/bundles", async (req, res) => {

    try {

        const network = req.query.network;

        const response = await axios.get(
            "https://remadata.com/api/bundles",
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        let bundles = response.data.data || [];

        if (network) {
            bundles = bundles.filter(
                b => b.network &&
                b.network.toLowerCase() === network.toLowerCase()
            );
        }

        bundles = bundles.map(bundle => {

            const costPrice = Number(bundle.price);
            const sellingPrice = addProfit(costPrice);

            return {
                ...bundle,
                cost_price: costPrice,
                price: sellingPrice
            };

        });

        res.json({ bundles });

    } catch (error) {

        console.error("Bundle error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch bundles" });

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

        console.error("Wallet error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch wallet balance" });

    }

});

// app.post("/initialize-payment", async (req, res) => {

//     try {

//         const {
//             email,
//             amount,
//             payer_phone,
//             beneficiary_phone,
//             plan,
//             network
//         } = req.body;

//         const reference = `VTU_${Date.now()}`;

//         console.log("Initializing payment:", {
//             payer_phone,
//             beneficiary_phone,
//             plan,
//             network
//         });

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: amount,
//                 reference: reference,
//                 metadata: {
//                     payer_phone,
//                     beneficiary_phone,
//                     plan,
//                     network
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {

//         console.error("Paystack init error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Payment initialization failed"
//         });

//     }

// });
//BELLOW MoMo prompt
/* =========================
   INITIALIZE PAYMENT WITH MoMo PROMPT
========================= */

app.post("/initialize-payment", async (req, res) => {
    try {

        const { email, amount, payer_phone, beneficiary_phone, plan, network } = req.body;

        /* ===== VALIDATIONS ===== */

        if (!email || !amount || !payer_phone) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        // Clean phone number
        const cleanPhone = payer_phone.replace(/\D/g, "");

        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                error: "Invalid phone number format. Use 10-digit Ghana number."
            });
        }

        // Validate email
        if (!email.includes("@")) {
            return res.status(400).json({
                error: "Invalid email address"
            });
        }

        const reference = `VTU_${Date.now()}`;

        console.log("Charging MoMo:", {
            email,
            amount,
            cleanPhone
        });

        /* ===== PAYSTACK CHARGE ===== */

        const paystackResponse = await axios.post(
            "https://api.paystack.co/charge",
            {
                email: email,
                amount: Math.round(amount * 100), // convert to Kobo
                reference: reference,

                channels: ["mobile_money"],

                mobile_money: {
                    phone: cleanPhone,
                    country_code: "GH"
                },

                metadata: {
                    payer_phone: cleanPhone,
                    beneficiary_phone,
                    plan,
                    network
                }

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Paystack response:", paystackResponse.data);

        /* ===== SEND RESPONSE ===== */

        res.json({
            status: "success",
            message: "MoMo prompt sent to user's phone",
            reference: reference,
            paystack: paystackResponse.data
        });

    } catch (error) {

        console.error("PAYSTACK ERROR:");
        console.error(error.response?.data || error.message);

        res.status(500).json({
            error: "Payment initialization failed",
            details: error.response?.data || error.message
        });

    }
});
/* =========================
   INITIALIZE PAYMENT
========================= */

// app.post("/initialize-payment", async (req, res) => {

//     try {

//         const {
//             email,
//             amount,
//             payer_phone,
//             beneficiary_phone,
//             plan,
//             network
//         } = req.body;

//         const reference = `VTU_${Date.now()}`;

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: amount,
//                 reference: reference,
//                 metadata: {
//                     payer_phone,
//                     beneficiary_phone,
//                     plan,
//                     network
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {

//         console.error("Paystack init error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Payment initialization failed" });

//     }

// });

/* =========================
   VERIFY PAYMENT + BUY DATA
========================= */

// app.get("/verify-payment/:reference", async (req, res) => {

//     try {

//         const reference = req.params.reference;

//         const verify = await axios.get(
//             `https://api.paystack.co/transaction/verify/${reference}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
//                 }
//             }
//         );

//         const payment = verify.data.data;

//         if (payment.status !== "success") {
//             return res.json({
//                 payment: "failed",
//                 message: "Payment not successful"
//             });
//         }

//         const metadata = payment.metadata || {};

//         const beneficiaryPhone = metadata.beneficiary_phone;
//         const plan = metadata.plan;
//         const network = metadata.network;

//         /* =========================
//            BUY DATA FROM REMADATA
//         ========================= */

//         const buy = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: reference,
//                 phone: beneficiaryPhone,
//                 volumeInMB: parseInt(plan),
//                 networkType: network.toLowerCase()
//             },
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         console.log("DATA PURCHASE SUCCESS:", buy.data);

//         res.json({
//             payment: "successful",
//             data_purchase: buy.data
//         });

//     } catch (error) {

//         console.error("Verification error:", error.response?.data || error.message);
//         res.status(500).json({ error: "Verification failed" });

//     }

// });

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
            return res.json({
                payment: "failed",
                message: "Payment not successful"
            });
        }

        const metadata = payment.metadata || {};

        const payerPhone = metadata.payer_phone;
        const beneficiaryPhone = metadata.beneficiary_phone || payerPhone;
        const plan = metadata.plan;
        const network = metadata.network;

        console.log("Payment metadata:", metadata);
        console.log("Payer:", payerPhone);
        console.log("Beneficiary:", beneficiaryPhone);

        /* =========================
           BUY DATA FROM REMADATA
        ========================= */

        const buy = await axios.post(
            "https://remadata.com/api/buy-data",
            {
                ref: reference,
                phone: beneficiaryPhone,
                volumeInMB: parseInt(plan),
                networkType: network.toLowerCase()
            },
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        console.log("DATA PURCHASE SUCCESS:", buy.data);

        res.json({
            payment: "successful",
            sent_to: beneficiaryPhone,
            data_purchase: buy.data
        });

    } catch (error) {

        console.error("Verification error:", error.response?.data || error.message);

        res.status(500).json({
            error: "Verification failed"
        });

    }

});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});