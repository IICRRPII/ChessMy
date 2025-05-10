const { request, response } = require('express');
const axios = require('axios');
const Pago = require('../../models/pagos');
require('dotenv').config();

const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // url sandbox or live for your app
<<<<<<< HEAD
const HOST = 'http://localhost:8080/api/admin';
=======
const HOST = `${process.env.CHESSMY_BACK}/api/admin`;
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4

// -----------NOTA PARA EL FRONT------------------
// Para el front se necesita en el req.body monto e idUsuario
// de todos modos, me avisas cualquier pedo XD

// payment.controller.js
const PLANS = [ // ✅ Definición centralizada de planes
    { 
      name: "Básico", 
      price: 19, 
      features: ["5 estudiantes máx", "10 horas/mes"],
      currency: "USD" 
    },
    { 
      name: "Intermedio", 
      price: 39, 
      features: ["15 estudiantes máx", "30 horas/mes"],
      currency: "USD" 
    },
    { 
      name: "Premium", 
      price: 79, 
      features: ["Estudiantes ilimitados", "Horas ilimitadas"],
      currency: "USD" 
    }
];

// Función para enviar planes al frontend
const getPlans = (req, res) => {
    res.json(PLANS); 
};

const createOrder = async (req, res) => {
<<<<<<< HEAD
    console.log("Request body:", req.body);
=======
  //  console.log("Request body:", req.body);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    const { monto, idUsuario, plan } = req.body;
    try {
        const order = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: monto,
                    },
                },
            ],
            application_context: {
                brand_name: "chessmy.com",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                return_url: `${HOST}/capture-order`,
                cancel_url: `${HOST}/cancel-payment`,
            },
        };
        // Generate an access token
        const tokenResponse = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            new URLSearchParams({ grant_type: "client_credentials" }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );
        const accessToken = tokenResponse.data.access_token;
<<<<<<< HEAD
        console.log("Access Token:", accessToken);
=======
      //  console.log("Access Token:", accessToken);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        // Create order
        const orderResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            order,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
<<<<<<< HEAD
        console.log("Order Response:", orderResponse.data);
=======
      //  console.log("Order Response:", orderResponse.data);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        const { id, links } = orderResponse.data;
        // Find the approval link
        const approvalLink = links.find(link => link.rel === "approve").href;
        //Save payment Data
        await Pago.create({
            idOrden: id,
            monto,
            monedaTipo: "USD",
            estatus: 'CREATED',
            idUsuario,
            plan, // ✅ Guardar el plan en la BD
        });
<<<<<<< HEAD
        console.log("PAGO ON Create-order", Pago);
=======
       // console.log("PAGO ON Create-order", Pago);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        // Redirect the user to PayPal approval URL
        return res.status(200).json({ approvalUrl: approvalLink });
    } catch (error) {
        //TODO descomentar en caso de querer ver el error, ya que el error hace que se vean las credenciales
<<<<<<< HEAD
        console.error("Error creating order:", error);
=======
      //  console.error("Error creating order:", error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        //return res.status(500).json({ message: "Something went wrong", error });
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const captureOrder = async (req = request, res = response) => {
    const { token } = req.query;
    try {
        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
            {},
            {
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );
<<<<<<< HEAD
        console.log("Capture Response:", captureResponse.data);
=======
      //  console.log("Capture Response:", captureResponse.data);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        const { id, status, purchase_units } = captureResponse.data;
        // Update payment status in the database
        await Pago.update(
            {
                estatus: status,
            },
            {
                where: { idOrden: id },
            }
        );
<<<<<<< HEAD
        console.log("PAGO ON Capture-order", Pago);

        return res.redirect("http://localhost:5173/pago-exitoso");
=======
      //  console.log("PAGO ON Capture-order", Pago);

        return res.redirect(`${process.env.CHESSMY_FRONT}/pago-exitoso`);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    } catch (error) {
      //TODO descomentar en caso de querer ver el error, ya que el error hace que se vean las credenciales
        //console.error("Error capturing order:", error);
        //return res.status(500).json({ message: "Internal Server Error", error });
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const cancelPayment = async (req = request, res = response) => {
<<<<<<< HEAD
    return res.redirect("/");
};

module.exports = { createOrder, captureOrder, cancelPayment, getPlans };
=======
    //TODO verificar que sirva el redirect sino poner a que mande al CHESSMY_FRONT
    return res.redirect("/");
};

const showPagos = async (req = request, res = response) => {
    try{
        const pagos = await Pago.findAll();
        return res.status(200).json(pagos);

    } catch (error) {
        return res.status(500).json({ message: "Error al cargar los pagos" });
    }
};

module.exports = { createOrder, captureOrder, cancelPayment, getPlans, showPagos };
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
