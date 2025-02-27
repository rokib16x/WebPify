import { useState, useRef, useEffect, useCallback } from "react";
import { formatFileSize, calculateSavings } from "../utils/imageProcessing";
import { Download, Archive } from "lucide-react";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setCompareMode(false);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  const handleZoomChange = (e) => {
    setZoomLevel(Number.parseFloat(e.target.value));
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && zoomLevel > 1) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setImagePosition({ x: newX, y: newY });
      }
    },
    [isDragging, zoomLevel, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSliderMouseDown = (e) => {
    if (compareMode && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const handleSliderMove = (moveEvent) => {
        const x = moveEvent.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
      };
      
      handleSliderMove(e);
      
      const handleSliderMouseUp = () => {
        document.removeEventListener('mousemove', handleSliderMove);
        document.removeEventListener('mouseup', handleSliderMouseUp);
      };
      
      document.addEventListener('mousemove', handleSliderMove);
      document.addEventListener('mouseup', handleSliderMouseUp);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDownloadSingle = (image, e) => {
    e.stopPropagation(); // Prevent opening the image preview
    if (image.webpBlob && image.status === "done") {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(image.webpBlob);
      link.download = image.name.replace(/\.[^/.]+$/, "") + ".webp";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#f3f3f7]">
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

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => {
            const savings = image.webpSize ? calculateSavings(image.originalSize, image.webpSize) : null;

            return (
              <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#f3f3f7] hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-[#f3f3f7] cursor-pointer" onClick={() => handleImageClick(image)}>
                  <img
                    src={image.preview || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-full object-contain"
                  />
                  {image.status === "processing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {image.status === "done" && (
                    <>
                      <div className="absolute top-2 right-2 bg-[#10b981] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {savings.percentage}% smaller
                      </div>
                      <button
                        onClick={(e) => handleDownloadSingle(image, e)}
                        className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-[#f3f3f7] transition-colors"
                        title="Download WebP"
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
        <div className="fixed inset-0 bg-[#2c2d2a] bg-opacity-90 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#f3f3f7]">
              <h3 className="text-lg font-semibold text-[#2c2d2a]">{selectedImage.name}</h3>
              <div className="flex items-center gap-4">
                {selectedImage.webpPreview && (
                  <button
                    onClick={toggleCompareMode}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      compareMode 
                        ? "bg-[#0267ff] text-white" 
                        : "bg-[#f3f3f7] text-[#2c2d2a] hover:bg-[#e5e5ea]"
                    }`}
                  >
                    Compare
                  </button>
                )}
                {selectedImage.status === "done" && (
                  <button
                    onClick={() => handleDownloadSingle(selectedImage, { stopPropagation: () => {} })}
                    className="text-sm px-3 py-1 rounded-lg bg-[#0267ff] text-white hover:bg-[#0255ff] transition-colors flex items-center gap-1"
                  >
                    <Download size={14} /> Download
                  </button>
                )}
                <button
                  onClick={handleClosePreview}
                  className="text-[#6b7280] hover:text-[#2c2d2a] text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {compareMode && selectedImage.webpPreview ? (
                <div 
                  ref={containerRef}
                  className="relative h-[500px] overflow-hidden border border-[#f3f3f7] rounded-lg"
                >
                  {/* Original image (background) */}
                  <img
                    src={selectedImage.preview}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  
                  {/* WebP image (foreground with clip) */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={selectedImage.webpPreview}
                      alt="WebP"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ 
                        width: `${100 / (sliderPosition/100)}%`,
                        maxWidth: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Slider handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleSliderMouseDown}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-[#0267ff]">⟷</span>
                    </div>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Original
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    WebP
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-[#f3f3f7] rounded-lg overflow-hidden">
                    <h4 className="p-2 text-center bg-[#f3f3f7] font-medium text-[#2c2d2a]">Original</h4>
                    <div
                      className="h-[400px] overflow-hidden relative bg-white cursor-move"
                      onMouseDown={handleMouseDown}
                    >
                      <img
                        ref={imageRef}
                        src={selectedImage.preview || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-full object-contain transition-transform"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                          cursor: zoomLevel > 1 ? "grab" : "default",
                        }}
                      />
                    </div>
                    {selectedImage.originalSize && (
                      <div className="p-2 text-center text-sm text-[#6b7280]">
                        Size: {formatFileSize(selectedImage.originalSize)}
                      </div>
                    )}
                  </div>

                  {selectedImage.webpPreview ? (
                    <div className="border border-[#f3f3f7] rounded-lg overflow-hidden">
                      <h4 className="p-2 text-center bg-[#f3f3f7] font-medium text-[#2c2d2a]">WebP</h4>
                      <div className="h-[400px] overflow-hidden relative bg-white">
                        <img
                          src={selectedImage.webpPreview || "/placeholder.svg"}
                          alt="WebP"
                          className="w-full h-full object-contain transition-transform"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                          }}
                        />
                      </div>
                      {selectedImage.webpSize && (
                        <div className="p-2 text-center text-sm text-[#6b7280]">
                          Size: {formatFileSize(selectedImage.webpSize)}
                          {selectedImage.originalSize && (
                            <span className="text-[#10b981] ml-2">
                              ({calculateSavings(selectedImage.originalSize, selectedImage.webpSize).percentage}% smaller)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-[#f3f3f7] rounded-lg overflow-hidden flex items-center justify-center">
                      <div className="text-center p-6">
                        <p className="text-[#6b7280] mb-2">WebP version not available yet</p>
                        {selectedImage.status === "processing" ? (
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-[#0267ff] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <button 
                            className="bg-[#0267ff] text-white px-4 py-2 rounded-lg"
                            onClick={() => onReconvert([selectedImage.id])}
                          >
                            Convert Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!compareMode && (
                <div className="flex items-center gap-4 mt-6">
                  <label className="text-sm min-w-20 text-[#2c2d2a]">Zoom: {zoomLevel.toFixed(1)}×</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoomLevel}
                    onChange={handleZoomChange}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageList;