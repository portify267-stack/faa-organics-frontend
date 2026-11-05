import React, { useRef, useState } from 'react';

export default function ImageUpload({
  value,
  onChange,
  label = "Product Image",
  required = false,
  error = null
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleFileProcess = (file) => {
    setLocalError('');
    if (!file) return;

    if (!acceptedTypes.includes(file.type.toLowerCase())) {
      setLocalError('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // Read and compress file using HTML5 Canvas to prevent multi-megabyte payloads
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const rawResult = e.target.result;
        const img = new Image();
        img.onload = () => {
          try {
            const maxDimension = 600;
            let { width, height } = img;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to optimized WebP (quality: 0.75) for super-fast sync (< 25 KB)
            const compressed = canvas.toDataURL('image/webp', 0.75);
            onChange(compressed);
          } catch (canvasErr) {
            console.warn('Canvas compression fallback to raw image:', canvasErr);
            onChange(rawResult);
          }
        };
        img.onerror = () => {
          onChange(rawResult);
        };
        img.src = rawResult;
      }
    };
    reader.onerror = () => {
      setLocalError('Failed to read the selected image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleChooseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setLocalError('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      {/* Hidden native file input supporting mobile camera/gallery and desktop file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box with Replace & Remove Controls */
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF6F0] border border-stone-300 transition-all">
          <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white border border-stone-300 shadow-sm flex-shrink-0 group">
            <img
              src={value}
              alt="Selected Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/uploads/img1.jpeg';
              }}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-800 font-medium">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Image loaded successfully</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Works across mobile gallery/camera and desktop files.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={handleChooseClick}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Drop Area */
        <div
          onClick={handleChooseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-200 text-center ${
            isDragging
              ? 'border-[#3a4d39] bg-[#FAF6F0]'
              : 'border-stone-300 hover:border-[#3a4d39] bg-stone-50/50 hover:bg-[#FAF6F0]/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#3a4d39] mb-3 shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-stone-800">
            Click to upload or drag &amp; drop image
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Supports JPG, JPEG, PNG, or WEBP from Photos, Camera, or Desktop files
          </p>

          <button
            type="button"
            className="mt-3 px-4 py-1.5 rounded-lg bg-[#3a4d39] text-white text-xs font-medium hover:bg-[#2d3d2c] shadow-xs pointer-events-none"
          >
            Choose Image
          </button>
        </div>
      )}

      {/* Error displays */}
      {(error || localError) && (
        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error || localError}</span>
        </p>
      )}
    </div>
  );
}

