document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressElement = document.getElementById('progress');
    const progressPercent = document.getElementById('progressPercent');

    // ====================== 拖放功能 ======================
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('drag-over');
    }

    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }

    // ====================== 文件处理 ======================
    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) handleFiles(this.files);
    });

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFiles(files);
    }

    // ====================== 上传到FileBin ======================
async function handleFiles(files) {
    const file = files[0];
    progressElement.style.display = 'block';

    try {
        // 1. 生成随机文件名（避免特殊字符问题）
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') + '.pdf';
        
        // 2. 创建FormData（关键修改：使用特定字段名）
        const formData = new FormData();
        formData.append('file', file, cleanName); // 第三个参数指定上传后的文件名

        // 3. 直接上传到FileBin（无需先创建bin）
        const response = await fetch('https://filebin.net/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json', // 必须声明接受JSON响应
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP错误: ${response.status}`);
        }

        const result = await response.json();
        
        // 4. 生成最终链接（FileBin返回的格式已处理）
        const pdfUrl = `https://filebin.net/${result.binId}/${cleanName}`;

        // 显示结果
        resultArea.style.display = 'block';
        pdfLink.value = pdfUrl;
        pdfPreview.src = pdfUrl;
        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('完整错误:', error);
        alert(`上传失败: ${error.message}\n建议：1. 检查文件名 2. 换用Chrome浏览器`);
    } finally {
        progressElement.style.display = 'none';
    }
}

    // ====================== 复制链接 ======================
    copyBtn.addEventListener('click', function() {
        pdfLink.select();
        document.execCommand('copy');
        
        // 显示复制反馈
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});