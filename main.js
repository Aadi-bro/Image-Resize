// Global variables
let currentMode = 'image';
let originalFile = null;
let originalImage = null;
let processedBlob = null;
let processedFormat = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
    setupEventListeners();
});

function setupEventListeners() {
    // Image upload
    const imageUploadZone = document.getElementById('imageUploadZone');
    const imageInput = document.getElementById('imageInput');
    
    imageUploadZone.addEventListener('click', () => imageInput.click());
    imageUploadZone.addEventListener('dragover', handleDragOver);
    imageUploadZone.addEventListener('dragleave', handleDragLeave);
    imageUploadZone.addEventListener('drop', (e) => handleDrop(e, 'image'));
    imageInput.addEventListener('change', (e) => handleFileSelect(e, 'image'));

    // PDF upload
    const pdfUploadZone = document.getElementById('pdfUploadZone');
    const pdfInput = document.getElementById('pdfInput');
    
    pdfUploadZone.addEventListener('click', () => pdfInput.click());
    pdfUploadZone.addEventListener('dragover', handleDragOver);
    pdfUploadZone.addEventListener('dragleave', handleDragLeave);
    pdfUploadZone.addEventListener('drop', (e) => handleDrop(e, 'pdf'));
    pdfInput.addEventListener('change', (e) => handleFileSelect(e, 'pdf'));

    // Controls
    document.getElementById('qualitySlider').addEventListener('input', updateQualityValue);
    document.getElementById('pdfQualitySlider').addEventListener('input', updatePdfQualityValue);
    document.getElementById('widthInput').addEventListener('input', handleDimensionChange);
    document.getElementById('heightInput').addEventListener('input', handleDimensionChange);
    document.getElementById('processImageBtn').addEventListener('click', processImage);
    document.getElementById('processPdfBtn').addEventListener('click', processPdf);
    document.getElementById('downloadImageBtn').addEventListener('click', downloadImage);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
}

// Mode switching
function showImageMode() {
    currentMode = 'image';
    document.getElementById('imageSection').classList.remove('hidden');
    document.getElementById('pdfSection').classList.add('hidden');
    document.getElementById('imageModeBtn').classList.add('active');
    document.getElementById('pdfModeBtn').classList.remove('active');
    resetToHome();
}

function showPdfMode() {
    currentMode = 'pdf';
    document.getElementById('imageSection').classList.add('hidden');
    document.getElementById('pdfSection').classList.remove('hidden');
    document.getElementById('imageModeBtn').classList.remove('active');
    document.getElementById('pdfModeBtn').classList.add('active');
    resetToHome();
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0], type);
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file, type);
    }
}

// File handling
function handleFile(file, type) {
    if (type === 'image') {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        handleImageFile(file);
    } else if (type === 'pdf') {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a PDF file');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert('File size exceeds 50MB limit');
            return;
        }
        handlePdfFile(file);
    }
}

function handleImageFile(file) {
    originalFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            // Set default dimensions
            document.getElementById('widthInput').value = originalImage.width;
            document.getElementById('heightInput').value = originalImage.height;
            
            // Show controls
            document.getElementById('imageControls').classList.remove('hidden');
            scrollToElement('imageControls');
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handlePdfFile(file) {
    originalFile = file;
    document.getElementById('originalPdfName').textContent = file.name;
    document.getElementById('compressedPdfName').textContent = `compressed-${file.name}`;
    
    // Show controls
    document.getElementById('pdfControls').classList.remove('hidden');
    scrollToElement('pdfControls');
}

// Quality sliders
function updateQualityValue() {
    const value = document.getElementById('qualitySlider').value;
    document.getElementById('qualityValue').textContent = value;
}

function updatePdfQualityValue() {
    const value = document.getElementById('pdfQualitySlider').value;
    document.getElementById('pdfQualityValue').textContent = value;
}

// Dimension handling
function handleDimensionChange(e) {
    const maintainRatio = document.getElementById('maintainRatio').checked;
    if (!maintainRatio || !originalImage) return;
    
    const aspectRatio = originalImage.width / originalImage.height;
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    
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

// Image processing
function processImage() {
    if (!originalImage) {
        alert('No image loaded');
        return;
    }
    
    showLoading('Processing your image...');
    
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Get settings
            const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
            const format = document.getElementById('formatSelect').value;
            const width = parseInt(document.getElementById('widthInput').value) || originalImage.width;
            const height = parseInt(document.getElementById('heightInput').value) || originalImage.height;
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw image
            ctx.drawImage(originalImage, 0, 0, width, height);
            
            // Convert to blob
            const mimeType = `image/${format}`;
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('Image processing failed');
                    hideLoading();
                    return;
                }
                
                processedBlob = blob;
                processedFormat = format;
                
                displayImagePreview(blob, width, height);
                hideLoading();
            }, mimeType, quality);
            
        } catch (error) {
            console.error('Image processing error:', error);
            alert('Image processing failed');
            hideLoading();
        }
    }, 100);
}

