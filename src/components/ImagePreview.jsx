import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, X, Columns2 } from 'lucide-react';
import {
  formatFileSize,
  calculateSavings,
  getOutputFormat,
} from '../utils/imageProcessing';

const ImagePreview = ({ 
  selectedImage, 
  onClose, 
  onDownloadSingle, 
  onReconvert 
}) => {
  const outputLabel = getOutputFormat(selectedImage.outputFormat).label;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  return (
    <div
      className="preview-overlay"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="preview-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="preview-header">
          <div className="min-w-0">
            <h3>{selectedImage.name}</h3>
            <p>Compare the original with your optimized {outputLabel} image</p>
          </div>
          <div className="preview-actions">
            {selectedImage.webpPreview && (
              <button
                onClick={toggleCompareMode}
                className={`preview-compare-button ${compareMode ? "preview-compare-button-active" : ""}`}
              >
                <Columns2 size={15} /> Compare
              </button>
            )}
            {selectedImage.status === "done" && (
              <button
                onClick={() => onDownloadSingle(selectedImage, { stopPropagation: () => {} })}
                className="preview-download-button"
              >
                <Download size={15} /> Download
              </button>
            )}
            <button
              onClick={onClose}
              className="preview-close-button"
              aria-label="Close preview"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="preview-body">
          {compareMode && selectedImage.webpPreview ? (
            <div 
              ref={containerRef}
              className="preview-compare"
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
                  alt={outputLabel}
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
                {outputLabel}
              </div>
            </div>
          ) : (
            <div className="preview-grid">
              <div className="preview-panel">
                <h4>Original</h4>
                <div
                  className="preview-canvas cursor-move"
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
                  <div className="preview-size">
                    Size: {formatFileSize(selectedImage.originalSize)}
                  </div>
                )}
              </div>

              {selectedImage.webpPreview ? (
                <div className="preview-panel">
                  <h4>{outputLabel}</h4>
                  <div className="preview-canvas">
                    <img
                      src={selectedImage.webpPreview || "/placeholder.svg"}
                      alt={outputLabel}
                      className="w-full h-full object-contain transition-transform"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      }}
                    />
                  </div>
                  {selectedImage.webpSize && (
                    <div className="preview-size">
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
                <div className="preview-panel flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-[#6b7280] mb-2">{outputLabel} version not available yet</p>
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
            <div className="preview-zoom">
              <label>Zoom: {zoomLevel.toFixed(1)}×</label>
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
  );
};

export default ImagePreview;