document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const pdfPreview = document.getElementById('pdfPreview');

    // 处理拖放事件
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

    // 处理文件放置
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

    // 处理文件上传
    function handleFiles(files) {
        const file = files[0];
        
        // 检查文件名是否以.pdf结尾，如果不是则添加
        let fileName = file.name;
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }
        
        // 创建对象URL
        const fileUrl = URL.createObjectURL(file);
        
        // 显示结果区域
        resultArea.style.display = 'block';
        
        // 设置PDF链接
        pdfLink.value = fileUrl;
        
        // 设置PDF预览
        pdfPreview.src = fileUrl;
        
        // 滚动到结果区域
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    // 复制链接按钮
    copyBtn.addEventListener('click', function() {
        pdfLink.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});