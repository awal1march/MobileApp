
// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// /* =========================
//    PROFIT CONFIG
// ========================= */

// const MARKUP_PERCENT = 30;

// function addProfit(price) {
//     return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
// }

// /* =========================
//    MIDDLEWARE
// ========================= */

// app.use(cors());
// app.use(express.json());

// app.use((req, res, next) => {
//     console.log("Incoming request:", req.method, req.url, req.body || {});
//     next();
// });

// /* =========================
//    SERVE FRONTEND
// ========================= */

// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// /* =========================
//    HEALTH CHECK
// ========================= */

// app.get("/health", (req, res) => {
//     res.json({ status: "VTU backend running ✅" });
// });

// /* =========================
//    GET DATA BUNDLES
// ========================= */

// app.get("/bundles", async (req, res) => {

//     try {

//         const network = req.query.network;

//         const response = await axios.get(
//             "https://remadata.com/api/bundles",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         let bundles = response.data.data || [];

//         if (network) {
//             bundles = bundles.filter(
//                 b => b.network &&
//                 b.network.toLowerCase() === network.toLowerCase()
//             );
//         }

//         bundles = bundles.map(bundle => {

//             const costPrice = Number(bundle.price);
//             const sellingPrice = addProfit(costPrice);

//             return {
//                 name: bundle.name,
//                 network: bundle.network,
//                 volumeInMB: bundle.volumeInMB || bundle.volume,
//                 cost_price: costPrice,
//                 price: sellingPrice
//             };

//         });

//         res.json({ bundles });

//     } catch (error) {

//         console.error("Bundle error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch bundles"
//         });

//     }

// });

// /* =========================
//    WALLET BALANCE
// ========================= */

// app.get("/wallet-balance", async (req, res) => {

//     try {

//         const response = await axios.get(
//             "https://remadata.com/api/wallet-balance",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {

//         console.error("Wallet error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch wallet balance"
//         });

//     }

// });

// /* =========================
//    INITIALIZE PAYMENT
// ========================= */

// app.post("/initialize-payment", async (req, res) => {

//     try {

//         const {
//             email,
//             amount,
//             payer_phone,
//             beneficiary_phone,
//             volumeInMB,
//             network
//         } = req.body;

//         const reference = `VTU_${Date.now()}`;

//         console.log("Initializing payment:", {
//             payer_phone,
//             beneficiary_phone,
//             volumeInMB,
//             network
//         });

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: Math.round(amount * 100),
//                 reference: reference,
//                 metadata: {
//                     payer_phone,
//                     beneficiary_phone,
//                     volumeInMB,
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

// /* =========================
//    VERIFY PAYMENT + BUY DATA
// ========================= */

// app.get("/verify-payment/:reference", async (req, res) => {

//     try {

//         const reference = req.params.reference;

//         console.log("Verifying payment:", reference);

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

//         const payerPhone = metadata.payer_phone;
//         const beneficiaryPhone = metadata.beneficiary_phone || payerPhone;
//         const volumeInMB = metadata.volumeInMB;
//         const network = metadata.network;

//         console.log("Sending order to Remadata:", {
//             beneficiaryPhone,
//             volumeInMB,
//             network
//         });

//         /* BUY DATA FROM REMADATA */

//         const buy = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: reference,
//                 phone: beneficiaryPhone,
//                 volumeInMB: parseInt(volumeInMB),
//                 networkType: network.toLowerCase()
//             },
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         console.log("Remadata response:", buy.data);

//         res.json({
//             payment: "successful",
//             sent_to: beneficiaryPhone,
//             remadata: buy.data
//         });

//     } catch (error) {

//         console.error("Verification error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Verification failed",
//             details: error.response?.data || error.message
//         });

//     }

// });

