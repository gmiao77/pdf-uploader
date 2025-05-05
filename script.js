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
        
        // 验证文件类型
        if (!file.type.includes('pdf')) {
            alert('请上传PDF文件');
            return;
        }

        // 显示上传进度
        progressElement.style.display = 'block';
        progressPercent.textContent = '0';

        try {
            const formData = new FormData();
            formData.append('file', file);

            // 上传到FileBin
            const response = await fetch('https://filebin.net/api/v1/bins', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            
            // 生成PDF链接（确保以.pdf结尾）
            let pdfUrl = `https://filebin.net/${result.binId}/${encodeURIComponent(file.name)}`;
            if (!pdfUrl.toLowerCase().endsWith('.pdf')) {
                pdfUrl += '.pdf';
            }

            // 显示结果
            resultArea.style.display = 'block';
            pdfLink.value = pdfUrl;
            pdfPreview.src = pdfUrl;
            
            // 滚动到结果区域
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('上传失败:', error);
            alert(`上传失败: ${error.message}\n请检查控制台获取详细信息`);
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