function displayImagePreview(blob, width, height) {
    // Show original image
    document.getElementById('originalImage').src = originalImage.src;
    document.getElementById('originalSize').textContent = formatFileSize(originalFile.size);
    document.getElementById('originalDimensions').textContent = `${originalImage.width} × ${originalImage.height}`;
    
    // Show processed image
    const url = URL.createObjectURL(blob);
    document.getElementById('processedImage').src = url;
    document.getElementById('processedSize').textContent = formatFileSize(blob.size);
    document.getElementById('processedDimensions').textContent = `${width} × ${height}`;
    
    // Calculate stats
    const compressionRatio = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
    const sizeReduction = formatFileSize(originalFile.size - blob.size);
    
    document.getElementById('compressionRatio').textContent = `${compressionRatio}%`;
    document.getElementById('sizeReduction').textContent = sizeReduction;
    
    // Show preview
    document.getElementById('imagePreview').classList.remove('hidden');
    scrollToElement('imagePreview');
}

// PDF processing
function processPdf() {
    if (!originalFile) {
        alert('No PDF loaded');
        return;
    }
    
    showLoading('Compressing your PDF...');
    
    const quality = parseInt(document.getElementById('pdfQualitySlider').value);
    
    compressPDF(originalFile, { quality })
        .then(compressedBytes => {
            processedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
            displayPdfPreview(processedBlob);
            hideLoading();
        })
        .catch(error => {
            console.error('PDF compression failed:', error);
            alert('PDF compression failed: ' + error.message);
            hideLoading();
        });
}

function displayPdfPreview(blob) {
    // Show original PDF info
    document.getElementById('originalPdfSize').textContent = formatFileSize(originalFile.size);
    
    // Show compressed PDF info
    document.getElementById('compressedPdfSize').textContent = formatFileSize(blob.size);
    
    // Calculate stats
    const compressionRatio = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
    const sizeReduction = formatFileSize(originalFile.size - blob.size);
    
    document.getElementById('pdfCompressionRatio').textContent = `${compressionRatio}%`;
    document.getElementById('pdfSizeReduction').textContent = sizeReduction;
    
    // Show preview
    document.getElementById('pdfPreview').classList.remove('hidden');
    scrollToElement('pdfPreview');
}

// Download functions
function downloadImage() {
    if (!processedBlob || !processedFormat) {
        alert('No processed image to download');
        return;
    }
    
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-image.${processedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadPdf() {
    if (!processedBlob) {
        alert('No compressed PDF to download');
        return;
    }
    
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${originalFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Loading overlay
function showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = text;
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

// Reset functions
function resetToHome() {
    // Hide all sections except upload
    document.getElementById('imageControls').classList.add('hidden');
    document.getElementById('pdfControls').classList.add('hidden');
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('pdfPreview').classList.add('hidden');
    
    // Reset form values
    document.getElementById('imageInput').value = '';
    document.getElementById('pdfInput').value = '';
    document.getElementById('qualitySlider').value = 85;
    document.getElementById('pdfQualitySlider').value = 50;
    updateQualityValue();
    updatePdfQualityValue();
    
    // Reset variables
    originalFile = null;
    originalImage = null;
    processedBlob = null;
    processedFormat = null;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function scrollToElement(elementId) {
    setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}
