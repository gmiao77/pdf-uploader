document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressElement = document.getElementById('progress');

    // 强力阻止浏览器默认拖放行为（防止 405 错误）
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight);
    });

    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) handleFiles(this.files);
    });

    copyBtn.addEventListener('click', copyLink);

    async function handleFiles(files) {
        const file = files[0];
        progressElement.style.display = 'block';
    
        try {
            const formData = new FormData();
            formData.append('file', file);
    
            const uploadResponse = await fetch('https://file.io/?expires=1d', {
                method: 'POST',
                body: formData
            });
    
            const result = await uploadResponse.json();
    
            if (!result.success) {
                throw new Error(result.message || '上传失败');
            }
    
            const fileUrl = result.link;
            showResult(fileUrl);
    
        } catch (error) {
            console.error('完整错误:', error);
            alert(`上传失败: ${error.message}`);
        } finally {
            progressElement.style.display = 'none';
        }
    }


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
        e.preventDefault();
        e.stopPropagation();
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
