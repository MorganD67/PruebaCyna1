// import OpenAI from 'openai';
// import config from '../config/env.js';

// const client = new OpenAI({
//     apiKey: config.CHATGPT_API_KEY,
// });

// const openAiService = async (message) => {
//     try {
//         const response = await client.chat.completions.create({
//             messages: [{role: 'system', content: 'Comportarte como un mecánico experto, deberás resolver las preguntas de manera clara y sencilla. Responde en texto plano, como si fuera una conversación por WhatsApp. No saludes, no generes conversaciones adicionales, solo responde directamente a la pregunta del usuario.'}, {role: 'user', content: message}],
//             model: 'gpt-4o-mini'
//         });
//         return response.choices[0].message.content;
//     } catch(error){
//         console.error(error);
//     }
// }

// export default openAiService;