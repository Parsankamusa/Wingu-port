import React from "react";
import { FileText, Upload, X } from "lucide-react";
import { IconButton } from "@mui/material";

const FileUploadSection = ({
  title,
  required,
  type,
  inputRef,
  acceptedFiles,
  description,
  maxSize,
  file,
  onRemoveFile,
  onFileChange,
  onDrop,
  onDragOver
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={acceptedFiles}
          onChange={onFileChange}
        />

        {file ? (
          <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
            <div className="flex items-center">
              <FileText className="text-blue-500 mr-2" size={20} />
              <span className="text-blue-700 font-medium">
                {file.name}
              </span>
            </div>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
              size="small"
              className="!text-red-500"
            >
              <X size={16} />
            </IconButton>
          </div>
        ) : (
          <>
            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-700">{description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {acceptedFiles
                .split(",")
                .join(", ")
                .replace(/\./g, "")
                .toUpperCase()}{" "}
              up to {maxSize}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;