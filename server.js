
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


//Latest code below1
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

/* =========================
   PROFIT CONFIG
========================= */

const MARKUP_PERCENT = 20;

function addProfit(price) {
    return Number((price + (price * MARKUP_PERCENT / 100)).toFixed(2));
}

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
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
   GET DATA BUNDLES
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
                name: bundle.name,
                network: bundle.network,
                volumeInMB: Number(bundle.volumeInMB || bundle.volume),
                cost_price: costPrice,
                price: sellingPrice
            };

        });

        res.json({ bundles });

    } catch (error) {

        console.error("Bundle error:", error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to fetch bundles"
        });

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

        res.status(500).json({
            error: "Failed to fetch wallet balance"
        });

    }

});

/* =========================
   INITIALIZE PAYMENT
========================= */

app.post("/initialize-payment", async (req, res) => {

    try {

        const {
            email,
            amount,
            payer_phone,
            beneficiary_phone,
            volumeInMB,
            network
        } = req.body;

        const reference = `VTU_${Date.now()}`;

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email,
                amount: Math.round(amount * 100),
                reference: reference,
                callback_url: "https://remadata-retaile1-app.onrender.com",
                metadata: {
                    payer_phone,
                    beneficiary_phone,
                    volumeInMB,
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

        res.json(response.data);

    } catch (error) {

        console.error("Paystack init error:", error.response?.data || error.message);

        res.status(500).json({
            error: "Payment initialization failed"
        });

    }

});

/* =========================
   VERIFY PAYMENT + BUY DATA
========================= */

app.get("/verify-payment/:reference", async (req, res) => {

    try {

        const reference = req.params.reference;

        console.log("Verifying payment:", reference);

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
        const volumeInMB = Number(metadata.volumeInMB);
        const networkType = metadata.network.toLowerCase();

        console.log("Sending order to Remadata:", {
            beneficiaryPhone,
            volumeInMB,
            networkType
        });

        /* =========================
           BUY DATA FROM REMADATA
        ========================== */

        const buy = await axios.post(
            "https://remadata.com/api/buy-data",
            {
                ref: reference,
                phone: beneficiaryPhone,
                volumeInMB: volumeInMB,
                networkType: networkType
            },
            {
                headers: {
                    "X-API-KEY": process.env.REMADATA_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Remadata response:", buy.data);

        res.json({
            payment: "successful",
            sent_to: beneficiaryPhone,
            remadata: buy.data
        });

    } catch (error) {

        console.error("Verification error:", error.response?.data || error.message);

        res.status(500).json({
            error: "Verification failed",
            details: error.response?.data || error.message
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

