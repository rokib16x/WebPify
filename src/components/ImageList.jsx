import { useState, useEffect, lazy, Suspense } from "react";
import {
  formatFileSize,
  calculateSavings,
  getOutputFilename,
  getOutputFormat,
} from "../utils/imageProcessing";
import { Download, Archive, ImageIcon } from "lucide-react";

const ImagePreview = lazy(() => import('./ImagePreview'));

const ImageList = ({ 
  images, 
  onRemove, 
  onDownloadAll, 
  onDownloadAsZip,
  isProcessing, 
  isDownloading,
  onReconvert 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  const handleDownloadSingle = (image, e) => {
    e.stopPropagation(); // Prevent opening the image preview
    if (image.webpBlob && image.status === "done") {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(image.webpBlob);
      link.download = getOutputFilename(image.name, image.outputFormat);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return "✓";
      case "processing":
        return "⟳";
      case "error":
        return "✕";
      default:
        return "⋯";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "text-[#10b981]";
      case "processing":
        return "text-[#0267ff]";
      case "error":
        return "text-[#ef4444]";
      default:
        return "text-[#6b7280]";
    }
  };

  const completedImages = images.filter((img) => img.status === "done");
  const showDownloadOptions = completedImages.length > 0;
  const showZipOption = completedImages.length > 1;

  return (
    <div className="image-list-card">
      <div className="image-list-header p-6 border-b border-[#f3f3f7]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-[#2c2d2a]">
            {images.length} File{images.length !== 1 ? "s" : ""}
          </h2>
          
          {showDownloadOptions && (
            <div className="flex gap-3">
              {showZipOption && (
                <button
                  className="bg-[#f3f3f7] hover:bg-[#e5e5ea] text-[#2c2d2a] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onDownloadAsZip}
                  disabled={isProcessing || isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#2c2d2a] border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Archive size={16} />
                      <span>Download as ZIP</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                className="bg-[#0267ff] hover:bg-[#0255ff] disabled:bg-[#0267ff]/50 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:cursor-not-allowed"
                onClick={onDownloadAll}
                disabled={completedImages.length === 0 || isProcessing}
              >
                <Download size={16} />
                <span>Download All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="image-list-scroll p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => {
            const savings = image.webpSize ? calculateSavings(image.originalSize, image.webpSize) : null;

            return (
              <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#f3f3f7] hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-[#f3f3f7] cursor-pointer" onClick={() => handleImageClick(image)}>
                  {image.preview ? (
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-[#8a93a3]">
                      <ImageIcon size={24} />
                      <span>Preview unavailable</span>
                    </div>
                  )}
                  {image.status === "processing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {image.status === "done" && (
                    <>
                      <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                        savings.percentage < 0 ? "bg-[#ef6a7d]" : "bg-[#10b981]"
                      }`}>
                        {savings.percentage < 0
                          ? `${Math.abs(savings.percentage)}% larger`
                          : `${savings.percentage}% smaller`}
                      </div>
                      <button
                        onClick={(e) => handleDownloadSingle(image, e)}
                        className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-[#f3f3f7] transition-colors"
                        title={`Download ${getOutputFormat(image.outputFormat).label}`}
                      >
                        <Download size={16} className="text-[#0267ff]" />
                      </button>
                    </>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-[#2c2d2a] truncate pr-2" title={image.name}>
                      {image.name}
                    </h3>
                    <button
                      className="text-[#6b7280] hover:text-[#ef4444] text-lg"
                      onClick={() => onRemove(image.id)}
                      disabled={isProcessing}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-[#6b7280]">
                    <span>
                      {formatFileSize(image.originalSize)}
                      {image.webpSize && (
                        <span> → {formatFileSize(image.webpSize)}</span>
                      )}
                    </span>
                    <span className={`font-medium ${getStatusColor(image.status)}`}>
                      {getStatusIcon(image.status)} {image.status}
                    </span>
                  </div>
                  
                  {image.status === "processing" && (
                    <div className="mt-2 bg-[#f3f3f7] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#0267ff] h-full rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${image.progress || 0}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedImage && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-[#2c2d2a] bg-opacity-90 flex justify-center items-center z-50">
            <div className="w-8 h-8 border-4 border-[#0267ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <ImagePreview
            selectedImage={selectedImage}
            onClose={handleClosePreview}
            onDownloadSingle={handleDownloadSingle}
            onReconvert={onReconvert}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ImageList;