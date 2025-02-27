import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';

class MessageHandler {
    constructor() {
        this.appointmentState = {}; // Almacena el estado de las citas por número de teléfono
    }

    cleanPhoneNumber(number) {
        return number.startsWith('521') ? number.replace('521', '52') : number;
    }

    async handleIncomingMessage(message, senderInfo) {
        const fromNumber = this.cleanPhoneNumber(message.from);

        if (message?.type === 'text') {
            const incomingMessage = message.text.body.trim();

            if (this.appointmentState[fromNumber]) {
                await this.handleAppointmentFlow(fromNumber, incomingMessage);
            } else if (this.isGreeting(incomingMessage.toLowerCase())) {
                await this.sendWelcomeMessage(fromNumber, senderInfo);
                await this.sendWelcomeMenu(fromNumber);
            } else if (['audio', 'image', 'video', 'document'].includes(incomingMessage.toLowerCase())) {
                await this.sendMedia(fromNumber, incomingMessage.toLowerCase());
            } else {
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(fromNumber, response);
            }

            await whatsappService.markAsRead(message.id);
        } else if (message?.type === 'interactive' && message?.interactive?.button_reply) {
            const option = message.interactive.button_reply.title.trim();
            await this.handleMenuOption(fromNumber, option);
            await whatsappService.markAsRead(message.id);
        }
    }

    isGreeting(message) {
        const greetings = ['hola', 'hello', 'hi', 'buenas tardes', 'buenas'];
        return greetings.includes(message);
    }

    getSenderName(senderInfo) {
        return senderInfo.profile?.name || senderInfo.wa_id || '';
    }

    async sendWelcomeMessage(to, senderInfo) {
        const name = this.getSenderName(senderInfo);
        const welcomeMessage = `Hola ${name}, bienvenido a Synapsis. ¿En qué puedo ayudarte hoy?`;
        await whatsappService.sendMessage(to, welcomeMessage);
    }

    async sendWelcomeMenu(to) {
        const menuMessage = 'Elige una opción';
        const buttons = [
            { type: 'reply', reply: { id: 'option_1', title: 'Agendar' } },
            { type: 'reply', reply: { id: 'option_2', title: 'Consultar' } },
            { type: 'reply', reply: { id: 'option_3', title: 'Ubicación' } }
        ];
        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }

    async handleMenuOption(to, option) {
        let response;
        switch (option) {
            case 'Agendar':
                this.appointmentState[to] = { step: 'name' };
                response = 'Por favor ingresa tu nombre:';
                break;
            case 'Consultar':
                response = 'Realizar tu consulta';
                break;
            case 'Ubicación':
                response = 'Esta es nuestra ubicación';
                await this.sendLocation(to);
                break;
            default:
                response = 'Lo siento, no entendí tu selección. Por favor, elige una opción válida.';
        }
        await whatsappService.sendMessage(to, response);
    }

    async sendMedia(to, type) {
        const mediaFiles = {
            'audio': {
                url: 'https://archivos-syna-ss.s3.us-east-2.amazonaws.com/audio.aac',
                caption: 'Aquí tienes tu audio.'
            },
            'image': {
                url: 'https://mis-audios-duantian.s3.us-east-2.amazonaws.com/motivaci%C3%B3n.png',
                caption: 'Aquí tienes tu imagen.'
            },
            'video': {
                url: 'https://mis-audios-duantian.s3.us-east-2.amazonaws.com/WhatsApp+Video+2025-02-21+at+2.01.03+AM.mp4',
                caption: 'Aquí tienes tu video.'
            },
            'document': {
                url: 'https://mis-audios-duantian.s3.us-east-2.amazonaws.com/documentaci%C3%B3n.pdf',
                caption: 'Aquí tienes tu documento.',
                filename: 'synapsis.pdf'
            }
        };

        if (!mediaFiles[type]) {
            await whatsappService.sendMessage(to, 'Lo siento, ese tipo de archivo no está disponible.');
            return;
        }

        await this.sendMediaMessage(to, type, mediaFiles[type].url, mediaFiles[type].caption);
    }

    async sendMediaMessage(to, type, mediaUrl, caption = '') {
        if (!mediaUrl) {
            throw new Error('La URL del archivo multimedia es obligatoria.');
        }

        const mediaObject = {
            image: { type: 'image', image: { link: mediaUrl, caption } },
            audio: { type: 'audio', audio: { link: mediaUrl } },
            video: { type: 'video', video: { link: mediaUrl, caption } },
            document: { type: 'document', document: { link: mediaUrl, caption, filename: 'synapsis.pdf' } },
        };

        if (!mediaObject[type]) {
            throw new Error(`Tipo de medio no soportado: ${type}`);
        }

        return whatsappService.sendRequest({
            messaging_product: 'whatsapp',
            to,
            ...mediaObject[type],
        });
    }

    completeAppointment(to) {
        const appointment = this.appointmentState[to];
        delete this.appointmentState[to];

        const userData = [
            to,
            appointment.name,
            appointment.synaName,
            appointment.synaType,
            appointment.reason,
            new Date().toISOString()
        ];

        console.log("Guardando en Google Sheets:", userData);
        appendToSheet(userData);

        return `Gracias por agendar tu cita.
        Resumen de tu cita:
        
        Nombre: ${appointment.name}
        Horario estimado: ${appointment.synaName}
        Tipo de servicio: ${appointment.synaType}
        Motivo: ${appointment.reason}
        
        Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita.` 
    }

    async handleAppointmentFlow(to, message) {
        const state = this.appointmentState[to];
        let response;

        switch (state.step) {
            case 'name':
                state.name = message;
                state.step = 'synaName';
                response = 'Gracias, este servicio es de 5 de la mañana a 9 de la noche, ¿Qué horario estima para la consulta?';
                break;
            case 'synaName':
                state.synaName = message;
                state.step = 'synaType';
                response = '¿Qué tipo de servicio requiere?';
                break;
            case 'synaType':
                state.synaType = message;
                state.step = 'reason';
                response = '¿Cuál es el motivo de la consulta?';
                break;
            case 'reason':
                state.reason = message;
                response = this.completeAppointment(to);
                delete this.appointmentState[to]; 
                break;
        }
        await whatsappService.sendMessage(to, response);
    }

    async sendLocation(to) {
        const latitude = 19.820138;
        const longitude = -99.050297;
        const name = 'Synapsis México';
        const address = 'Cerca de Manzana 010, 55637 Conjunto Urbano Jardin del Pino, Edo Mex.';

        await whatsappService.sendLocationMessage(to, latitude, longitude, name, address);
    }
}

export default new MessageHandler();
