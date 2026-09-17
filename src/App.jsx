import { useState, useEffect } from "react";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import CompressionOptions from "./components/CompressionOptions";
import ImageList from "./components/ImageList";
import FeatureFooter from "./components/FeatureFooter";
import {
  convertImage,
  createImagePreview,
  downloadAsZip,
  getOutputFilename,
  getOutputFormat,
} from "./utils/imageProcessing";
import { redisCounter } from "./utils/redisCounter";

function App() {
  const [images, setImages] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [resolution, setResolution] = useState({ width: null, height: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [optionsChanged, setOptionsChanged] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lossless, setLossless] = useState(false);
  const [preserveMetadata, setPreserveMetadata] = useState(false);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [conversionCount, setConversionCount] = useState(0);
  const [isCounterLoading, setIsCounterLoading] = useState(true);

  // Function to increment conversion counter
  const incrementConversionCounter = async () => {
    try {
      const newCount = await redisCounter.incrementCounter();
      if (newCount !== null) {
        setConversionCount(newCount);
      }
    } catch (error) {
      console.error('Error incrementing conversion counter:', error);
    }
  };

  // Function to refresh counter display
  const refreshCounter = async () => {
    try {
      setIsCounterLoading(true);
      const currentCount = await redisCounter.getCounter();
      setConversionCount(currentCount);
    } catch (error) {
      console.error('Error refreshing counter:', error);
    } finally {
      setIsCounterLoading(false);
    }
  };

  // Load initial counter value
  useEffect(() => {
    const loadInitialCounter = async () => {
      try {
        const currentCount = await redisCounter.getCounter();
        setConversionCount(currentCount);
      } catch (error) {
        console.error('Error loading initial counter:', error);
      } finally {
        setIsCounterLoading(false);
      }
    };

    loadInitialCounter();
  }, []);

  // Track changes to compression options
  useEffect(() => {
    if (images.some((img) => img.status === "done")) {
      setOptionsChanged(true);
    }
  }, [compressionLevel, resolution, outputFormat, lossless, preserveMetadata, images]);



  const handleImageUpload = async (newImages) => {
    const imageObjects = await Promise.all(
      Array.from(newImages).map(async (file) => {
        let preview = null;

        try {
          preview = await createImagePreview(file);
        } catch (error) {
          console.error(`Unable to create preview for ${file.name}:`, error);
        }

        return {
          id: crypto.randomUUID(),
          file,
          originalSize: file.size,
          name: file.name,
          preview,
          webpBlob: null,
          webpSize: null,
          status: "queued",
          progress: 0,
        };
      })
    );

    setImages((prev) => [...prev, ...imageObjects]);
  };

  const processImages = async (imagesToProcess) => {
    if (imagesToProcess.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);
    setOptionsChanged(false);

    const totalImages = imagesToProcess.length;
    let processedCount = 0;

    for (let i = 0; i < imagesToProcess.length; i++) {
      const currentImage = imagesToProcess[i];
      const imageIndex = images.findIndex((img) => img.id === currentImage.id);

      if (imageIndex === -1) continue;

      setCurrentProcessingIndex(imageIndex);
      setImages((prev) =>
        prev.map((img) =>
          img.id === currentImage.id
            ? { ...img, status: "processing", progress: 0 }
            : img
        )
      );

      try {
        // Update progress in steps
        const updateProgress = (progress) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === currentImage.id ? { ...img, progress } : img
            )
          );
        };

        // Simulate progress steps
        for (let progress = 10; progress <= 90; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          updateProgress(progress);
        }

        const webpBlob = await convertImage(
          currentImage.file,
          compressionLevel,
          resolution.width,
          resolution.height,
          outputFormat,
          lossless,
          preserveMetadata
        );

        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? {
                  ...img,
                  webpBlob,
                  webpSize: webpBlob.size,
                  webpPreview: URL.createObjectURL(webpBlob),
                  outputFormat,
                  status: "done",
                  progress: 100,
                }
              : img
          )
        );

        // Increment conversion counter for successful conversion
        await incrementConversionCounter();

        processedCount++;
        setOverallProgress(Math.round((processedCount / totalImages) * 100));
      } catch (error) {
        console.error("Error converting image:", error);
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? { ...img, status: "error", progress: 0 }
              : img
          )
        );
      }
    }

    setCurrentProcessingIndex(null);
    setIsProcessing(false);
    setOverallProgress(100);
  };

  const handleConvertAll = async () => {
    const imagesToProcess = images.filter(
      (img) => img.status !== "done" || optionsChanged
    );
    await processImages(imagesToProcess);
  };

  const handleReconvert = async (specificIds = null) => {
    let imagesToProcess;

    if (specificIds) {
      // Convert only specific images
      imagesToProcess = images.filter((img) => specificIds.includes(img.id));
    } else {
      // Reconvert all images
      imagesToProcess = [...images];
      // Reset all images to queued state
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          status: "queued",
          progress: 0,
          webpBlob: null,
          webpSize: null,
          webpPreview: null,
        }))
      );
    }

    await processImages(imagesToProcess);
  };

  const handleReset = () => {
    images.forEach((image) => {
      if (image.preview) URL.revokeObjectURL(image.preview);
      if (image.webpPreview) URL.revokeObjectURL(image.webpPreview);
    });
    setImages([]);
    setOverallProgress(0);
    setCurrentProcessingIndex(null);
    setOptionsChanged(false);
  };

  const handleRemoveImage = (id) => {
    const image = images.find((item) => item.id === id);
    if (image?.preview) URL.revokeObjectURL(image.preview);
    if (image?.webpPreview) URL.revokeObjectURL(image.webpPreview);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDownloadAll = () => {
    images.forEach((img) => {
      if (img.webpBlob && img.status === "done") {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(img.webpBlob);
        link.download = getOutputFilename(img.name, img.outputFormat);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    });
  };

  const handleDownloadAsZip = async () => {
    const completedImages = images.filter((img) => img.status === "done");
    if (completedImages.length === 0) return;

    setIsDownloading(true);
    try {
      await downloadAsZip(completedImages, "webpify-images.zip");
    } catch (error) {
      console.error("Error creating zip file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="page-stage">
      <div className="app-shell">
        <Header />

        <main className="app-content">
          <section className="hero-section">
            <div className="hero-badge">ϟ&nbsp;&nbsp; Faster Images. A Lighter Web.</div>
            <h1>Convert Images to {getOutputFormat(outputFormat).label}</h1>
            <p>
              Reduce file size by up to 80% while keeping outstanding quality. Fast, free and privacy-friendly. No sign up required.
            </p>
          </section>

          <div className="converter-grid">
            <div className="converter-controls">
              <CompressionOptions
                compressionLevel={compressionLevel}
                setCompressionLevel={setCompressionLevel}
                resolution={resolution}
                setResolution={setResolution}
                outputFormat={outputFormat}
                setOutputFormat={setOutputFormat}
                lossless={lossless}
                setLossless={setLossless}
                preserveMetadata={preserveMetadata}
                setPreserveMetadata={setPreserveMetadata}
              />

              <div className="flex gap-2">
                <button
                  className="convert-button"
                  onClick={handleConvertAll}
                  disabled={isProcessing || images.length === 0}
                >
                  <span>
                    {isProcessing
                      ? "Converting..."
                      : optionsChanged
                      ? "Apply New Settings"
                      : `Convert to ${getOutputFormat(outputFormat).label}`}
                  </span>
                  <span className="text-lg">→</span>
                </button>
                {images.length > 0 && (
                  <button
                    className="reset-button"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    Reset
                  </button>
                )}
              </div>

              {isProcessing && (
                <div className="status-card">
                  <div className="mb-2 flex justify-between">
                    <span>Overall Progress</span>
                    <span className="font-bold text-[#2878f0]">{overallProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#e9edf4]">
                    <div
                      className="h-full rounded-full bg-[#2878f0] transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-[#8a93a3]">
                    {currentProcessingIndex !== null
                      ? `Processing: ${images[currentProcessingIndex]?.name || ""}`
                      : "Preparing files..."}
                  </p>
                </div>
              )}
            </div>

            <div className="converter-results">
              {images.length === 0 ? (
                <ImageUploader onImageUpload={handleImageUpload} />
              ) : (
                <ImageList
                  images={images}
                  onRemove={handleRemoveImage}
                  onDownloadAll={handleDownloadAll}
                  onDownloadAsZip={handleDownloadAsZip}
                  onReconvert={handleReconvert}
                  isProcessing={isProcessing}
                  isDownloading={isDownloading}
                />
              )}
            </div>
          </div>
        </main>
        <FeatureFooter />
      </div>
    </div>
  );
}

export default App;
