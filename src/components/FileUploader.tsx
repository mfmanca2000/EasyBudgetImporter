import { useState, useRef } from 'react';
import { Button, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

type CSVUploaderProps = {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
};

const FileUploader = ({ onFileUpload, isLoading }: CSVUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <UploadFileIcon className="text-gray-400 text-5xl mb-2" />
        <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
        <p className="text-gray-500 text-sm mb-4">or</p>
        <Button 
          variant="outlined" 
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          Browse Files
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-medium">Selected file:</p>
          <p className="text-gray-600">{selectedFile.name}</p>
          <div className="mt-2">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Processing...' : 'Import Expenses'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;