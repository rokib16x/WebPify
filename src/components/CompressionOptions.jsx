import { useState } from "react";

const CompressionOptions = ({ compressionLevel, setCompressionLevel, resolution, setResolution }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");

  const handleWidthChange = (e) => {
    const value = e.target.value;
    setWidthInput(value);
    if (value === "") {
      setResolution((prev) => ({ ...prev, width: null }));
    } else {
      const width = Number.parseInt(value, 10);
      if (!isNaN(width) && width > 0) {
        setResolution((prev) => ({ ...prev, width }));
      }
    }
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    setHeightInput(value);
    if (value === "") {
      setResolution((prev) => ({ ...prev, height: null }));
    } else {
      const height = Number.parseInt(value, 10);
      if (!isNaN(height) && height > 0) {
        setResolution((prev) => ({ ...prev, height }));
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-5 text-[#2c2d2a]">Compression Options</h2>

      <div className="mb-5">
        <label className="block mb-2 font-medium text-[#2c2d2a]">Resolution</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Width"
              value={widthInput}
              onChange={handleWidthChange}
              className="w-full p-2.5 border border-[#f3f3f7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0267ff] focus:border-[#0267ff]"
            />
          </div>
          <span className="text-[#6b7280]">×</span>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Height"
              value={heightInput}
              onChange={handleHeightChange}
              className="w-full p-2.5 border border-[#f3f3f7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0267ff] focus:border-[#0267ff]"
            />
          </div>
        </div>
        <p className="text-xs text-[#6b7280] mt-2">Leave blank to maintain original dimensions</p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-[#2c2d2a]">Compression Quality</label>
          <span className="font-semibold text-[#0267ff]">{compressionLevel}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={compressionLevel}
          onChange={(e) => setCompressionLevel(Number.parseInt(e.target.value, 10))}
          className="w-full h-2 bg-[#f3f3f7] rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #0267ff 0%, #0267ff ${compressionLevel}%, #f3f3f7 ${compressionLevel}%, #f3f3f7 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#6b7280] mt-1">
          <span>Lower quality</span>
          <span>Higher quality</span>
        </div>

        <button
          className="text-[#0267ff] text-sm mt-4 hover:underline focus:outline-none flex items-center"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "− Hide Advanced" : "+ Advanced Settings"}
        </button>
      </div>

      {showAdvanced && (
        <div className="pt-4 border-t border-[#f3f3f7] space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lossless"
              className="w-4 h-4 text-[#0267ff] border-[#f3f3f7] rounded focus:ring-[#0267ff]"
            />
            <label htmlFor="lossless" className="ml-2 text-sm text-[#2c2d2a]">
              Lossless conversion
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metadata"
              className="w-4 h-4 text-[#0267ff] border-[#f3f3f7] rounded focus:ring-[#0267ff]"
            />
            <label htmlFor="metadata" className="ml-2 text-sm text-[#2c2d2a]">
              Preserve metadata
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionOptions;