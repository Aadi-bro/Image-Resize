let originalFile = null;
let originalImage = null;

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const controlsSection = document.getElementById('controlsSection');
const previewSection = document.getElementById('previewSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('formatSelect');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const maintainRatio = document.getElementById('maintainRatio');
const processBtn = document.getElementById('processBtn');
const originalImageEl = document.getElementById('originalImage');
const processedImageEl = document.getElementById('processedImage');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const processedSize = document.getElementById('processedSize');
const processedDimensions = document.getElementById('processedDimensions');
const compressionRatio = document.getElementById('compressionRatio');
const sizeReduction = document.getElementById('sizeReduction');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Event Listeners
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', handleDragOver);
uploadZone.addEventListener('dragleave', handleDragLeave);
uploadZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
qualitySlider.addEventListener('input', updateQualityValue);
widthInput.addEventListener('input', handleDimensionChange);
heightInput.addEventListener('input', handleDimensionChange);
processBtn.addEventListener('click', processImage);
downloadBtn.addEventListener('click', downloadImage);
resetBtn.addEventListener('click', resetApp);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    originalFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            displayOriginalImage();
            showControls();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayOriginalImage() {
    originalImageEl.src = originalImage.src;
    originalSize.textContent = formatFileSize(originalFile.size);
    originalDimensions.textContent = `${originalImage.width} × ${originalImage.height}`;
    
    // Set default dimensions
    widthInput.value = originalImage.width;
    heightInput.value = originalImage.height;
}

function showControls() {
    controlsSection.style.display = 'block';
}

function updateQualityValue() {
    qualityValue.textContent = qualitySlider.value;
}

function handleDimensionChange(e) {
    if (!maintainRatio.checked || !originalImage) return;
    
    const aspectRatio = originalImage.width / originalImage.height;
    
    if (e.target === widthInput) {
        const newWidth = parseInt(widthInput.value);
        if (newWidth) {
            heightInput.value = Math.round(newWidth / aspectRatio);
        }
    } else if (e.target === heightInput) {
        const newHeight = parseInt(heightInput.value);
        if (newHeight) {
            widthInput.value = Math.round(newHeight * aspectRatio);
        }
    }
}

function processImage() {
    if (!originalImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get dimensions
    const targetWidth = parseInt(widthInput.value) || originalImage.width;
    const targetHeight = parseInt(heightInput.value) || originalImage.height;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Draw resized image
    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);
    
    // Get quality and format
    const quality = parseInt(qualitySlider.value) / 100;
    const format = formatSelect.value;
    const mimeType = `image/${format}`;
    
    // Convert to blob
    canvas.toBlob(function(blob) {
        displayProcessedImage(blob, canvas);
    }, mimeType, quality);
}

function displayProcessedImage(blob, canvas) {
    const url = URL.createObjectURL(blob);
    processedImageEl.src = url;
    
    // Update stats
    processedSize.textContent = formatFileSize(blob.size);
    processedDimensions.textContent = `${canvas.width} × ${canvas.height}`;
    
    // Calculate compression stats
    const ratio = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
    const reduction = formatFileSize(originalFile.size - blob.size);
    
    compressionRatio.textContent = `${ratio}%`;
    sizeReduction.textContent = `${reduction} saved`;
    
    // Store processed blob for download
    downloadBtn.processedBlob = blob;
    downloadBtn.processedFormat = formatSelect.value;
    
    // Show preview section
    previewSection.style.display = 'block';
}

function downloadImage() {
    if (!downloadBtn.processedBlob) return;
    
    const url = URL.createObjectURL(downloadBtn.processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-image.${downloadBtn.processedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetApp() {
    originalFile = null;
    originalImage = null;
    
    // Reset form
    fileInput.value = '';
    qualitySlider.value = 85;
    qualityValue.textContent = '85';
    formatSelect.value = 'jpeg';
    widthInput.value = '';
    heightInput.value = '';
    maintainRatio.checked = true;
    
    // Hide sections
    controlsSection.style.display = 'none';
    previewSection.style.display = 'none';
    
    // Clear images
    originalImageEl.src = '';
    processedImageEl.src = '';
    
    // Clear stats
    originalSize.textContent = '';
    originalDimensions.textContent = '';
    processedSize.textContent = '';
    processedDimensions.textContent = '';
    compressionRatio.textContent = '-';
    sizeReduction.textContent = '-';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}