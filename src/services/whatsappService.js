import axios from 'axios';
import config from '../config/env.js';

// Clase que maneja la comunicación con la API de WhatsApp Business.
class WhatsAppService {
    constructor() {
        // Define la URL base para enviar mensajes a la API de WhatsApp Business.
        this.apiUrl = `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`;
        // Configura los encabezados para las solicitudes, incluyendo el token de autenticación.
        this.headers = {
            Authorization: `Bearer ${config.API_TOKEN}`,
        };
    }

    // Envía una solicitud a la API de WhatsApp.
    async sendRequest(data) {
        try {
            await axios.post(this.apiUrl, data, { headers: this.headers });
        } catch (error) {
            console.error('WhatsApp API Error:', error.response?.data || error);
        }
    }

    // Envía un mensaje de texto a un usuario.
    async sendMessage(to, body) {
        return this.sendRequest({
            messaging_product: 'whatsapp',
            to,
            text: { body },
        });
    }

    // Marca un mensaje como leído.
    async markAsRead(messageId) {
        return this.sendRequest({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        });
    }

    // Envía un mensaje con botones interactivos al usuario.
    async sendInteractiveButtons(to, bodyText, buttons) {
        return this.sendRequest({
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: { text: bodyText },
                action: { buttons },
            },
        });
    }

    // Envía un mensaje con un archivo multimedia (imagen, audio, video o documento).
    // Define los tipos de archivos multimedia admitidos.
    async sendMediaMessage(to, type, mediaUrl, caption) {
        const mediaObject = {
            image: { link: mediaUrl, caption },
            audio: { link: mediaUrl },
            video: { link: mediaUrl, caption },
            document: { link: mediaUrl, caption, filename: 'synapsis.pdf' },
        };

        if (!mediaObject[type]) {
            throw new Error('Tipo de elemento no soportado');
        }

        return this.sendRequest({
            messaging_product: 'whatsapp',
            to,
            type,
            ...mediaObject[type],
        });
    }

    // Envía la ubicación de un lugar al usuario.
    // to - Número de WhatsApp del destinatario.
    // parametro latitude - Latitud de la ubicación.
    // parametro  longitude - Longitud de la ubicación.
    // parametro  name - Nombre del lugar.
    // parametro  address - Dirección del lugar.
    async sendLocationMessage(to, latitude, longitude, name, address) {
        return this.sendRequest({
            messaging_product: 'whatsapp',
            to,
            type: 'location',
            location: { latitude, longitude, name, address },
        });
    }
}

export default new WhatsAppService();
