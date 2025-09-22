import React, { useState, useRef } from "react";
import { User, Camera, X, AlertCircle } from "lucide-react";
import { IconButton, Snackbar, Alert, FormHelperText } from "@mui/material";

const ProfilePhotoUpload = ({ formData, setFormData }) => {
  const [previewUrl, setPreviewUrl] = useState(formData?.profile_picture || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(""); // Clear previous errors

    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a JPG or PNG image");
      return;
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    setFormData((prev) => ({...prev, profile_picture: file}))
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPreviewUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseError = () => {
    setError("");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-gray-500 text-center mb-2">
          Upload your professional photo
        </p>

        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={60} className="text-gray-400" />
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />

          <IconButton
            onClick={handleClick}
            className="!absolute !bottom-0 !right-0 !bg-blue-500 hover:!bg-blue-600 !text-white !p-2 !shadow-md"
            size="medium"
          >
            <Camera size={20} />
          </IconButton>

          {previewUrl && (
            <IconButton
              onClick={handleRemovePhoto}
              className="!absolute !top-0 !right-0 !bg-red-500 hover:!bg-red-600 !text-white !p-1 !shadow-md"
              size="small"
            >
              <X size={16} />
            </IconButton>
          )}
        </div>

        <FormHelperText>PNG, JPG up to 5MB</FormHelperText>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
    </div>
  );
};

export default ProfilePhotoUpload;
