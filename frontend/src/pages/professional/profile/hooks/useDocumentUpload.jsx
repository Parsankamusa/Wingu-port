import { useRef, useState } from "react";

const useDocumentUpload = (data) => {
  const [files, setFiles] = useState({
    cv: data?.cv || null,
    passport: data?.passport || null,
    reference_letters: data?.reference_letters || null,
    aviation_licenses: data?.aviation_licenses || null,
  });
  const [error, setError] = useState("");

  const resumeInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const medicalInputRef = useRef(null);
  const passportInputRef = useRef(null);
  const referenceInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (type, file) => {
    setError("");

    if (!file) return false;

    // Check file type based on category
    let validTypes = [];
    let maxSize = 0;

    if (type === "cv" || type === "reference_letters") {
      validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      maxSize = 10 * 1024 * 1024; // 10MB
    } else {
      validTypes = ["image/jpeg", "image/png", "application/pdf"];
      maxSize = 5 * 1024 * 1024; // 5MB
    }

    if (!validTypes.includes(file.type)) {
      const allowedTypes =
        type === "cv" || type === "reference_letters"
          ? "PDF, DOC, DOCX"
          : "JPG, PNG, PDF";
      setError(`Please select a ${allowedTypes} file`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = (type, file) => {
    if (handleFileUpload(type, file)) {
      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleRemoveFile = (type) => {
    setFiles((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    handleFileChange(type, file);
  };

  const handleCloseError = () => {
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    files,
    error,
    fileInputRef,
    resumeInputRef,
    licenseInputRef,
    medicalInputRef,
    passportInputRef,
    referenceInputRef,
    handleFileChange,
    handleRemoveFile,
    handleDrop,
    handleDragOver,
    handleCloseError,
  };
};

export default useDocumentUpload;
