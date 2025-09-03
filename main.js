// ===============================
// Global Variables
// ===============================
let originalFile = null;
let originalImage = null;
let originalPdfFile = null;
let compressedPdfBytes = null;
let currentMode = null; // neutral at start

// ===============================
// DOM Elements
// ===============================

// Image
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const controlsSection = document.getElementById('controlsSection');
const previewSection = document.getElementById('previewSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalImageEl = document.getElementById('originalImage');
const processedImageEl = document.getElementById('processedImage');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const processedSize = document.getElementById('processedSize');
const processedDimensions = document.getElementById('processedDimensions');
const compressionRatio = document.getElementById('compressionRatio');
const sizeReduction = document.getElementById('sizeReduction');

// PDF
const pdfUploadSection = document.getElementById('pdfUploadSection');
const pdfFileInput = document.getElementById('pdfFileInput');
const pdfControlsSection = document.getElementById('pdfControlsSection');
const pdfPreviewSection = document.getElementById('pdfPreviewSection');
const pdfQualitySlider = document.getElementById('pdfQualitySlider');
const pdfQualityValue = document.getElementById('pdfQualityValue');
const pdfCompressBtn = document.getElementById('pdfCompressBtn');
const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
const pdfOriginalSize = document.getElementById('pdfOriginalSize');
const pdfOriginalPages = document.getElementById('pdfOriginalPages');
const pdfCompressedSize = document.getElementById('pdfCompressedSize');
const pdfReduction = document.getElementById('pdfReduction');
const pdfCompressionRatio = document.getElementById('pdfCompressionRatio');
const pdfSizeReduction = document.getElementById('pdfSizeReduction');
const pdfOriginalName = document.getElementById('pdfOriginalName');
const pdfCompressedName = document.getElementById('pdfCompressedName');

// ===============================
// Helpers
// ===============================
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function hideAllSections() {
    // Hide upload sections too
    if (uploadZone && uploadZone.parentElement) uploadZone.parentElement.style.display = 'none';
    if (pdfUploadSection) pdfUploadSection.style.display = 'none';

    controlsSection.style.display = 'none';
    previewSection.style.display = 'none';
    pdfControlsSection.style.display = 'none';
    pdfPreviewSection.style.display = 'none';
}

function setActiveMode(mode) {
    currentMode = mode;
    hideAllSections();

    // Hide landing message
    const msg = document.getElementById('landingMessage');
    if (msg) msg.style.display = 'none';

    if (mode === 'image') {
        if (uploadZone && uploadZone.parentElement) uploadZone.parentElement.style.display = 'block';
        resetPdfApp();
    } else if (mode === 'pdf') {
        if (pdfUploadSection) pdfUploadSection.style.display = 'block';
        resetApp();
    }
}

function showImageMode() { setActiveMode('image'); }
function showPdfMode() { setActiveMode('pdf'); }

// ===============================
// Image Compressor
// ===============================
function resetApp() {
    originalFile = null;
    originalImage = null;

    fileInput.value = "";
    qualitySlider.value = 70;
    qualityValue.textContent = "70";

    controlsSection.style.display = "none";
    previewSection.style.display = "none";

    originalImageEl.src = "";
    processedImageEl.src = "";
    originalSize.textContent = "";
    originalDimensions.textContent = "";
    processedSize.textContent = "";
    processedDimensions.textContent = "";
    compressionRatio.textContent = "-";
    sizeReduction.textContent = "-";
}

uploadZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
    }
    originalFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
        originalImage = new Image();
        originalImage.src = ev.target.result;
        originalImage.onload = () => {
            originalImageEl.src = originalImage.src;
            originalSize.textContent = formatFileSize(file.size);
            originalDimensions.textContent = `${originalImage.width} x ${originalImage.height}`;
            controlsSection.style.display = "block";
            previewSection.style.display = "block";
        };
    };
    reader.readAsDataURL(file);
});

qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = qualitySlider.value;
});

compressBtn.addEventListener("click", () => {
    if (!originalImage) {
        alert("Please select an image first");
        return;
    }
    const quality = qualitySlider.value / 100;
    const canvas = document.createElement("canvas");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(originalImage, 0, 0);
    canvas.toBlob(blob => {
        if (blob) {
            processedImageEl.src = URL.createObjectURL(blob);
            processedSize.textContent = formatFileSize(blob.size);
            processedDimensions.textContent = `${originalImage.width} x ${originalImage.height}`;
            const ratio = (blob.size / originalFile.size * 100).toFixed(2);
            compressionRatio.textContent = `${ratio}%`;
            sizeReduction.textContent = `${(100 - ratio).toFixed(2)}%`;
            downloadBtn.onclick = () => {
                const a = document.createElement("a");
                a.href = processedImageEl.src;
                a.download = "compressed_" + originalFile.name;
                a.click();
            };
        }
    }, "image/jpeg", quality);
});

// ===============================
// PDF Compressor
// ===============================
function resetPdfApp() {
    originalPdfFile = null;
    compressedPdfBytes = null;
    pdfFileInput.value = "";
    pdfQualitySlider.value = 50;
    pdfQualityValue.textContent = "50";
    pdfControlsSection.style.display = "none";
    pdfPreviewSection.style.display = "none";
}

pdfFileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        alert("Please select a PDF file");
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        alert("File size exceeds 50MB limit");
        return;
    }
    originalPdfFile = file;
    pdfOriginalSize.textContent = formatFileSize(file.size);
    pdfOriginalName.textContent = file.name;
    pdfCompressedName.textContent = `compressed-${file.name}`;
    pdfControlsSection.style.display = 'block';
    pdfOriginalPages.textContent = 'Multiple pages'; // simplified
});

pdfQualitySlider.addEventListener("input", () => {
    pdfQualityValue.textContent = pdfQualitySlider.value;
});

pdfCompressBtn.addEventListener("click", async () => {
    if (!originalPdfFile) {
        alert("Please select a PDF file first");
        return;
    }
    const arrayBuffer = await originalPdfFile.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

    const sizeBefore = originalPdfFile.size;
    const sizeAfter = compressedPdfBytes.byteLength;
    pdfCompressedSize.textContent = formatFileSize(sizeAfter);
    pdfCompressionRatio.textContent = ((sizeAfter / sizeBefore) * 100).toFixed(2) + "%";
    pdfSizeReduction.textContent = (100 - (sizeAfter / sizeBefore * 100)).toFixed(2) + "%";

    pdfPreviewSection.style.display = 'block';
});

pdfDownloadBtn.addEventListener("click", () => {
    if (!compressedPdfBytes) {
        alert("No compressed PDF available for download");
        return;
    }
    const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfCompressedName.textContent || "compressed.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
});

// ===============================
// Neutral Landing
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    resetApp();
    resetPdfApp();
    hideAllSections();
    const msg = document.getElementById('landingMessage');
    if (msg) msg.style.display = 'block';
});  
