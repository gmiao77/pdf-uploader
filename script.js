document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const resultArea = document.getElementById('resultArea');
    const pdfLink = document.getElementById('pdfLink');
    const copyBtn = document.getElementById('copyBtn');
    const viewBtn = document.getElementById('viewBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const progressContainer = document.getElementById('progress');
    const progressBar = document.getElementById('uploadProgress');
    const progressPercent = document.getElementById('progressPercent');
    const errorArea = document.getElementById('errorArea');
    const errorMessage = document.getElementById('errorMessage');

    // 配置信息 - 在实际部署时应从环境变量获取或通过配置界面设置
    const config = {
        githubToken: '', // 从环境变量获取更安全
        repoOwner: 'YOUR_GITHUB_USERNAME',
        repoName: 'YOUR_REPO_NAME',
        apiBaseUrl: 'https://api.github.com',
        pagesBaseUrl: 'https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME'
    };

    // 初始化拖放功能
    initDragAndDrop();

    // 文件选择处理
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileUpload(this.files[0]);
        }
    });

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

    function initDragAndDrop() {
        // 阻止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // 高亮拖放区域
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        // 处理文件放置
        dropZone.addEventListener('drop', handleDrop, false);
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
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }

    async function handleFileUpload(file) {
        // 验证文件类型
        if (file.type !== 'application/pdf') {
            showError('请上传PDF文件');
            return;
        }

        // 准备文件名
        let fileName = file.name;
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf';
        }

        // 显示上传进度
        showProgress();

        try {
            // 上传文件到GitHub
            const pdfUrl = await uploadToGitHub(file, fileName, (progress) => {
                updateProgress(progress);
            });

            // 显示结果
            showResult(pdfUrl);
        } catch (error) {
            showError('上传失败: ' + error.message);
            console.error('上传错误:', error);
        } finally {
            hideProgress();
        }
    }

    function showProgress() {
        progressContainer.style.display = 'block';
        progressBar.value = 0;
        progressPercent.textContent = '0';
        resultArea.style.display = 'none';
        errorArea.style.display = 'none';
    }

    function updateProgress(percent) {
        const roundedPercent = Math.round(percent * 100);
        progressBar.value = roundedPercent;
        progressPercent.textContent = roundedPercent;
    }

    function hideProgress() {
        progressContainer.style.display = 'none';
    }

    function showResult(pdfUrl) {
        pdfLink.value = pdfUrl;
        viewBtn.href = pdfUrl;
        pdfPreview.src = pdfUrl;
        
        resultArea.style.display = 'block';
        viewBtn.style.display = 'inline-block';
        errorArea.style.display = 'none';
        
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorArea.style.display = 'block';
        resultArea.style.display = 'none';
    }

    async function uploadToGitHub(file, fileName, progressCallback) {
        if (!config.githubToken) {
            throw new Error('GitHub token未配置');
        }

        // 读取文件内容
        const fileContent = await readFileAsBase64(file);
        
        // 创建API请求
        const endpoint = `${config.apiBaseUrl}/repos/${config.repoOwner}/${config.repoName}/contents/${encodeURIComponent(fileName)}`;
        
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${fileName}`,
                content: fileContent,
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '上传失败');
        }
        
        return `${config.pagesBaseUrl}/${encodeURIComponent(fileName)}`;
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            reader.readAsDataURL(file);
        });
    }
});