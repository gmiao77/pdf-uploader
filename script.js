// 强力阻止所有拖放的默认行为
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressElement = document.getElementById('progress');

    // ====================== 事件监听器 ======================
    // 拖放区域事件
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight);
    });

    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    // 文件选择事件
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) handleFiles(this.files);
    });

    // 复制按钮事件
    copyBtn.addEventListener('click', copyLink);

    // ====================== 核心函数 ======================
    async function handleFiles(files) {
        const file = files[0];
        progressElement.style.display = 'block';
    
        try {
            // 创建存储桶（不带 body，避免 400 错误）
            const binResponse = await fetch('https://filebin.net/api/v1/bins', {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });
    
            if (!binResponse.ok) throw new Error(`创建容器失败: ${binResponse.status}`);
            const { id: binId } = await binResponse.json();
    
            // 准备上传文件
            const formData = new FormData();
            formData.append('file', file, file.name);
    
            const uploadResponse = await fetch(`https://filebin.net/api/v1/bins/${binId}`, {
                method: 'POST',
                body: formData
            });
    
            if (!uploadResponse.ok) {
                const errorDetail = await uploadResponse.text();
                throw new Error(`上传失败: ${uploadResponse.status} - ${errorDetail}`);
            }
    
            // 生成访问链接
            const pdfUrl = `https://filebin.net/${binId}/${file.name}`;
            showResult(pdfUrl);
    
        } catch (error) {
            console.error('完整错误:', error);
            alert(`上传失败: ${error.message}`);
        } finally {
            progressElement.style.display = 'none';
        }
    }


    // ====================== 辅助函数 ======================
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('drag-over');
    }

    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFiles(files);
    }

    function showResult(url) {
        resultArea.style.display = 'block';
        pdfLink.value = url;
        pdfPreview.src = url;
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    function copyLink() {
        pdfLink.select();
        document.execCommand('copy');
        showCopyFeedback();
    }

    function showCopyFeedback() {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
});
