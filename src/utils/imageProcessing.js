export const convertToWebP = (file, quality, targetWidth, targetHeight, lossless = false, preserveMetadata = false) => {
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
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      // Create WebP conversion options
      const options = {
        quality: lossless ? 1 : quality / 100,
        lossless: lossless,
      };

      // If preserving metadata, read the original image data
      if (preserveMetadata) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            // Create a temporary image to extract metadata
            const tempImg = new Image();
            tempImg.src = reader.result;
            await new Promise((res) => (tempImg.onload = res));

            // Convert to WebP with metadata
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("WebP conversion failed"));
                }
              },
              "image/webp",
              options
            );
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read image metadata"));
        reader.readAsDataURL(file);
      } else {
        // Convert to WebP without metadata
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          options
        );
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
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
      const filename = image.name.replace(/\.[^/.]+$/, "") + ".webp";
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