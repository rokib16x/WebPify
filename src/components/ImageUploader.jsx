import { useRef, useState } from "react";
import { ImageIcon, Layers } from "lucide-react";

const ImageUploader = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const isSupportedImage = (file) =>
    file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(isSupportedImage);

      if (validFiles.length > 0) {
        onImageUpload(validFiles);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files);
      e.target.value = null; // Reset input
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-card ${
        isDragging ? "upload-card-dragging" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickUpload}
    >
      <div className="support-badge">
        <Layers size={12} className="text-[#2878f0]" />
        Supports JPG, PNG, HEIC, GIF, BMP and more
      </div>

      <div className="flex flex-col items-center">
        <div className="upload-icon">
          <ImageIcon size={36} strokeWidth={1.8} />
        </div>
        <h3 className="mt-5 text-[18px] font-bold tracking-[-0.04em] text-[#171a22]">
          Drag &amp; drop your images here
        </h3>
        <p className="mt-1 text-xs text-[#6c7585]">
          or <span className="font-semibold text-[#2878f0]">click to browse</span>
        </p>
        <p className="mt-3 text-[11px] text-[#8a93a3]">
          You can upload multiple images at once
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["JPG", "PNG", "HEIC", "GIF", "BMP", "WEBP", "•••"].map((format) => (
            <span key={format} className="file-pill">{format}</span>
          ))}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUploader;