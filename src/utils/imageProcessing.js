export const convertToWebP = (file, quality, targetWidth, targetHeight) => {
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
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("WebP conversion failed"));
          }
        },
        "image/webp",
        quality / 100
      );
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