document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressElement = document.getElementById('progress');
    const progressPercent = document.getElementById('progressPercent');

    // 拖放功能（保持不变）
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

    // 处理文件拖放
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFiles(files);
        }
    }

    // 处理文件选择
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0 && this.files[0].type === 'application/pdf') {
            handleFiles(this.files);
        }
    });

    // 上传到 File.io
async function handleFiles(files) {
    const file = files[0];
    progressElement.style.display = 'block';

    try {
        const formData = new FormData();
        formData.append('file', file);

        // 使用 Anonfiles API（支持 CORS）
        const response = await fetch('https://api.anonfiles.com/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        
        if (!result.status) {
            throw new Error(result.error?.message || '上传失败');
        }

        // 显示结果
        resultArea.style.display = 'block';
        pdfLink.value = result.data.file.url.full; // 完整链接
        pdfPreview.src = result.data.file.url.full;
        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert('上传失败: ' + error.message);
    } finally {
        progressElement.style.display = 'none';
    }
}

    // 复制链接按钮
    copyBtn.addEventListener('click', function() {
        pdfLink.select();
        document.execCommand('copy');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});