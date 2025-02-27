// Importa la configuración de variables de entorno y el servicio de manejo de mensajes
import config from '../config/env.js';
import messageHandler from '../services/messageHandler.js';

class WebhookController {
    // Maneja los mensajes entrantes desde WhatsApp
    async handleIncoming(req, res) {
        // Extrae el mensaje y la información del remitente desde la estructura del webhook
        const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
        const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

        // Si hay un mensaje, lo envía al manejador de mensajes
        if (message) {
            await messageHandler.handleIncomingMessage(message, senderInfo);
        }
        res.sendStatus(200);  // Responde con éxito para confirmar la recepción del mensaje
    }

    // Verifica el webhook para la suscripción inicial de Facebook
    verifyWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        
        // Verifica que el modo sea "subscribe" y que el token sea el correcto
        if (mode === 'subscribe' && token === config.WEBHOOK_VERIFY_TOKEN) {
            res.status(200).send(challenge); // Responde con el desafío de verificación
            console.log('Webhook verified successfully!');
        } else {
            res.sendStatus(403); // Responde con error si la verificación falla
        }
    }
}

export default new WebhookController();
