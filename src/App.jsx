import { useState, useEffect } from "react";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import CompressionOptions from "./components/CompressionOptions";
import ImageList from "./components/ImageList";
import { convertToWebP, downloadAsZip } from "./utils/imageProcessing";

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

  // Track changes to compression options
  useEffect(() => {
    if (images.some((img) => img.status === "done")) {
      setOptionsChanged(true);
    }
  }, [compressionLevel, resolution, lossless, preserveMetadata, images]);

  const handleImageUpload = (newImages) => {
    const imageObjects = Array.from(newImages).map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalSize: file.size,
      name: file.name,
      preview: URL.createObjectURL(file),
      webpBlob: null,
      webpSize: null,
      status: "queued",
      progress: 0,
    }));

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

        const webpBlob = await convertToWebP(
          currentImage.file,
          compressionLevel,
          resolution.width,
          resolution.height,
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
                  status: "done",
                  progress: 100,
                }
              : img
          )
        );

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
    // Clear all images and reset state
    setImages([]);
    setOverallProgress(0);
    setCurrentProcessingIndex(null);
    setOptionsChanged(false);
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDownloadAll = () => {
    images.forEach((img) => {
      if (img.webpBlob && img.status === "done") {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(img.webpBlob);
        link.download = img.name.replace(/\.[^/.]+$/, "") + ".webp";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const handleDownloadAsZip = async () => {
    const completedImages = images.filter(img => img.status === "done");
    if (completedImages.length === 0) return;
    
    setIsDownloading(true);
    try {
      await downloadAsZip(completedImages);
    } catch (error) {
      console.error("Error creating zip file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f7] font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <CompressionOptions
              compressionLevel={compressionLevel}
              setCompressionLevel={setCompressionLevel}
              resolution={resolution}
              setResolution={setResolution}
              lossless={lossless}
              setLossless={setLossless}
              preserveMetadata={preserveMetadata}
              setPreserveMetadata={setPreserveMetadata}
            />
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 px-4 bg-[#0267ff] hover:bg-[#0255ff] disabled:bg-[#0267ff]/50 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                  onClick={handleConvertAll}
                  disabled={isProcessing || images.length === 0}
                >
                  {isProcessing
                    ? "Converting..."
                    : optionsChanged
                    ? "Apply New Settings"
                    : "Convert to WebP"}
                </button>

                {images.length > 0 && (
                  <button
                    className="py-3 px-4 bg-[#f3f3f7] hover:bg-[#e5e5ea] text-[#2c2d2a] font-semibold rounded-lg transition-colors shadow-sm"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    Reset
                  </button>
                )}
              </div>

              {isProcessing && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#2c2d2a]">
                      Overall Progress
                    </span>
                    <span className="text-sm font-medium text-[#0267ff]">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="bg-[#f3f3f7] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0267ff] h-full rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#6b7280] mt-2">
                    {currentProcessingIndex !== null
                      ? `Processing: ${
                          images[currentProcessingIndex]?.name || ""
                        }`
                      : "Preparing files..."}
                  </p>
                </div>
              )}

              {optionsChanged &&
                !isProcessing &&
                images.some((img) => img.status === "done") && (
                  <div className="bg-[#fff8e6] border border-[#ffeeba] rounded-xl p-3 text-[#856404] text-sm">
                    <p>
                      Compression settings have changed. Click "Apply New
                      Settings" to update all images.
                    </p>
                  </div>
                )}
            </div>
          </div>
          <div className="lg:col-span-8">
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
    </div>
  );
}

export default App;