// PDF compression utility with aggressive optimization
async function compressPDF(file, options) {
    const { quality } = options;
    
    // Load PDF.js if not already loaded
    if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded');
    }
    
    if (!window.PDFLib) {
        throw new Error('PDF-lib library not loaded');
    }

    const existingPdfBytes = await file.arrayBuffer();
    
    // Load PDF with pdf.js to render pages
    const loadingTask = window.pdfjsLib.getDocument({ data: existingPdfBytes });
    const pdf = await loadingTask.promise;

    // Create new pdf-lib document
    const outPdf = await window.PDFLib.PDFDocument.create();

    // Calculate aggressive compression parameters
    const sizeMB = file.size / (1024 * 1024);
    const compressionParams = calculateCompressionParams(sizeMB, quality);

    console.log('PDF compression params:', {
        sizeMB,
        userQuality: quality,
        ...compressionParams
    });

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Render at reduced scale for compression
        const viewport = page.getViewport({ scale: compressionParams.renderScale });
        
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ 
            canvasContext: ctx, 
            viewport: viewport 
        }).promise;

        // Further downscale for aggressive compression
        const targetCanvas = document.createElement('canvas');
        targetCanvas.width = Math.max(
            200, // Minimum width for readability
            Math.round(canvas.width * compressionParams.downscale)
        );
        targetCanvas.height = Math.max(
            200, // Minimum height for readability
            Math.round(canvas.height * compressionParams.downscale)
        );

        const targetCtx = targetCanvas.getContext('2d');
        targetCtx.fillStyle = '#ffffff';
        targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
        
        // Use high-quality scaling
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';
        targetCtx.drawImage(canvas, 0, 0, targetCanvas.width, targetCanvas.height);

        // Convert to JPEG with aggressive compression
        const jpegDataUrl = targetCanvas.toDataURL('image/jpeg', compressionParams.jpegQuality);
        const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());

        // Embed the compressed JPEG into the new PDF
        const jpegImage = await outPdf.embedJpg(jpegBytes);
        const jpegDims = jpegImage.scale(1);
        
        // Create page with image dimensions
        const pdfPage = outPdf.addPage([jpegDims.width, jpegDims.height]);
        pdfPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: jpegDims.width,
            height: jpegDims.height,
        });
    }

    // Save with maximum compression
    const pdfBytes = await outPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
    });

    return pdfBytes;
}

function calculateCompressionParams(sizeMB, userQuality) {
    // More aggressive compression for larger files
    let jpegQuality, renderScale, downscale;

    if (sizeMB >= 10 || userQuality <= 15) {
        // Extremely large files or very low quality
        jpegQuality = 0.1;
        renderScale = 0.3;
        downscale = 0.2;
    } else if (sizeMB >= 5 || userQuality <= 25) {
        // Very large files
        jpegQuality = 0.15;
        renderScale = 0.4;
        downscale = 0.25;
    } else if (sizeMB >= 2 || userQuality <= 40) {
        // Large files
        jpegQuality = 0.2;
        renderScale = 0.5;
        downscale = 0.3;
    } else if (userQuality <= 60) {
        // Moderate compression
        jpegQuality = Math.max(0.25, 0.8 - (userQuality / 100) * 0.6);
        renderScale = Math.max(0.6, 1.2 - (userQuality / 100) * 0.6);
        downscale = Math.max(0.4, 1.0 - (userQuality / 100) * 0.6);
    } else {
        // Higher quality preference
        jpegQuality = Math.max(0.3, 0.9 - (userQuality / 100) * 0.4);
        renderScale = Math.max(0.7, 1.0 - (userQuality / 100) * 0.3);
        downscale = Math.max(0.5, 0.9 - (userQuality / 100) * 0.4);
    }

    return { jpegQuality, renderScale, downscale };
}