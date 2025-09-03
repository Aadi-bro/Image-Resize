// ===============================
// Global Variables
// ===============================
let originalFile = null;
let originalImage = null;
let originalPdfFile = null;
let compressedPdfBytes = null;
let currentMode = null; // 'image' or 'pdf'

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
const processBtn = document.getElementById('processBtn'); // fixed ID
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
const pdfProcessBtn = document.getElementById('pdfProcessBtn'); // fixed ID
const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
const pdfOriginalSize = document.getElementById('pdfOriginalSize');
const pdfOriginalPages = document.getElementById('pdfOriginalPages');
const pdfCompressedSize = document.getElementById('pdfCompressedSize');
const pdfReduction = document.getElementById('pdfReduction');
const pdfCompressionRatio = document.getElementById('pdfCompressionRatio');
const pdfSizeReduction = document.getElementById('pdfSizeReduction');
const pdfOriginalName = document.getElementById('pdfOriginalName');
const pdfCompressedName = document.getElementById('pdfCompressedName');

// Loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loadingOverlay';
loadingOverlay.style.position = 'fixed';
loadingOverlay.style.top = '0';
loadingOverlay.style.left = '0';
loadingOverlay.style.width = '100vw';
loadingOverlay.style.height = '100vh';
loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
loadingOverlay.style.color = 'white';
loadingOverlay.style.fontSize = '1.5rem';
loadingOverlay.style.display = 'flex';
loadingOverlay.style.justifyContent = 'center';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.style.zIndex = '9999';
loadingOverlay.style.display = 'none';
loadingOverlay.textContent = 'Processing... Please wait...';
document.body.appendChild(loadingOverlay);

// Landing message
const container = document.querySelector('.container');
const landingMessage = document.createElement('div');
landingMessage.id = 'landingMessage';
landingMessage.style.textAlign = 'center';
landingMessage.style.marginTop = '3rem';
landingMessage.innerHTML = `
  <h2>Welcome to Simple Image Resizer</h2>
  <p>Select a mode to get started:</p>
  <button id="landingImageBtn" class="upload-btn" style="margin-right:1rem;">Image Mode</button>
  <button id="landingPdfBtn" class="upload-btn">PDF Mode</button>
`;
container.insertBefore(landingMessage, container.firstChild);

document.getElementById('landingImageBtn').addEventListener('click', () => {
  setActiveMode('image');
});
document.getElementById('landingPdfBtn').addEventListener('click', () => {
  setActiveMode('pdf');
});

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

function showLoading(message = 'Processing... Please wait...') {
  loadingOverlay.textContent = message;
  loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  loadingOverlay.style.display = 'none';
}

function hideAllSections() {
  if (uploadZone && uploadZone.parentElement) uploadZone.parentElement.style.display = 'none';
  if (pdfUploadSection) pdfUploadSection.style.display = 'none';

  controlsSection.style.display = 'none';
  previewSection.style.display = 'none';
  pdfControlsSection.style.display = 'none';
  pdfPreviewSection.style.display = 'none';

  landingMessage.style.display = 'none';
}

function setActiveMode(mode) {
  currentMode = mode;
  hideAllSections();

  if (mode === 'image') {
    if (uploadZone && uploadZone.parentElement) uploadZone.parentElement.style.display = 'block';
    resetPdfApp();
    resetApp();
  } else if (mode === 'pdf') {
    if (pdfUploadSection) pdfUploadSection.style.display = 'block';
    resetApp();
    resetPdfApp();
  }
}

