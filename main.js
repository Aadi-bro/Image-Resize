let originalFile = null;
let originalImage = null;
let originalPdfFile = null;
let compressedPdfBytes = null;

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

// PDF DOM Elements
const pdfUploadSection = document.getElementById('pdfUploadSection');
const pdfUploadZone = document.getElementById('pdfUploadZone');
const pdfFileInput = document.getElementById('pdfFileInput');
const pdfControlsSection = document.getElementById('pdfControlsSection');
const pdfPreviewSection = document.getElementById('pdfPreviewSection');
const pdfQualitySlider = document.getElementById('pdfQualitySlider');
const pdfQualityValue = document.getElementById('pdfQualityValue');
const pdfOptimizeFonts = document.getElementById('pdfOptimizeFonts');
const pdfFlattenForms = document.getElementById('pdfFlattenForms');
const pdfProcessBtn = document.getElementById('pdfProcessBtn');
const pdfOriginalSize = document.getElementById('pdfOriginalSize');
const pdfOriginalPages = document.getElementById('pdfOriginalPages');
const pdfCompressedSize = document.getElementById('pdfCompressedSize');
const pdfReduction = document.getElementById('pdfReduction');
const pdfCompressionRatio = document.getElementById('pdfCompressionRatio');
const pdfSizeReduction = document.getElementById('pdfSizeReduction');
const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
const pdfResetBtn = document.getElementById('pdfResetBtn');
const pdfOriginalName = document.getElementById('pdfOriginalName');
const pdfCompressedName = document.getElementById('pdfCompressedName');

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

// PDF Event Listeners
pdfUploadZone.addEventListener('click', () => pdfFileInput.click());
pdfUploadZone.addEventListener('dragover', handlePdfDragOver);
pdfUploadZone.addEventListener('dragleave', handlePdfDragLeave);
pdfUploadZone.addEventListener('drop', handlePdfDrop);
pdfFileInput.addEventListener('change', handlePdfFileSelect);
pdfQualitySlider.addEventListener('input', updatePdfQualityValue);
pdfProcessBtn.addEventListener('click', processPdf);
pdfDownloadBtn.addEventListener('click', downloadPdf);
pdfResetBtn.addEventListener('click', resetPdfApp);

// Toggle between image and PDF modes
function showImageMode() {
    document.getElementById('uploadZone').parentElement.style.display = 'block';
    pdfUploadSection.style.display = 'none';
}

function showPdfMode() {
    document.getElementById('uploadZone').parentElement.style.display = 'none';
    pdfUploadSection.style.display = 'block';
}

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

// PDF Functions
function handlePdfDragOver(e) {
    e.preventDefault();
    pdfUploadZone.classList.add('drag-over');
}

function handlePdfDragLeave(e) {
    e.preventDefault();
    pdfUploadZone.classList.remove('drag-over');
}

function handlePdfDrop(e) {
    e.preventDefault();
    pdfUploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handlePdfFile(files[0]);
    }
}

function handlePdfFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handlePdfFile(file);
    }
}

function handlePdfFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a PDF file');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
    }

    originalPdfFile = file;
    pdfOriginalSize.textContent = formatFileSize(file.size);
    pdfOriginalName.textContent = file.name;
    pdfCompressedName.textContent = `compressed-${file.name}`;
    
    // Show controls
    pdfControlsSection.style.display = 'block';
    
    // Get PDF page count (simplified)
    pdfOriginalPages.textContent = 'Loading...';
    setTimeout(() => {
        pdfOriginalPages.textContent = 'Multiple pages';
    }, 500);
}

function updatePdfQualityValue() {
    pdfQualityValue.textContent = pdfQualitySlider.value;
}

async function processPdf() {
    if (!originalPdfFile) {
        alert('Please upload a PDF file');
        return;
    }

    try {
        pdfProcessBtn.textContent = 'Compressing...';
        pdfProcessBtn.disabled = true;

        const pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];

        // Load original PDF into PDF.js
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(originalPdfFile);
        const arrayBuffer = await new Promise(res => {
            fileReader.onload = () => res(fileReader.result);
        });

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const { PDFDocument } = PDFLib;
        const newPdf = await PDFDocument.create();

        const compressionLevel = parseInt(pdfQualitySlider.value); // e.g. 50
        const quality = compressionLevel / 100; // JPEG quality

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });

            // Render page to canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = viewport.width * quality;
            canvas.height = viewport.height * quality;

            await page.render({
                canvasContext: ctx,
                viewport: page.getViewport({ scale: quality })
            }).promise;

            // Convert canvas to compressed JPEG
            const imgData = await new Promise(res =>
                canvas.toBlob(b => res(b), "image/jpeg", quality)
            );
            const imgBytes = await imgData.arrayBuffer();

            // Embed image into new PDF
            const img = await newPdf.embedJpg(imgBytes);
            const newPage = newPdf.addPage([canvas.width, canvas.height]);
            newPage.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
        }

        // Save compressed PDF
        compressedPdfBytes = await newPdf.save();

        // Update stats
        pdfCompressedSize.textContent = formatFileSize(compressedPdfBytes.length);
        const reduction = ((originalPdfFile.size - compressedPdfBytes.length) / originalPdfFile.size * 100).toFixed(1);
        pdfReduction.textContent = `${reduction}% smaller`;
        pdfCompressionRatio.textContent = `${reduction}%`;
        pdfSizeReduction.textContent = `${formatFileSize(originalPdfFile.size - compressedPdfBytes.length)} saved`;

        // Show preview section
        pdfPreviewSection.style.display = 'block';

    } catch (err) {
        console.error("PDF compression error:", err);
        alert("Failed to compress PDF");
    } finally {
        pdfProcessBtn.textContent = 'Compress PDF';
        pdfProcessBtn.disabled = false;
    }
}

// Download compressed PDF
function downloadPdf() {
    if (!compressedPdfBytes) {
        alert("No compressed PDF available for download");
        return;
    }

    const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = pdfCompressedName.textContent || "compressed.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// Reset PDF app
function resetPdfApp() {
    originalPdfFile = null;
    compressedPdfBytes = null;

    // Reset form
    pdfFileInput.value = "";
    pdfQualitySlider.value = 50;
    pdfQualityValue.textContent = "50";
    pdfOptimizeFonts.checked = true;
    pdfFlattenForms.checked = true;

    // Hide sections
    pdfControlsSection.style.display = "none";
    pdfPreviewSection.style.display = "none";

    // Clear stats
    pdfOriginalSize.textContent = "";
    pdfOriginalPages.textContent = "";
    pdfCompressedSize.textContent = "";
    pdfReduction.textContent = "-";
    pdfCompressionRatio.textContent = "-";
    pdfSizeReduction.textContent = "-";
    pdfOriginalName.textContent = "";
    pdfCompressedName.textContent = "";
}
