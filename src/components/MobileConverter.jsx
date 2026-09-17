import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Heart,
  ImageIcon,
  Images,
  Lock,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import CompressionOptions from "./CompressionOptions";
import {
  calculateSavings,
  formatFileSize,
  getOutputFormat,
} from "../utils/imageProcessing";

const steps = {
  home: "home",
  select: "select",
  settings: "settings",
  converting: "converting",
  results: "results",
  preview: "preview",
};

const MobileHeader = ({ title, onBack, action }) => (
  <header className="mobile-header">
    {onBack ? (
      <button type="button" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
    ) : (
      <div className="mobile-brand">
        <span><ImageIcon size={17} /></span>
        <strong>webpify</strong>
      </div>
    )}
    {title && <h2>{title}</h2>}
    {action || <span className="mobile-header-spacer" />}
  </header>
);

const MobileConverter = ({
  images,
  onUpload,
  onRemove,
  onReset,
  onConvert,
  onDownloadAll,
  onDownloadImage,
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
  isProcessing,
  overallProgress,
  currentProcessingIndex,
}) => {
  const [step, setStep] = useState(images.length ? steps.select : steps.home);
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileInputRef = useRef(null);

  const completedImages = useMemo(
    () => images.filter((image) => image.status === "done"),
    [images]
  );
  const originalTotal = images.reduce((total, image) => total + image.originalSize, 0);
  const convertedTotal = completedImages.reduce(
    (total, image) => total + (image.webpSize || 0),
    0
  );
  const savings = originalTotal && convertedTotal
    ? calculateSavings(originalTotal, convertedTotal)
    : null;
  const previewImage = completedImages[previewIndex] || completedImages[0];
  const previewSavings = previewImage?.webpSize
    ? calculateSavings(previewImage.originalSize, previewImage.webpSize)
    : null;
  const outputLabel = getOutputFormat(outputFormat).label;

  useEffect(() => {
    if (step === steps.converting && !isProcessing && completedImages.length > 0) {
      setStep(steps.results);
    }
  }, [completedImages.length, isProcessing, step]);

  const openPicker = () => fileInputRef.current?.click();

  const handleFiles = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;
    await onUpload(files);
    event.target.value = "";
    setStep(steps.select);
  };

  const startConversion = async () => {
    setStep(steps.converting);
    await onConvert();
  };

  const resetWorkflow = () => {
    onReset();
    setStep(steps.home);
  };

  return (
    <div className="mobile-app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {step === steps.home && (
        <div className="mobile-screen mobile-home">
          <MobileHeader
            action={<button className="mobile-icon-button" aria-label="Settings"><Settings size={18} /></button>}
          />
          <div className="mobile-home-content">
            <div className="mobile-kicker"><Zap size={12} /> Faster Images. A Lighter Web.</div>
            <h1>Convert Images<br />to {outputLabel}</h1>
            <p>Reduce file size by up to 80% while keeping outstanding quality.</p>

            <div className="mobile-hero-art">
              <div className="mobile-art-card mobile-art-card-back" />
              <div className="mobile-art-card mobile-art-card-middle" />
              <div className="mobile-art-card mobile-art-card-front">
                <ImageIcon size={54} />
              </div>
              <div className="mobile-art-note">
                <span><Check size={11} /> Smaller size.</span>
                <span><Check size={11} /> Same quality.</span>
              </div>
            </div>

            <div className="mobile-benefits">
              <div><span className="blue"><Zap size={18} /></span><b>Super Fast</b></div>
              <div><span className="green"><Lock size={18} /></span><b>100% Private</b></div>
              <div><span className="pink"><Heart size={18} fill="currentColor" /></span><b>Completely Free</b></div>
            </div>
          </div>
          <div className="mobile-bottom-action">
            <button className="mobile-primary-button" onClick={openPicker}>
              Select Images <ArrowRight size={17} />
            </button>
            <p>No sign up required</p>
          </div>
        </div>
      )}

      {step === steps.select && (
        <div className="mobile-screen">
          <MobileHeader
            title="Select Images"
            onBack={() => setStep(steps.home)}
            action={<button className="mobile-text-button" onClick={resetWorkflow}>Cancel</button>}
          />
          <div className="mobile-tabs">
            <button className="active">Photos</button>
            <button>Files</button>
            <button>Albums</button>
          </div>
          <button className="mobile-search" type="button" onClick={openPicker}>
            <Images size={16} /> Add more images
          </button>
          <div className="mobile-photo-grid">
            {images.map((image) => (
              <div key={image.id} className="mobile-photo">
                {image.preview ? (
                  <img src={image.preview} alt={image.name} />
                ) : (
                  <ImageIcon size={26} />
                )}
                <button onClick={() => onRemove(image.id)} aria-label={`Remove ${image.name}`}>
                  <Check size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="mobile-selection-bar">
            <div className="mobile-selection-thumbs">
              {images.slice(0, 3).map((image) => (
                image.preview && <img key={image.id} src={image.preview} alt="" />
              ))}
            </div>
            <div>
              <strong>{images.length} image{images.length !== 1 ? "s" : ""} selected</strong>
              <span>{formatFileSize(originalTotal)}</span>
            </div>
            <button onClick={() => setStep(steps.settings)} disabled={!images.length}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === steps.settings && (
        <div className="mobile-screen mobile-settings">
          <MobileHeader title="Conversion Settings" onBack={() => setStep(steps.select)} />
          <div className="mobile-settings-card">
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
          </div>
          <div className="mobile-bottom-action">
            <button
              className="mobile-primary-button"
              onClick={startConversion}
              disabled={!images.length}
            >
              Convert {images.length} Image{images.length !== 1 ? "s" : ""}
            </button>
            <p>Supports JPG, PNG, GIF, BMP, HEIC and more.</p>
          </div>
        </div>
      )}

      {step === steps.converting && (
        <div className="mobile-screen">
          <MobileHeader title="Converting" onBack={() => setStep(steps.settings)} />
          <div className="mobile-progress-content">
            <div
              className="mobile-progress-ring"
              style={{ "--progress": `${Math.max(overallProgress, 4) * 3.6}deg` }}
            >
              <div>
                <strong>Converting...</strong>
                <span>
                  {currentProcessingIndex === null ? 0 : currentProcessingIndex + 1} of {images.length}
                </span>
              </div>
            </div>
            <div className="mobile-progress-list">
              <div className="done"><Check size={15} /> Preparing images <span>{images.length}/{images.length}</span></div>
              <div className={overallProgress > 20 ? "done" : ""}><Check size={15} /> Optimizing &amp; converting <span>{completedImages.length}/{images.length}</span></div>
              <div><Sparkles size={15} /> Finalizing <span>{Math.min(completedImages.length, images.length)}/{images.length}</span></div>
            </div>
            <div className="mobile-info-card">
              <Zap size={18} />
              <span>This may take a few seconds.<br />Please keep the app open.</span>
            </div>
          </div>
        </div>
      )}

      {step === steps.results && (
        <div className="mobile-screen">
          <MobileHeader title="Conversion Complete" onBack={() => setStep(steps.settings)} />
          <div className="mobile-results-content">
            <div className="mobile-success-icon"><Check size={31} /></div>
            <h1>All done!</h1>
            <p>{completedImages.length} images converted to {outputLabel}</p>
            <div className="mobile-result-stats">
              <div><strong>{formatFileSize(originalTotal)}</strong><span>Original size</span></div>
              <div><strong>{formatFileSize(convertedTotal)}</strong><span>New size</span></div>
              {savings && (
                <b className={savings.percentage < 0 ? "is-larger" : ""}>
                  {savings.percentage < 0
                    ? `↑ ${Math.abs(savings.percentage)}% larger`
                    : `↓ ${savings.percentage}% smaller`}
                </b>
              )}
            </div>
            <button className="mobile-primary-button" onClick={onDownloadAll}>
              <Download size={17} /> Download All
            </button>
            <div className="mobile-result-actions">
              <button onClick={() => setStep(steps.preview)}><ImageIcon size={17} /> Preview</button>
              <button onClick={() => navigator.share?.({ title: "WebPify" })}><Upload size={17} /> Share</button>
            </div>
            <button className="mobile-delete-button" onClick={resetWorkflow}>
              <Trash2 size={15} /> Delete Files
            </button>
          </div>
        </div>
      )}

      {step === steps.preview && previewImage && (
        <div className="mobile-screen">
          <MobileHeader
            title={`${previewIndex + 1} of ${completedImages.length}`}
            onBack={() => setStep(steps.results)}
          />
          <div className="mobile-preview-content">
            <div className="mobile-compare-image">
              <img src={previewImage.preview} alt="Original" />
              <div className="mobile-compare-after">
                <img src={previewImage.webpPreview} alt={outputLabel} />
              </div>
              <div className="mobile-compare-line"><span>↔</span></div>
              <label className="before">Original</label>
              <label className="after">{outputLabel}</label>
            </div>
            <dl className="mobile-file-details">
              <div><dt>File name</dt><dd>{previewImage.name}</dd></div>
              <div><dt>Original</dt><dd>{formatFileSize(previewImage.originalSize)}</dd></div>
              <div><dt>Converted</dt><dd>{formatFileSize(previewImage.webpSize)}</dd></div>
              <div>
                <dt>Difference</dt>
                <dd className={previewSavings?.percentage < 0 ? "is-larger" : ""}>
                  {previewSavings?.percentage < 0
                    ? `${Math.abs(previewSavings.percentage)}% larger`
                    : `${previewSavings?.percentage || 0}% smaller`}
                </dd>
              </div>
            </dl>
            <button className="mobile-primary-button" onClick={() => onDownloadImage(previewImage)}>
              <Download size={17} /> Download Image
            </button>
            {completedImages.length > 1 && (
              <div className="mobile-preview-pagination">
                {completedImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={index === previewIndex ? "active" : ""}
                    onClick={() => setPreviewIndex(index)}
                    aria-label={`Preview image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileConverter;
