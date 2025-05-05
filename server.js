// server.js
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();

// 中间件配置
app.use(fileUpload());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 上传路由
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.pdfFile) {
        return res.status(400).send('No files were uploaded.');
    }

    const pdfFile = req.files.pdfFile;
    const fileName = pdfFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase(); // 清理文件名
    
    pdfFile.mv(`./uploads/${fileName}`, (err) => {
        if (err) return res.status(500).send(err);
        
        const fileUrl = `${req.protocol}://${req.get('host')}/${fileName}`;
        res.send(`
            <h2>上传成功！</h2>
            <p>PDF链接：<a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
            <p><a href="/">返回上传页面</a></p>
        `);
    });
});

// PDF查看路由
app.get('/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>PDF查看器</title>
            <style>
                #pdf-viewer { width: 100%; height: 100vh; border: none; }
            </style>
        </head>
        <body>
            <iframe 
                id="pdf-viewer" 
                src="/web/viewer.html?file=/uploads/${encodeURIComponent(req.params.filename)}">
            </iframe>
        </body>
        </html>
    `);
});

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
