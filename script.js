document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressElement = document.getElementById('progress');
    const progressPercent = document.getElementById('progressPercent');

    // ================= 拖放事件处理 =================
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

    // ================= 文件处理 =================
    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) handleFiles(this.files);
    });

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFiles(files);
    }

    // ================= 核心上传逻辑 =================
    async function handleFiles(files) {
        const file = files[0];
        progressElement.style.display = 'block';

        try {
            // 1. 验证文件类型
            if (!file.type.includes('pdf')) {
                throw new Error('仅支持PDF文件');
            }

            // 2. 生成容器ID和文件名
            const binId = generateBinId();
            const processedName = processFileName(file.name);
            
            // 3. 准备上传参数
            const formData = new FormData();
            formData.append('file', file, processedName);

            // 4. 执行上传
            const response = await fetch(`https://filebin.net/${binId}/${processedName}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-FileBin-Token': 'anonymous'
                }
            });

            // 5. 处理响应
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `上传失败 (${response.status})`);
            }

            // 6. 生成最终链接
            const pdfUrl = `https://filebin.net/${binId}/${processedName}`;
            
            // 7. 显示结果
            resultArea.style.display = 'block';
            pdfLink.value = pdfUrl;
            pdfPreview.src = pdfUrl;
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('错误详情:', error);
            alert(`上传失败: ${error.message}`);
        } finally {
            progressElement.style.display = 'none';
        }
    }

    // ================= 工具函数 =================
    function generateBinId() {
        // 生成符合规范的容器ID: bin-xxxxxx
        const randomStr = Math.random().toString(36).substr(2, 6);
        return `bin-${randomStr}`;
    }

    function processFileName(originalName) {
        // 移除特殊字符并添加PDF扩展名
        const cleaned = originalName
            .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5.-]/g, '') // 允许中文
            .replace(/\s+/g, '_')
            .substring(0, 50); // 限制长度
        
        return cleaned.toLowerCase().endsWith('.pdf') 
            ? cleaned 
            : `${cleaned}.pdf`;
    }

    // ================= 复制功能 =================
    copyBtn.addEventListener('click', function() {
        pdfLink.select();
        document.execCommand('copy');
        showFeedback(copyBtn);
    });

    function showFeedback(element) {
        const originalText = element.textContent;
        element.textContent = '✅ 已复制!';
        setTimeout(() => {
            element.textContent = originalText;
        }, 2000);
    }
});