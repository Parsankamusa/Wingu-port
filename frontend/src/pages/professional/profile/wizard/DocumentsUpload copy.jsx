import React, { useState, useRef } from "react";
import { Upload, FileText, Plus, X, AlertCircle, Shield } from "lucide-react";
import { IconButton, Snackbar, Alert, Typography, Box } from "@mui/material";
import FileUploadSection from "./FileUploadSection";
import useDocumentUpload from "./hooks/useDocumentUpload";

const DocumentsUpload = () => {
  // Consolidated state for all files

  const {
    error,
    files,
    resumeInputRef,
    referenceInputRef,
    licenseInputRef,
    medicalInputRef,
    passportInputRef,
    handleRemoveFile,
    handleFileChange,
    handleCloseError,
  } = useDocumentUpload();

  // Reusable file upload section component

  return (
    <div className="w-full mx-auto">
      <Alert severity="info" className="mb-6">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" fontWeight="bold">
            Document Verification
          </Typography>
          <Typography variant="body2">
            Upload your aviation licenses and certifications to get verified.
            Verified profiles get 3x more visibility to employers.
          </Typography>
        </Box>
      </Alert>

      {/* Resume/CV Section */}
      <FileUploadSection
        title="Resume/CV"
        required={true}
        type="resume"
        inputRef={resumeInputRef}
        acceptedFiles=".pdf,.doc,.docx"
        description="Click to upload your resume or drag and drop"
        maxSize="10MB"
      />

      {/* Licenses & Certifications Section */}
      <FileUploadSection
        title="Aviation License & Rating"
        required={false}
        type="licenses"
        inputRef={licenseInputRef}
        acceptedFiles=".pdf,.jpg,.jpeg,.png, .doc, .docx"
        description="Click to upload license documents or drag and drop"
        maxSize="5MB"
      />
      {/* Passport Section */}
      <FileUploadSection
        title="Passport"
        required={false}
        type="passport"
        inputRef={passportInputRef}
        acceptedFiles=".jpg,.jpeg,.png,.pdf"
        description="Click to upload your passport or drag and drop"
        maxSize="5MB"
      />

      {/* Reference Letter Section */}
      <FileUploadSection
        title="Reference Letter"
        required={false}
        type="referenceLetter"
        inputRef={referenceInputRef}
        acceptedFiles=".pdf,.doc,.docx"
        description="Click to upload reference letter or drag and drop"
        maxSize="10MB"
      />

      {/* Multiple files support */}
      {/* <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Aviation Licenses & Ratings
        </h3>

        <div className="grid gap-4 mb-4">
          {files.licenses.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-md p-3"
            >
              <div className="flex items-center">
                <FileText className="text-gray-600 mr-2" size={20} />
                <span className="text-gray-700">{file.name}</span>
              </div>
              <IconButton
                onClick={() => handleRemoveFile("licenses", index)}
                size="small"
                className="!text-red-500"
              >
                <X size={16} />
              </IconButton>
            </div>
          ))}
        </div>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200 flex justify-center"
          onClick={() => licenseInputRef.current?.click()}
        >
          <button
            type="button"
            onClick={() => licenseInputRef.current?.click()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <Plus size={18} className="mr-1" />
            <span>Add License Document</span>
          </button>
        </div>

        <input
          type="file"
          ref={licenseInputRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange("licenses", e.target.files[0])}
        />
      </div> */}

      {/* Medical Certificate Section */}
      {/* <FileUploadSection
        title="Medical Certificate (if applicable)"
        required={false}
        type="medical"
        inputRef={medicalInputRef}
        acceptedFiles=".pdf,.jpg,.jpeg,.png"
        description="Click to upload medical certificate or drag and drop"
        maxSize="5MB"
      /> */}

      {/* Security Info */}
      <Alert
        icon={<Shield fontSize="inherit" />}
        severity="info"
        className="mb-6"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" fontWeight="bold">
            Security & Privacy
          </Typography>
          <Typography variant="body2">
            All uploaded documents are encrypted and securely stored. Only
            verified recruiters can view your credentials, and you control who
            sees what.
          </Typography>
        </Box>
      </Alert>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          icon={<AlertCircle size={20} />}
          className="flex items-center"
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DocumentsUpload;
