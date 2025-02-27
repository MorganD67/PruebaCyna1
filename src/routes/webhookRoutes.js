// Importa Express y el controlador del webhook
import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Define la ruta POST para recibir mensajes del webhook de WhatsApp
router.post('/webhook', webhookController.handleIncoming);
// Define la ruta GET para la verificación del webhook
router.get('/webhook', webhookController.verifyWebhook);

export default router;
