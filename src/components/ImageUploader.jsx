import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

const ImageUploader = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
      const validFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));

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
      className={`bg-white rounded-xl border-2 border-dashed ${
        isDragging ? "border-[#0267ff] bg-[#f3f3f7]" : "border-[#f3f3f7] hover:border-[#0267ff]"
      } p-8 text-center cursor-pointer transition-all h-full min-h-[300px] flex items-center justify-center`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickUpload}
    >
      <div className="flex flex-col items-center gap-4">
        <UploadCloud className="w-16 h-16 text-[#0267ff]" />
        <h3 className="text-xl font-semibold text-[#2c2d2a]">Click, or drop your files here</h3>
        <p className="text-[#6b7280] max-w-md mx-auto">
          Supports JPG, PNG, GIF, BMP and other image formats. 
          Convert to WebP for smaller file sizes and faster loading.
        </p>
        <div className="mt-2 bg-[#f3f3f7] rounded-lg p-3 text-sm text-[#6b7280]">
          <span className="text-[#10b981] font-medium">Pro tip:</span> WebP images are typically 25-35% smaller than JPEG 
          and 26% smaller than PNG with the same quality.
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUploader;