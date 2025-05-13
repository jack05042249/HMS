import { forwardRef, useRef, useState } from 'react';

function downloadFile(file) {
  const url = URL.createObjectURL(file); // create a temporary URL for the File object

  const a = document.createElement('a');
  a.href = url;
  a.download = file.name; // use the original filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url); // clean up the blob URL
}

async function downloadFileWrapper(fileOrGetFile) {
  if (!(fileOrGetFile instanceof File)) {
    try {
      const file = await fileOrGetFile();
      if (file) {
        downloadFile(file);
      }
      return;
    } catch (e) {
      //
    }
  }

  return downloadFile(fileOrGetFile);
}

const UploadCV = forwardRef(({ onChange, showDownload = true, getInitialFile = null }, ref) => {
  const fileInputRef = useRef(null);
  const [fileOrGetFile, setFileOrGetFile] = useState(() => getInitialFile);

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onChange(selectedFile);
      setFileOrGetFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFileOrGetFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input value
    }
  };

  return (
    <div className='space-y-3 flex gap-[8px]'>
      <div className='flex items-center space-x-3'>
        <label
          htmlFor='fileInput'
          className='whitespace-nowrap cursor-pointer text-blue-600 hover:text-blue-800 border px-4 py-2 rounded-md bg-white border-gray-300 shadow-sm transition duration-200'
        >
          Choose File (PDF)
        </label>
        <input
          ref={fileInputRef}
          type='file'
          id='fileInput'
          accept='application/pdf'
          onChange={handleFileChange}
          className='hidden'
        />
        {fileOrGetFile && (
          <div className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm text-gray-700'>
            <span className='truncate max-w-[200px] inline-flex flex-col gap-[4px]'>
              <span>{fileOrGetFile instanceof File ? fileOrGetFile.name : 'cv.pdf'}</span>
              {showDownload && (
                <span
                  className='text-xs cursor-pointer text-blue-300 hover:underline'
                  onClick={() => downloadFileWrapper(fileOrGetFile)}
                >
                  download
                </span>
              )}
            </span>
            <button
              type='button'
              onClick={handleRemoveFile}
              className='text-red-500 hover:text-red-700 text-lg leading-none'
              title='Remove file'
            >
              &times;
            </button>
          </div>
        )}
      </div>
      {!fileOrGetFile && <div className='text-sm text-gray-600'>No file selected.</div>}
    </div>
  );
});

export { UploadCV };
