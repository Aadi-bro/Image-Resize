
# Simple Image Resizer

🚀 Just launched my latest project: Simple Image & PDF Resizer!

As a 3rd year BSCIT student, I'm thrilled to share my new web application that solves a real-world problem - optimizing images without losing quality.


A modern, web-based tool for compressing and resizing images and PDFs. Built with pure HTML, CSS, and JavaScript - no backend required!

## ✨ Features

### 🖼️ Image Compression
- **Multiple Formats**: Support for JPEG, PNG, and WebP output
- **Quality Control**: Adjustable compression quality (10-100%)
- **Smart Resizing**: Resize to exact dimensions or maintain aspect ratio
- **Real-time Preview**: Before/after comparison with file size and dimension stats
- **Drag & Drop**: Intuitive file upload interface

### 📄 PDF Compression
- **Aggressive Optimization**: Intelligent compression based on file size and quality settings
- **Page Rendering**: Converts PDF pages to optimized images
- **Size Reduction**: Significant file size reduction while maintaining readability
- **Batch Processing**: Handles multi-page PDFs efficiently

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Dark/Light Mode**: Automatic theme switching based on system preference
- **Loading States**: Visual feedback during processing
- **Mobile Friendly**: Fully responsive design for all devices
- **Instant Download**: One-click download of processed files

## 🚀 Quick Start

### Option 1: Open in Browser
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start compressing your files!

### Option 2: Live Demo
Simply open the `index.html` file in your browser to use the tool immediately.

## 📖 Usage

### Image Mode
1. Click "Image Mode" or drag and drop an image file
2. Adjust compression settings:
   - **Quality**: Set compression level (higher = better quality, larger file)
   - **Format**: Choose output format (JPEG, PNG, WebP)
   - **Dimensions**: Set width/height (leave empty for original size)
   - **Aspect Ratio**: Keep checked to maintain proportions
3. Click "Process Image"
4. Compare original vs compressed in the preview
5. Download your optimized image

### PDF Mode
1. Click "PDF Mode" or drag and drop a PDF file
2. Adjust compression level (10-90% - lower = smaller file)
3. Click "Compress PDF"
4. View compression statistics
5. Download your compressed PDF

## 🛠️ Technical Details

### Architecture
```
├── index.html          # Main HTML structure and UI
├── style.css           # Modern CSS with CSS variables and animations
├── main.js             # Core application logic and event handling
└── pdf-utils.js        # PDF compression utilities
```

### Technologies Used
- **Frontend**: Pure HTML5, CSS3, ES6+ JavaScript
- **Image Processing**: HTML5 Canvas API
- **Styling**: CSS Grid, Flexbox, CSS Variables, Smooth animations

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Size Limits
- **Images**: Limited by browser memory (typically 100MB+)
- **PDFs**: 50MB maximum (configurable in `main.js`)



### Adding New Features
1. **New Image Format**: Add to `formatSelect` options in `index.html`
2. **New Compression Algorithm**: Extend `processImage()` in `main.js`
3. **UI Components**: Add new sections following the existing CSS patterns

## 📊 Performance

### Image Processing
- **Canvas-based**: Fast, client-side processing
- **Memory Efficient**: Processes images in memory without server uploads
- **Quality Preservation**: Maintains image quality during resizing

### PDF Processing
- **Intelligent Scaling**: Adaptive compression based on file size
- **Progressive Rendering**: Handles large PDFs without freezing the UI
- **Memory Management**: Efficient canvas cleanup and garbage collection

## 🐛 Known Limitations

- Large PDF files (>50MB) may cause browser memory issues
- Some PDF features (forms, annotations) may not be preserved during compression
- Processing time depends on file size and device performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly in multiple browsers
5. Submit a pull request

## 🙏 Acknowledgments

- **PDF.js** - Mozilla's PDF rendering library
- **PDF-lib** - PDF creation and manipulation library
- **Icons** - Emoji-based icons for lightweight design
- **CSS Variables** - Modern theming approach

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Aadi-bro/image-compressor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Aadi-bro/image-compressor/discussions)
- **Email**: [(aadityabhai78@gmail.com)]

## 📞 Connect with Me

- **LinkedIn**: [Aditya Verma](https://www.linkedin.com/in/adityaverma72081)
- **Instagram**: [@_aaditya_274](https://www.instagram.com/_aaditya_274)
- - **Email**: [(aadityabhai78@gmail.com)]

---

**Made with ❤️ by Aditya Verma**

*Compress smarter, not harder!*


Try it out: (https://image-pdf-resizer.vercel.app/)
#WebDevelopment #ImageProcessing #JavaScript #StudentDeveloper #BSCIT #FrontendDevelopment #UIUX #ProductLaunch


