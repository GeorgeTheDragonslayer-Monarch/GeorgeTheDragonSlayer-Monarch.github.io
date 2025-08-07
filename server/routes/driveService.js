const { google } = require('googleapis');
const path = require('path');
const stream = require('stream');

const KEYFILE = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/drive']
});

async function uploadBuffer(buffer, fileName, mimeType) {
    const drive = google.drive({ version: 'v3', auth });
    
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const fileMetadata = {
        name: fileName,
        parents: [FOLDER_ID]
    };

    const media = {
        mimeType,
        body: bufferStream
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
    });

    // Make file publicly accessible
    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone'
        }
    });

    return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
}

module.exports = { uploadBuffer };