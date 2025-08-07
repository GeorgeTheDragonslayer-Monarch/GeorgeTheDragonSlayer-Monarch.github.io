const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
});

// Upload comic to Drive and save to DB
router.post('/comics', async (req, res) => {
    try {
        const { title, author, pages } = req.body; // pages = array of base64 images
        
        // 1. Upload cover image
        const coverUrl = await uploadToDrive(
            pages[0], 
            `${title}-cover.jpg`
        );
        
        // 2. Upload pages
        const pageUrls = [];
        for (let i = 0; i < pages.length; i++) {
            const url = await uploadToDrive(
                pages[i],
                `${title}-page-${i+1}.jpg`
            );
            pageUrls.push(url);
        }
        
        // 3. Save to MongoDB
        const comic = new Comic({
            title,
            author,
            coverImageUrl: coverUrl,
            pageUrls,
            publishedAt: new Date()
        });
        
        await comic.save();
        
        res.status(201).json(comic);
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ error: 'Failed to publish comic' });
    }
});

// Upload helper function
async function uploadToDrive(base64Data, fileName) {
    const drive = google.drive({ version: 'v3', auth });
    const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    
    const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };
    
    const media = {
        mimeType: 'image/jpeg',
        body: buffer
    };
    
    const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });
    
    // Make public
    await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone'
        }
    });
    
    return `https://drive.google.com/uc?export=view&id=${file.data.id}`;
}