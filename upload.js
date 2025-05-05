const express = require('express');
const axios = require('axios');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(express.static('public'));

app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const token = process.env.GITHUB_TOKEN;
        const repoOwner = process.env.GITHUB_USER || 'yourusername';
        const repoName = process.env.GITHUB_REPO || 'pdf-hosting';
        
        let fileName = req.file.originalname;
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }
        
        const content = req.file.buffer.toString('base64');
        
        const response = await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`,
            {
                message: `Upload ${fileName}`,
                content: content,
            },
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        
        res.json({
            url: `https://${repoOwner}.github.io/${repoName}/${fileName}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));