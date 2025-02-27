import path from 'path';
import { google } from 'googleapis';

// Inicializa el servicio de Google Sheets
const sheets = google.sheets('v4');

//Agrega una nueva fila a la hoja de cálculo especificada.
//parametro auth - Cliente autenticado de Google
//parametro spreadsheetId - ID del documento de Google Sheets
//parametro values - Datos a insertar en la hoja
//returns - Respuesta de la API de Google Sheets 
async function addRowToSheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }
    
    try {
        const response = (await sheets.spreadsheets.values.append(request).data)
        return response;
    } catch (error) {
        console.error(error)
    }
}

//Función principal que autentica y agrega datos a Google Sheets.
//parametro - Datos a guardar en la hoja de cálculo
//retorno - Mensaje de confirmación
const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadsheetId = '1tI6ugrMeflDDykjHcBL8IH9OopFihuxxHRR0dDN_yJ0'

        await addRowToSheet(authClient, spreadsheetId, data);
        return 'Datos Guardados'

    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;