// /* =========================
//    START SERVER
// ========================= */

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${PORT}`);
// });


//Updted 1 Latest code below 
// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const path = require("path");

// const app = express();

// /* =========================
//    PROFIT CONFIG
// ========================= */

// const MARKUP_PERCENT = 20;

// function addProfit(price) {
//     return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
// }

// /* =========================
//    MIDDLEWARE
// ========================= */

// app.use(cors());
// app.use(express.json());

// app.use((req, res, next) => {
//     console.log("Incoming request:", req.method, req.url);
//     next();
// });

// /* =========================
//    SERVE FRONTEND
// ========================= */

// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// /* =========================
//    HEALTH CHECK
// ========================= */

// app.get("/health", (req, res) => {
//     res.json({ status: "VTU backend running ✅" });
// });

// /* =========================
//    GET DATA BUNDLES
// ========================= */

// app.get("/bundles", async (req, res) => {

//     try {

//         const network = req.query.network;

//         const response = await axios.get(
//             "https://remadata.com/api/bundles",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         let bundles = response.data.data || [];

//         if (network) {
//             bundles = bundles.filter(
//                 b => b.network &&
//                 b.network.toLowerCase() === network.toLowerCase()
//             );
//         }

//         bundles = bundles.map(bundle => {

//             const costPrice = Number(bundle.price);
//             const sellingPrice = addProfit(costPrice);

//             return {
//                 name: bundle.name,
//                 network: bundle.network,
//                 volumeInMB: Number(bundle.volumeInMB || bundle.volume),
//                 cost_price: costPrice,
//                 price: sellingPrice
//             };

//         });

//         res.json({ bundles });

//     } catch (error) {

//         console.error("Bundle error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch bundles"
//         });

//     }

// });

// /* =========================
//    WALLET BALANCE
// ========================= */

// app.get("/wallet-balance", async (req, res) => {

//     try {

//         const response = await axios.get(
//             "https://remadata.com/api/wallet-balance",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {

//         console.error("Wallet error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch wallet balance"
//         });

//     }

// });

// /* =========================
//    INITIALIZE PAYMENT
// ========================= */

// app.post("/initialize-payment", async (req, res) => {

//     try {

//         const {
//             email,
//             amount,
//             payer_phone,
//             beneficiary_phone,
//             volumeInMB,
//             network
//         } = req.body;

//         const reference = `VTU_${Date.now()}`;

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: Math.round(amount * 100),
//                 reference: reference,
//                 callback_url: "https://remadata-retaile1-app.onrender.com",
//                 metadata: {
//                     payer_phone,
//                     beneficiary_phone,
//                     volumeInMB,
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

// /* =========================
//    VERIFY PAYMENT + BUY DATA
// ========================= */

// app.get("/verify-payment/:reference", async (req, res) => {

//     try {

//         const reference = req.params.reference;

//         console.log("Verifying payment:", reference);

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

//         const payerPhone = metadata.payer_phone;
//         const beneficiaryPhone = metadata.beneficiary_phone || payerPhone;
//         const volumeInMB = Number(metadata.volumeInMB);
//         const networkType = metadata.network.toLowerCase();

//         console.log("Sending order to Remadata:", {
//             beneficiaryPhone,
//             volumeInMB,
//             networkType
//         });

//         /* =========================
//            BUY DATA FROM REMADATA
//         ========================== */

//         const buy = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: reference,
//                 phone: beneficiaryPhone,
//                 volumeInMB: volumeInMB,
//                 networkType: networkType
//             },
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         console.log("Remadata response:", buy.data);

//         res.json({
//             payment: "successful",
//             sent_to: beneficiaryPhone,
//             remadata: buy.data
//         });

//     } catch (error) {

//         console.error("Verification error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Verification failed",
//             details: error.response?.data || error.message
//         });

//     }

// });

// /* =========================
//    START SERVER
// ========================= */

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${PORT}`);
// });

//Update 2

// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const path = require("path");
// const crypto = require("crypto");

// const app = express();

// /* =========================
//    PROFIT CONFIG
// ========================= */

// const MARKUP_PERCENT = 20;

// function addProfit(price) {
//     return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
// }

// /* =========================
//    MEMORY STORE FOR PROCESSED PAYMENTS
// ========================= */

// const processedTransactions = new Set();

// /* =========================
//    MIDDLEWARE
// ========================= */

// app.use(cors());

// app.use(express.json({
//     verify: (req, res, buf) => {
//         req.rawBody = buf;
//     }
// }));

// app.use((req, res, next) => {
//     console.log("Incoming request:", req.method, req.url);
//     next();
// });

// /* =========================
//    SERVE FRONTEND
// ========================= */

// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// /* =========================
//    HEALTH CHECK
// ========================= */

// app.get("/health", (req, res) => {
//     res.json({ status: "VTU backend running ✅" });
// });

// /* =========================
//    GET DATA BUNDLES
// ========================= */

// app.get("/bundles", async (req, res) => {

//     try {

//         const network = req.query.network;

//         const response = await axios.get(
//             "https://remadata.com/api/bundles",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         let bundles = response.data.data || [];

