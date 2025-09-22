import { Alert, Button, Snackbar, Typography } from "@mui/material";
import { AlertCircle } from "lucide-react";
import FileUploadSection from "../components/FileUploadSection";
import { useState } from "react";
import TransitionAlert from "../components/TransitionAlert";
import useDocumentUpload from "../../hooks/useDocumentUpload";

const DocumentsForm = ({ documents = {}, onSubmit, onCancel }) => {
  const {
    error,
    files,
    resumeInputRef,
    referenceInputRef,
    licenseInputRef,
    passportInputRef,
    handleRemoveFile,
    handleFileChange,
    handleCloseError,
    handleDrop,
    handleDragOver,
  } = useDocumentUpload(documents);

  const [errors, setErrors] = useState({});

  // const isEmpty =
  //   files.aviation_licenses === null &&
  //   files.cv === null &&
  //   files.passport === null &&
  //   files.reference_letters === null;
  const isEmpty = files.cv === null

  const validateForm = () => {
    // if (isEmpty) return false;
    if (isEmpty) {
      setErrors((prev) => ({ ...prev, cv: "Resume/CV is required" }));
      return false;
    }
    // if (files.aviation_licenses === null) {
    //   setErrors((prev) => ({
    //     ...prev,
    //     aviation_licenses: "Aviation license is required",
    //   }));
    // }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(files);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 my-3">
        <>
          <TransitionAlert message="Upload your CV to autopopulate some of the other fields" />
          <FileUploadSection
            title="Resume/CV"
            required={true}
            type="cv"
            inputRef={resumeInputRef}
            acceptedFiles=".pdf,.doc,.docx"
            description="Click to upload your resume or drag and drop"
            maxSize="10MB"
            file={files.cv}
            onRemoveFile={() => handleRemoveFile("cv")}
            onFileChange={(e) => {
              handleFileChange("cv", e.target.files[0]);
              const updatedErrors = { ...errors };
              if (updatedErrors["cv"]) {
                delete updatedErrors["cv"];
              }
              setErrors(updatedErrors);
            }}
            onDrop={(e) => handleDrop(e, "cv")}
            onDragOver={handleDragOver}
          />
          {errors["cv"] && (
            <Typography variant="caption" color="error">
              {errors["cv"]}
            </Typography>
          )}
        </>

        {/* <>
          <FileUploadSection
            title="Aviation License"
            required={true}
            type="aviation_licenses"
            inputRef={licenseInputRef}
            acceptedFiles=".pdf,.jpg,.jpeg,.png, .doc, .docx"
            description="Click to upload license documents or drag and drop"
            maxSize="5MB"
            file={files.aviation_licenses}
            onRemoveFile={() => handleRemoveFile("aviation_licenses")}
            onFileChange={(e) => {
              handleFileChange("aviation_licenses", e.target.files[0]);
              const updatedErrors = { ...errors };
              if (updatedErrors["aviation_licenses"]) {
                delete updatedErrors["aviation_licenses"];
              }
              setErrors(updatedErrors);
            }}
            onDrop={(e) => handleDrop(e, "aviation_licenses")}
            onDragOver={handleDragOver}
          />
          {errors["aviation_licenses"] && (
            <Typography variant="caption" color="error">
              {errors["aviation_licenses"]}
            </Typography>
          )}
        </> */}

        {/* Passport Section */}
        {/* <FileUploadSection
          title="Passport"
          required={false}
          type="passport"
          inputRef={passportInputRef}
          acceptedFiles=".jpg,.jpeg,.png,.pdf"
          description="Click to upload your passport or drag and drop"
          maxSize="5MB"
          file={files.passport}
          onRemoveFile={() => handleRemoveFile("passport")}
          onFileChange={(e) => handleFileChange("passport", e.target.files[0])}
          onDrop={(e) => handleDrop(e, "passport")}
          onDragOver={handleDragOver}
        /> */}

        {/* Reference Letter Section */}
        {/* <FileUploadSection
          title="Reference Letter"
          required={false}
          type="reference_letters"
          inputRef={referenceInputRef}
          acceptedFiles=".pdf,.doc,.docx"
          description="Click to upload reference letter or drag and drop"
          maxSize="10MB"
          file={files.reference_letters}
          onRemoveFile={() => handleRemoveFile("reference_letters")}
          onFileChange={(e) =>
            handleFileChange("reference_letters", e.target.files[0])
          }
          onDrop={(e) => handleDrop(e, "reference_letters")}
          onDragOver={handleDragOver}
        /> */}

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color={isEmpty ? "secondary" : "primary"}
            disabled={isEmpty}
          >
            Save
          </Button>
        </div>
      </form>

      {/* Licenses & Certifications Section */}
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
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => handleFileChange("licenses", e.target.files[0])}
        />
      </div> */}
      {/* <Alert
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
      </Alert> */}

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
    </>
  );
};

export default DocumentsForm;
