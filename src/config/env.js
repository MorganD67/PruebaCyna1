// Importa dotenv para manejar variables de entorno
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde un archivo .env

export default {
    WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN, // Token de verificación del webhook
    API_TOKEN: process.env.API_TOKEN, // Token de autenticación de la API
    BUSINESS_PHONE: process.env.BUSINESS_PHONE, // Número de teléfono empresarial de WhatsApp
    API_VERSION: process.env.API_VERSION, // Versión de la API de WhatsApp
    PORT: process.env.PORT || 3000, // Puerto del servidor, por defecto 3000
};