//         if (network) {
//             bundles = bundles.filter(
//                 b => b.network &&
//                 b.network.toLowerCase() === network.toLowerCase()
//             );
//         }

//         bundles = bundles.map(bundle => {

//             const costPrice = Number(bundle.price);
//             const sellingPrice = addProfit(costPrice);

//             return {
//                 name: bundle.name,
//                 network: bundle.network,
//                 volumeInMB: Number(bundle.volumeInMB || bundle.volume),
//                 cost_price: costPrice,
//                 price: sellingPrice
//             };

//         });

//         res.json({ bundles });

//     } catch (error) {

//         console.error("Bundle error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch bundles"
//         });

//     }

// });

// /* =========================
//    WALLET BALANCE
// ========================= */

// app.get("/wallet-balance", async (req, res) => {

//     try {

//         const response = await axios.get(
//             "https://remadata.com/api/wallet-balance",
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         res.json(response.data);

//     } catch (error) {

//         console.error("Wallet error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Failed to fetch wallet balance"
//         });

//     }

// });

// /* =========================
//    INITIALIZE PAYMENT
// ========================= */

// app.post("/initialize-payment", async (req, res) => {

//     try {

//         const {
//             email,
//             amount,
//             payer_phone,
//             beneficiary_phone,
//             volumeInMB,
//             network
//         } = req.body;

//         if (!email || !amount || !volumeInMB || !network) {
//             return res.status(400).json({
//                 error: "Missing required fields"
//             });
//         }

//         const reference = `VTU_${Date.now()}`;

//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: email,
//                 amount: Math.round(amount * 100),
//                 reference: reference,
//                 callback_url: "https://remadata-retaile1-app.onrender.com",
//                 metadata: {
//                     payer_phone,
//                     beneficiary_phone,
//                     volumeInMB,
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

// /* =========================
//    PAYSTACK WEBHOOK
// ========================= */

// app.post("/paystack-webhook", async (req, res) => {

//     const hash = crypto
//         .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
//         .update(req.rawBody)
//         .digest("hex");

//     const signature = req.headers["x-paystack-signature"];

//     if (hash !== signature) {
//         console.log("Invalid Paystack signature");
//         return res.sendStatus(401);
//     }

//     const event = req.body;

//     if (event.event === "charge.success") {

//         const payment = event.data;

//         const reference = payment.reference;

//         if (processedTransactions.has(reference)) {
//             console.log("Duplicate webhook ignored:", reference);
//             return res.sendStatus(200);
//         }

//         const metadata = payment.metadata || {};

//         const payerPhone = metadata.payer_phone;
//         const beneficiaryPhone = metadata.beneficiary_phone || payerPhone;
//         const volumeInMB = Number(metadata.volumeInMB);
//         const networkType = metadata.network.toLowerCase();

//         console.log("Webhook payment confirmed:", reference);

//         processedTransactions.add(reference);

//         try {

//             const buy = await axios.post(
//                 "https://remadata.com/api/buy-data",
//                 {
//                     ref: reference,
//                     phone: beneficiaryPhone,
//                     volumeInMB: volumeInMB,
//                     networkType: networkType
//                 },
//                 {
//                     headers: {
//                         "X-API-KEY": process.env.REMADATA_API_KEY,
//                         "Content-Type": "application/json"
//                     }
//                 }
//             );

//             console.log("Remadata response:", buy.data);

//         } catch (error) {

//             console.error("Remadata error:", error.response?.data || error.message);

//         }

//     }

//     res.sendStatus(200);
// });

// /* =========================
//    VERIFY PAYMENT (BACKUP)
// ========================= */

// app.get("/verify-payment/:reference", async (req, res) => {

//     try {

//         const reference = req.params.reference;

//         if (processedTransactions.has(reference)) {
//             return res.json({
//                 message: "Transaction already processed"
//             });
//         }

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

//         const payerPhone = metadata.payer_phone;
//         const beneficiaryPhone = metadata.beneficiary_phone || payerPhone;
//         const volumeInMB = Number(metadata.volumeInMB);
//         const networkType = metadata.network.toLowerCase();

//         processedTransactions.add(reference);

//         const buy = await axios.post(
//             "https://remadata.com/api/buy-data",
//             {
//                 ref: reference,
//                 phone: beneficiaryPhone,
//                 volumeInMB: volumeInMB,
//                 networkType: networkType
//             },
//             {
//                 headers: {
//                     "X-API-KEY": process.env.REMADATA_API_KEY
//                 }
//             }
//         );

