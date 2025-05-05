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
        // 1. 创建Bin（必须先用POST创建容器）
        const binResponse = await fetch('https://filebin.net/api/v1/bins', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!binResponse.ok) throw new Error(`创建容器失败: ${binResponse.status}`);
        const { binId } = await binResponse.json();

        // 2. 上传文件（注意文件名要用encodeURIComponent处理）
        const formData = new FormData();
        formData.append('file', file, encodeURIComponent(file.name));

        const uploadResponse = await fetch(`https://filebin.net/api/v1/bins/${binId}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!uploadResponse.ok) throw new Error(`上传失败: ${uploadResponse.status}`);
        
        // 3. 生成最终链接（确保.pdf结尾）
        let pdfUrl = `https://filebin.net/${binId}/${encodeURIComponent(file.name)}`;
        if (!pdfUrl.toLowerCase().endsWith('.pdf')) {
            pdfUrl += '.pdf';
        }

        // 显示结果
        resultArea.style.display = 'block';
        pdfLink.value = pdfUrl;
        pdfPreview.src = pdfUrl;
        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('完整错误详情:', error);
        alert(`上传失败: ${error.message}\n请检查文件名是否合法`);
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