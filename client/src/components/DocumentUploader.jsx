import { useState, useRef, useCallback } from 'react';
import './DocumentUploader.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 1;

export default function DocumentUploader({ label, hint, accept = 'image/*,.pdf', required = false, onChange, error, showPreview = true }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef();

  const validate = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) return 'Invalid file type. Only JPG, PNG, WEBP, PDF allowed.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return 'File size must not exceed 1 MB.';
    return null;
  };

  const handleFile = useCallback((f) => {
    if (!f) return;
    const err = validate(f);
    if (err) { setFileError(err); return; }
    setFileError('');
    setFile(f);
    onChange(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('pdf');
    }
  }, [onChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setFileError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const areaClass = ['upload-area', dragging ? 'drag-over' : '', file ? 'has-file' : '', (error || fileError) ? 'error' : ''].filter(Boolean).join(' ');

  return (
    <div className="doc-uploader">
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      {hint && <p className="form-hint" style={{ marginBottom: 6 }}>{hint}</p>}

      {!file ? (
        <div
          className={areaClass}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="upload-icon">📎</div>
          <div className="upload-label">Drag & drop or tap to choose</div>
          <div className="upload-hint">JPG, PNG, WEBP or PDF • Max 1MB</div>
          <button type="button" className="btn btn-outline btn-sm" tabIndex={-1} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Choose File
          </button>
        </div>
      ) : (
        <div className="upload-preview">
          {showPreview && preview && preview !== 'pdf' ? (
            <img src={preview} alt="Preview" />
          ) : (
            <div className="upload-preview-icon">{preview === 'pdf' ? '📄' : '✅'}</div>
          )}
          <div className="upload-preview-info">
            <div className="upload-preview-name">{file.name}</div>
            <div className="upload-preview-size">{(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}</div>
            <div className="upload-preview-status">✓ Ready to upload</div>
          </div>
          <div className="upload-preview-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>Replace</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleRemove}>Remove</button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
        aria-hidden="true"
      />

      {(fileError || error) && <p className="form-error">{fileError || error}</p>}
    </div>
  );
}