// ===============================
// Image Compressor
// ===============================
function resetApp() {
  originalFile = null;
  originalImage = null;

  fileInput.value = "";
  qualitySlider.value = 85;
  qualityValue.textContent = "85";

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

processBtn.addEventListener("click", async () => {
  if (!originalImage) {
    alert("Please select an image first");
    return;
  }
  try {
    showLoading('Compressing image...');
    const quality = qualitySlider.value / 100;
    const format = document.getElementById('formatSelect').value;

    // Calculate new dimensions if width/height provided
    let width = parseInt(document.getElementById('widthInput').value);
    let height = parseInt(document.getElementById('heightInput').value);
    const maintainRatio = document.getElementById('maintainRatio').checked;

    if (!width && !height) {
      width = originalImage.width;
      height = originalImage.height;
    } else if (maintainRatio) {
      if (width && !height) {
        height = Math.round((width / originalImage.width) * originalImage.height);
      } else if (!width && height) {
        width = Math.round((height / originalImage.height) * originalImage.width);
      }
    } else {
      if (!width) width = originalImage.width;
      if (!height) height = originalImage.height;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(originalImage, 0, 0, width, height);

    // Convert canvas to blob with selected format and quality
    const mimeType = format === 'jpeg' ? 'image/jpeg' : (format === 'png' ? 'image/png' : 'image/webp');

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) throw new Error('Compression failed');

    processedImageEl.src = URL.createObjectURL(blob);
    processedSize.textContent = formatFileSize(blob.size);
    processedDimensions.textContent = `${width} x ${height}`;
    const ratio = (blob.size / originalFile.size * 100).toFixed(2);
    compressionRatio.textContent = `${ratio}%`;
    sizeReduction.textContent = `${(100 - ratio).toFixed(2)}%`;

    downloadBtn.onclick = () => {
      try {
        const a = document.createElement("a");
        a.href = processedImageEl.src;
        a.download = "compressed_" + originalFile.name;
        a.click();
      } catch (err) {
        alert("Error downloading image: " + err.message);
      }
    };

    // Add back to home button dynamically
    addBackToHomeButton(previewSection);

  } catch (err) {
    alert("Error during compression: " + err.message);
  } finally {
    hideLoading();
  }
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

pdfUploadSection.addEventListener("click", () => pdfFileInput.click());
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

pdfProcessBtn.addEventListener("click", async () => {
  if (!originalPdfFile) {
    alert("Please select a PDF file first");
    return;
  }
  try {
    showLoading('Compressing PDF...');
    const arrayBuffer = await originalPdfFile.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    // Note: Real compression requires more advanced processing.
    // Here we just re-save the PDF which may reduce size slightly.
    compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

    const sizeBefore = originalPdfFile.size;
    const sizeAfter = compressedPdfBytes.byteLength;
    pdfCompressedSize.textContent = formatFileSize(sizeAfter);
    pdfCompressionRatio.textContent = ((sizeAfter / sizeBefore) * 100).toFixed(2) + "%";
    pdfSizeReduction.textContent = (100 - (sizeAfter / sizeBefore * 100)).toFixed(2) + "%";

    pdfPreviewSection.style.display = 'block';

    // Add back to home button dynamically
    addBackToHomeButton(pdfPreviewSection);

  } catch (err) {
    alert("Error during PDF compression: " + err.message);
  } finally {
    hideLoading();
  }
});

pdfDownloadBtn.addEventListener("click", () => {
  if (!compressedPdfBytes) {
    alert("No compressed PDF available for download");
    return;
  }
  try {
    const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfCompressedName.textContent || "compressed.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    alert("Error downloading PDF: " + err.message);
  }
});

// ===============================
// Back to Home Button
// ===============================
function addBackToHomeButton(parentSection) {
  // Remove existing back button if any
  const existingBtn = parentSection.querySelector('.back-home-btn');
  if (existingBtn) existingBtn.remove();

  const btn = document.createElement('button');
  btn.textContent = 'Back to Home';
  btn.className = 'reset-btn back-home-btn';
  btn.style.marginTop = '1rem';
  btn.onclick = () => {
    resetApp();
    resetPdfApp();
    hideAllSections();
    landingMessage.style.display = 'block';
    currentMode = null;
  };
  parentSection.appendChild(btn);
}

// ===============================
// Neutral Landing on Load
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  resetApp();
  resetPdfApp();
  hideAllSections();
  landingMessage.style.display = 'block';
});
