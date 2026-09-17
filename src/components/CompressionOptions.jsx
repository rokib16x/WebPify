import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const CompressionOptions = ({
  compressionLevel,
  setCompressionLevel,
  resolution,
  setResolution,
  outputFormat,
  setOutputFormat,
  lossless,
  setLossless,
  preserveMetadata,
  setPreserveMetadata,
}) => {
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
    <section className="options-card">
      <div className="mb-5 flex items-center gap-3">
        <span className="section-icon">
          <SlidersHorizontal size={17} strokeWidth={1.8} />
        </span>
        <h2 className="text-[15px] font-bold tracking-[-0.03em] text-[#161922]">
          Conversion Options
        </h2>
      </div>

      <div className="option-group">
        <label className="option-label">Output Format</label>
        <p className="option-help">Choose the format you want to convert to.</p>
        <div className="format-picker">
          {[
            ["webp", "WebP"],
            ["png", "PNG"],
            ["jpeg", "JPG"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setOutputFormat(value)}
              className={outputFormat === value ? "format-button-active" : "format-button"}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <label className="option-label">Resize (Optional)</label>
        <p className="option-help">Leave empty to keep original dimensions.</p>
        <div className="flex items-center gap-2">
          <div className="dimension-input">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Width"
              value={widthInput}
              onChange={handleWidthChange}
            />
            <span>px</span>
          </div>
          <span className="text-xs text-[#a1a8b5]">×</span>
          <div className="dimension-input">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Height"
              value={heightInput}
              onChange={handleHeightChange}
            />
            <span>px</span>
          </div>
        </div>
      </div>

      <div className="option-group">
        <div className="mb-2 flex items-center justify-between">
          <label className="option-label">Compression Quality</label>
          <span className="text-xs font-bold text-[#2878f0]">{compressionLevel}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={compressionLevel}
          onChange={(e) => setCompressionLevel(Number.parseInt(e.target.value, 10))}
          className="w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2878f0 0%, #2878f0 ${compressionLevel}%, #e9edf4 ${compressionLevel}%, #e9edf4 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[9px] text-[#8a93a3]">
          <span>Smaller file size</span>
          <span>Higher quality</span>
        </div>
      </div>

      <button
        type="button"
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={14} />
          Advanced Settings
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        />
      </button>

      {showAdvanced && (
        <div className="advanced-panel">
          {outputFormat === "webp" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lossless"
                checked={lossless}
                onChange={(e) => setLossless(e.target.checked)}
              />
              <label htmlFor="lossless" className="ml-2">Lossless conversion</label>
            </div>
          )}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metadata"
              checked={preserveMetadata}
              onChange={(e) => setPreserveMetadata(e.target.checked)}
            />
            <label htmlFor="metadata" className="ml-2">Preserve metadata</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompressionOptions;