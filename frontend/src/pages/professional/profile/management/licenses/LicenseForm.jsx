import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FileText, Upload, X } from "lucide-react";
import {
  licenseStatuses,
  licenseTypeOptions,
  regulatoryBodyOptions,
} from "../../components/dropDownData";
import { format } from "date-fns";
import TransferList from "../../components/TransferList";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";

const LicenseForm = ({
  license = {},
  onSubmit,
  onCancel,
  certificateUrl = "",
}) => {
  const [formData, setFormData] = useState({
    id: license?.id || null,
    license_upload: license?.license_upload || null,
    license_type: license?.license_type || "",
    issue_authority: license?.issue_authority || "",
    license_number: license?.license_number || "",
    issue_date: license?.issue_date || null,
    license_rating: license?.license_rating || "",
    expiry_date: license?.expiry_date || null,
    license_status: license?.license_status || "",
    renewal_date: license?.renewal_date || null,
  });

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const handleChange = (field, value) => {
    let newValue = value;

    // Convert date objects to YYYY-MM-DD
    if (value instanceof Date && !isNaN(value)) {
      newValue = format(value, "yyyy-MM-dd");
    }

    setFormData((prev) => ({ ...prev, [field]: newValue }));
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.license_type?.trim()) {
      newErrors.license_type = "License type is required";
      valid = false;
    }
    if (!formData.issue_authority) {
      newErrors.issue_authority = "Issue authority is required";
      valid = false;
    }
    if (!formData.license_number?.trim()) {
      newErrors.license_number = "License number is required";
      valid = false;
    }
    if (!formData.license_status?.trim()) {
      newErrors.license_status = "License status is required";
      valid = false;
    }
    if (!formData.issue_date?.trim()) {
      newErrors.issue_date = "Issue date is required";
      valid = false;
    }
    if (!formData.expiry_date?.trim()) {
      newErrors.expiry_date = "Expiry date is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, license_upload: null }));
  };

  const handleFileUpload = (file) => {
    setFileError("");

    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please select a JPG, PNG, or PDF file");
      return false;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB");
      return false;
    }

    setFormData((prev) => ({ ...prev, license_upload: file }));

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleCloseError = () => {
    setFileError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation here if needed
    if (validateForm()) onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 my-3">
        {/* Aviation Category */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="license_type" sx={{ fontWeight: 600 }}>
                License Type <RequiredAsterisk />
              </InputLabel>

              <FormControl fullWidth error={!!errors[`license_type`]}>
                <InputLabel id={`license-type-label`}>
                  License Type *
                </InputLabel>
                <Select
                  labelId={`license-type-label`}
                  id="license_type"
                  value={formData.license_type}
                  label="License Type *"
                  onChange={(e) => handleChange("license_type", e.target.value)}
                >
                  {licenseTypeOptions.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`license_type`] && (
                  <Typography variant="caption" color="error">
                    {errors[`license_type`]}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="issue_authority" sx={{ fontWeight: 600 }}>
                Issue Authority <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`issue_authority`]}>
                <InputLabel id={`issue-authority-label`}>
                  Issue Authority *
                </InputLabel>
                <Select
                  id="issue_authority"
                  labelId={`issue-authority-label`}
                  value={formData.issue_authority}
                  label="Issue Authority *"
                  onChange={(e) =>
                    handleChange("issue_authority", e.target.value)
                  }
                >
                  {regulatoryBodyOptions.map((authority) => (
                    <MenuItem key={authority.value} value={authority.value}>
                      {authority.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`issue_authority`] && (
                  <Typography variant="caption" color="error">
                    {errors[`issue_authority`]}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="license_number" sx={{ fontWeight: 600 }}>
                License Number <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`license_number`]}>
                <input
                  type="text"
                  id="license_number"
                  placeholder="License Number *"
                  value={formData.license_number}
                  onChange={(e) =>
                    handleChange("license_number", e.target.value)
                  }
                  className={`p-4 border rounded-md focus:outline-none focus:ring-2 ${
                    errors["license_number"]
                      ? "focus:ring-red-500 border-red-500 focus:border-2"
                      : "focus:ring-blue-500 border-gray-400"
                  }`}
                />
                {errors[`license_number`] && (
                  <Typography variant="caption" color="error">
                    {errors[`license_number`]}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="license_status" sx={{ fontWeight: 600 }}>
                License Status <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`license_status`]}>
                <InputLabel id={`license-status-label`}>
                  License Status *
                </InputLabel>
                <Select
                  id="license_status"
                  labelId={`license-status-label`}
                  value={formData.license_status}
                  label="License Status *"
                  onChange={(e) =>
                    handleChange("license_status", e.target.value)
                  }
                >
                  {licenseStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.display}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`license_status`] && (
                  <Typography variant="caption" color="error">
                    {errors[`license_status`]}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="issue_date" sx={{ fontWeight: 600 }}>
                Issue Date <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`issue_date`]}>
                <DatePicker
                  label="Issue Date *"
                  value={
                    formData.issue_date ? new Date(formData.issue_date) : null
                  }
                  onChange={(date) =>
                    handleChange(
                      "issue_date",
                      date ? format(date, "yyyy-MM-dd") : null
                    )
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`issue_date`],
                      helperText: errors[`issue_date`],
                    },
                  }}
                />
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="expiry_date" sx={{ fontWeight: 600 }}>
                Expiry Date <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`expiry_date`]}>
                <DatePicker
                  label="Expiry Date *"
                  value={
                    formData.expiry_date ? new Date(formData.expiry_date) : null
                  }
                  onChange={(date) =>
                    handleChange(
                      "expiry_date",
                      date ? format(date, "yyyy-MM-dd") : null
                    )
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`expiry_date`],
                      helperText: errors[`expiry_date`],
                    },
                  }}
                />
              </FormControl>
            </Box>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="renewal_date" sx={{ fontWeight: 600 }}>
                Renewal Date <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth>
                <DatePicker
                  label="Renewal Date"
                  value={
                    formData.renewal_date
                      ? new Date(formData.renewal_date)
                      : null
                  }
                  onChange={(date) =>
                    handleChange(
                      "renewal_date",
                      date ? format(date, "yyyy-MM-dd") : null
                    )
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </FormControl>
            </Box>
          </div>

          {/* Transfer List for License Ratings */}
          <TransferList
            licenseRating={formData.license_rating}
            onRatingChange={(ratingString) =>
              handleChange("license_rating", ratingString)
            }
          />

          <div className="mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="license-upload" sx={{ fontWeight: 600 }}>
                License Upload
              </InputLabel>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                onClick={() =>
                  document.getElementById(`license-upload`)?.click()
                }
              >
                <input
                  type="file"
                  id={`license-upload`}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />

                {formData.license_upload ? (
                  <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
                    <div className="flex items-center">
                      <FileText className="text-blue-500 mr-2" size={20} />
                      <Typography
                        component="a"
                        href={
                          typeof formData.license_upload === "string"
                            ? `${certificateUrl}${formData.license_upload}`
                            : URL.createObjectURL(formData.license_upload) // preview for new upload
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-medium hover:underline"
                      >
                        {typeof formData.license_upload === "string"
                          ? formData.license_upload.split("/").pop()
                          : formData.license_upload.name || "Not named"}
                      </Typography>
                    </div>
                    <IconButton
                      onClick={handleRemoveFile}
                      size="small"
                      className="!text-red-500"
                    >
                      <X size={16} />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500">Upload Certificate</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG up to 5MB
                    </p>
                  </>
                )}
              </div>
            </Box>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </div>
        </LocalizationProvider>
      </form>
      <Snackbar
        open={!!fileError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          className="flex items-center"
        >
          {fileError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LicenseForm;