//         res.json({
//             payment: "successful",
//             sent_to: beneficiaryPhone,
//             remadata: buy.data
//         });

//     } catch (error) {

//         console.error("Verification error:", error.response?.data || error.message);

//         res.status(500).json({
//             error: "Verification failed"
//         });

//     }

// });

// /* =========================
//    START SERVER
// ========================= */

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${PORT}`);
// });


//Another newly updated code

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();

/* =========================
   PROFIT CONFIG
========================= */

const MARKUP_PERCENT = 20;

function addProfit(price) {
    return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
}

/* =========================
   MEMORY STORE
========================= */

const processedTransactions = new Set();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   GET BUNDLES
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

        const bundles = response.data.data.map(b => ({
            id: b.id,
            name: b.name,
            network: b.network,
            volumeInMB: Number(b.volumeInMB || b.volume),
            price: addProfit(Number(b.price))
        }));

        res.json({ bundles });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bundles" });
    }
});

/* =========================
   INITIALIZE PAYMENT (SECURE)
========================= */

app.post("/initialize-payment", async (req, res) => {
    try {
        const { email, bundle_id, payer_phone, beneficiary_phone } = req.body;

        console.log("Incoming payment request:", req.body);

        // ✅ Validate input
        if (!email || !bundle_id) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        // ✅ Check env variables
        if (!process.env.REMADATA_API_KEY || !process.env.PAYSTACK_SECRET_KEY) {
            return res.status(500).json({
                error: "Server config error (API keys missing)"
            });
        }

        // 🔥 Fetch bundles
        const response = await axios.get(
            "https://remadata.com/api/bundles",
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        const allBundles = response.data.data || [];

        // ✅ Ensure correct ID comparison
        const bundle = allBundles.find(
            b => String(b.id) === String(bundle_id)
        );

        if (!bundle) {
            console.log("Bundle not found:", bundle_id);
            return res.status(400).json({
                error: "Invalid bundle selected"
            });
        }

        const realPrice = addProfit(Number(bundle.price));

        if (isNaN(realPrice)) {
            return res.status(500).json({
                error: "Invalid bundle price"
            });
        }

        const reference = `VTU_${Date.now()}`;

        console.log("Initializing Paystack:", {
            email,
            amount: realPrice,
            reference
        });

        // 🔥 Paystack request
        const pay = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email,
                amount: Math.round(realPrice * 100), // pesewas
                reference: reference,
                callback_url: "https://remadata-retaile1-app.onrender.com",
                metadata: {
                    bundle_id,
                    payer_phone,
                    beneficiary_phone
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Paystack success:", pay.data);

        res.json(pay.data);

    } catch (error) {

        console.error("❌ Payment init FULL error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Payment initialization failed",
            details: error.response?.data || error.message
        });
    }
});
/* =========================
   PAYSTACK WEBHOOK (SECURE)
========================= */

app.post("/paystack-webhook", async (req, res) => {

    const hash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(req.rawBody)
        .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        return res.sendStatus(401);
    }

    const event = req.body;

    if (event.event === "charge.success") {

        const payment = event.data;
        const reference = payment.reference;

        if (processedTransactions.has(reference)) {
            return res.sendStatus(200);
        }

        const metadata = payment.metadata;

        // 🔥 Fetch bundle again (DO NOT TRUST CLIENT)
        const response = await axios.get(
            "https://remadata.com/api/bundles",
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY
                }
            }
        );

        const bundle = response.data.data.find(b => b.id == metadata.bundle_id);

        if (!bundle) return res.sendStatus(400);

        const expectedAmount = addProfit(Number(bundle.price));
        const paidAmount = payment.amount / 100;

        // 🔐 SECURITY CHECK
        if (paidAmount !== expectedAmount) {
            console.log("Fraud detected: amount mismatch");
            return res.sendStatus(400);
        }

        const volumeInMB = Number(bundle.volumeInMB || bundle.volume);
        const networkType = bundle.network.toLowerCase();
        const phone = metadata.beneficiary_phone || metadata.payer_phone;

        processedTransactions.add(reference);

        try {
            await axios.post(
                "https://remadata.com/api/buy-data",
                {
                    ref: reference,
                    phone,
                    volumeInMB,
                    networkType
                },
                {
                    headers: {
                        "X-API-KEY": process.env.REMADATA_API_KEY
                    }
                }
            );
        } catch (err) {
            console.error("Remadata error:", err.message);
        }
    }

    res.sendStatus(200);
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});