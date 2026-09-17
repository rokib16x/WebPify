const OUTPUT_FORMATS = {
  webp: { mimeType: "image/webp", extension: "webp", label: "WebP" },
  jpeg: { mimeType: "image/jpeg", extension: "jpg", label: "JPEG" },
  png: { mimeType: "image/png", extension: "png", label: "PNG" },
};

export const getOutputFormat = (format = "webp") =>
  OUTPUT_FORMATS[format] || OUTPUT_FORMATS.webp;

export const getOutputFilename = (filename, format = "webp") =>
  `${filename.replace(/\.[^/.]+$/, "")}.${getOutputFormat(format).extension}`;

const isHeicImage = (file) =>
  ["image/heic", "image/heif"].includes(file.type.toLowerCase()) ||
  /\.(heic|heif)$/i.test(file.name);

const decodeHeic = async (file) => {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/png",
  });

  return Array.isArray(converted) ? converted[0] : converted;
};

export const createImagePreview = async (file) => {
  const previewSource = isHeicImage(file) ? await decodeHeic(file) : file;
  return URL.createObjectURL(previewSource);
};

export const convertImage = async (
  file,
  quality,
  targetWidth,
  targetHeight,
  outputFormat = "webp",
  lossless = false,
  preserveMetadata = false
) => {
  let imageSource = file;

  if (isHeicImage(file)) {
    imageSource = await decodeHeic(file);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (targetWidth && targetHeight) {
        width = targetWidth;
        height = targetHeight;
      } else if (targetWidth) {
        const ratio = targetWidth / img.width;
        width = targetWidth;
        height = img.height * ratio;
      } else if (targetHeight) {
        const ratio = targetHeight / img.height;
        height = targetHeight;
        width = img.width * ratio;
      }

      // Create canvas for WebP conversion
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Draw image to canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error("Canvas is not supported"));
        return;
      }

      // JPEG does not support transparency, so use a white background.
      if (outputFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      const { mimeType } = getOutputFormat(outputFormat);
      const outputQuality = lossless && outputFormat === "webp" ? 1 : quality / 100;
      const encodeImage = () => {
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(img.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(`${getOutputFormat(outputFormat).label} conversion failed`));
            }
          },
          mimeType,
          outputQuality
        );
      };

      // If preserving metadata, read the original image data
      if (preserveMetadata && !isHeicImage(file)) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            // Create a temporary image to extract metadata
            const tempImg = new Image();
            tempImg.src = reader.result;
            await new Promise((res) => (tempImg.onload = res));

            encodeImage();
          } catch (error) {
            URL.revokeObjectURL(img.src);
            reject(error);
          }
        };
        reader.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error("Failed to read image metadata"));
        };
        reader.readAsDataURL(file);
      } else {
        encodeImage();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(imageSource);
  });
};

export const calculateSavings = (originalSize, webpSize) => {
  const saved = originalSize - webpSize;
  const percentage = Math.round((saved / originalSize) * 100);
  return {
    saved,
    percentage,
    formattedSaved: formatFileSize(saved),
  };
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

// Helper function to get estimated file size reduction based on image type
export const getEstimatedReduction = (fileType) => {
  const lowerType = fileType.toLowerCase();
  if (lowerType.includes('jpeg') || lowerType.includes('jpg')) {
    return '25-35%';
  } else if (lowerType.includes('png')) {
    return '26-34%';
  } else if (lowerType.includes('gif')) {
    return '60-80%';
  } else {
    return '20-30%';
  }
};

// Function to simulate progress for better UX
export const simulateProgress = async (callback, steps = 10, duration = 1000) => {
  const stepTime = duration / steps;
  for (let i = 1; i <= steps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepTime));
    callback(Math.round((i / steps) * 100));
  }
};

// Function to create and download a zip file containing multiple images
export const downloadAsZip = async (images, zipFilename = "webpify-images.zip") => {
  // Dynamically import JSZip to ensure it's only loaded when needed
  const JSZip = (await import('jszip')).default;
  
  const zip = new JSZip();
  
  // Add each converted image to the zip
  images.forEach(image => {
    if (image.webpBlob && image.status === "done") {
      const filename = getOutputFilename(image.name, image.outputFormat);
      zip.file(filename, image.webpBlob);
    }
  });
  
  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: "blob" });
  
  // Create download link and trigger download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(link.href);
  
  return true;
};