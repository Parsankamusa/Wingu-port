import React, { useState } from "react";
import {
  Plus,
  X,
  Trash2,
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import {
  Alert,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Divider,
  ListItemIcon,
  Checkbox,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  licenseTypeOptions,
  regulatoryBodyOptions,
} from "../../components/dropDownData";

// License rating options
export const licenseRatingOptions = [
  { label: "Instrument Rating", value: "instrument" },
  { label: "Type Rating", value: "type" },
  { label: "Multi-Engine Rating", value: "multi_engine" },
  { label: "Instructor Rating", value: "instructor" },
  { label: "Night Rating", value: "night" },
  { label: "IFR Rating", value: "ifr" },
  { label: "VFR Rating", value: "vfr" },
  { label: "Other", value: "other" },
];

const LicenseForm = () => {
  const [licenses, setLicenses] = useState([
    {
      license_status_display: "",
      license_upload: null,
      license_type: "",
      issue_authority: "",
      license_number: "",
      issue_date: null,
      license_rating: "",
      expiry_date: null,
      license_status: "",
      renewal_date: null,
    },
  ]);

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const licenseStatuses = [
    { value: "active", display: "Active" },
    { value: "expired", display: "Expired" },
    { value: "suspended", display: "Suspended" },
    { value: "revoked", display: "Revoked" },
    { value: "pending", display: "Pending" },
  ];

  const handleAddLicense = () => {
    setLicenses([
      ...licenses,
      {
        license_status_display: "",
        license_upload: null,
        license_type: "",
        issue_authority: "",
        license_number: "",
        issue_date: null,
        license_rating: "",
        expiry_date: null,
        license_status: "",
        renewal_date: null,
      },
    ]);
  };

  const handleRemoveLicense = (index) => {
    if (licenses.length === 1) return;
    const updatedLicenses = [...licenses];
    updatedLicenses.splice(index, 1);
    setLicenses(updatedLicenses);
  };

  const handleChange = (index, field, value) => {
    const updatedLicenses = [...licenses];
    updatedLicenses[index][field] = value;

    // Update display value when license status changes
    if (field === "license_status") {
      const selectedStatus = licenseStatuses.find(
        (status) => status.value === value
      );
      updatedLicenses[index].license_status_display = selectedStatus
        ? selectedStatus.display
        : "";
    }

    setLicenses(updatedLicenses);

    // Clear error when field is updated
    if (errors[`${field}_${index}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`${field}_${index}`];
      setErrors(updatedErrors);
    }
  };

  // For the transfer list component
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedCurrent, setSelectedCurrent] = useState([]);

  // Transfer list functions
  const getAvailableRatings = (index) => {
    const currentRatings = getSelectedRatings(licenses[index].license_rating);
    return licenseRatingOptions.filter(
      (option) => !currentRatings.includes(option.value)
    );
  };

  const getCurrentRatings = (index) => {
    const currentRatings = getSelectedRatings(licenses[index].license_rating);
    return licenseRatingOptions.filter((option) =>
      currentRatings.includes(option.value)
    );
  };

  const handleToggleAvailable = (index, value) => {
    const currentIndex = selectedAvailable.indexOf(value);
    const newSelected = [...selectedAvailable];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAvailable(newSelected);
  };

  const handleToggleCurrent = (index, value) => {
    const currentIndex = selectedCurrent.indexOf(value);
    const newSelected = [...selectedCurrent];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedCurrent(newSelected);
  };

  const handleAddRatings = (index) => {
    const newRatings = [
      ...getSelectedRatings(licenses[index].license_rating),
      ...selectedAvailable,
    ];
    const ratingString = newRatings.join(", ");
    handleChange(index, "license_rating", ratingString);
    setSelectedAvailable([]);
  };

  const handleAddAllRatings = (index) => {
    const allRatings = licenseRatingOptions.map((option) => option.value);
    const ratingString = allRatings.join(", ");
    handleChange(index, "license_rating", ratingString);
    setSelectedAvailable([]);
  };

  const handleRemoveRatings = (index) => {
    const currentRatings = getSelectedRatings(licenses[index].license_rating);
    const newRatings = currentRatings.filter(
      (rating) => !selectedCurrent.includes(rating)
    );
    const ratingString = newRatings.join(", ");
    handleChange(index, "license_rating", ratingString);
    setSelectedCurrent([]);
  };

  const handleRemoveAllRatings = (index) => {
    handleChange(index, "license_rating", "");
    setSelectedCurrent([]);
  };

  // Convert comma-separated string back to array for the multi-select
  const getSelectedRatings = (ratingString) => {
    if (!ratingString) return [];
    return ratingString.split(", ").filter((item) => item.trim() !== "");
  };

  const handleFileUpload = (index, file) => {
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

    const updatedLicenses = [...licenses];
    updatedLicenses[index].license_upload = file;
    setLicenses(updatedLicenses);

    return true;
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    handleFileUpload(index, file);
  };

  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    const updatedLicenses = [...licenses];
    updatedLicenses[index].license_upload = null;
    setLicenses(updatedLicenses);
  };

  const validateForm = () => {
    const newErrors = {};

    licenses.forEach((license, index) => {
      if (!license.license_type) {
        newErrors[`license_type_${index}`] = "License type is required";
      }
      if (!license.issue_authority) {
        newErrors[`issue_authority_${index}`] = "Issue authority is required";
      }
      if (!license.license_number) {
        newErrors[`license_number_${index}`] = "License number is required";
      }
      if (!license.license_status) {
        newErrors[`license_status_${index}`] = "License status is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form data:", licenses);
      // Here you would typically send the data to your backend
      alert("Licenses saved successfully!");
    }
  };

  const handleCloseError = () => {
    setFileError("");
  };

  // Transfer List Component
  const TransferList = ({ index }) => {
    const availableRatings = getAvailableRatings(index);
    const currentRatings = getCurrentRatings(index);

    return (
      <div className="mb-4">
        <Typography
          variant="subtitle2"
          className="!font-medium !text-gray-700 !mb-2"
        >
          License Ratings
        </Typography>

        <div className="flex flex-col md:flex-row items-stretch gap-4">
          {/* Available Ratings */}
          <Card variant="outlined" className="flex-1">
            <CardContent className="p-4">
              <Typography
                variant="subtitle2"
                className="!font-medium !text-gray-700 !mb-2"
              >
                Available Ratings
              </Typography>
              <Divider className="!my-2" />
              <List dense className="max-h-40 overflow-auto">
                {availableRatings.map((rating) => {
                  const isSelected =
                    selectedAvailable.indexOf(rating.value) !== -1;
                  return (
                    <ListItem
                      key={rating.value}
                      button
                      onClick={() => handleToggleAvailable(index, rating.value)}
                      className="!py-1"
                      sx={{
                        backgroundColor: isSelected
                          ? "rgba(25, 118, 210, 0.08)"
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "rgba(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={rating.label} />
                    </ListItem>
                  );
                })}
                {availableRatings.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No ratings available"
                      className="!text-gray-400"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Transfer Buttons */}
          <div className="flex md:flex-col justify-center items-center gap-2 py-4">
            <IconButton
              size="small"
              onClick={() => handleAddRatings(index)}
              disabled={selectedAvailable.length === 0}
              className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
            >
              <ChevronRight size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleAddAllRatings(index)}
              disabled={availableRatings.length === 0}
              className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
            >
              <ChevronsRight size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleRemoveRatings(index)}
              disabled={selectedCurrent.length === 0}
              className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleRemoveAllRatings(index)}
              disabled={currentRatings.length === 0}
              className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
            >
              <ChevronsLeft size={16} />
            </IconButton>
          </div>

          {/* Selected Ratings */}
          <Card variant="outlined" className="flex-1">
            <CardContent className="p-4">
              <Typography
                variant="subtitle2"
                className="!font-medium !text-gray-700 !mb-2"
              >
                Selected Ratings
              </Typography>
              <Divider className="!my-2" />
              <List dense className="max-h-40 overflow-auto">
                {currentRatings.map((rating) => {
                  const isSelected =
                    selectedCurrent.indexOf(rating.value) !== -1;
                  return (
                    <ListItem
                      key={rating.value}
                      button
                      onClick={() => handleToggleCurrent(index, rating.value)}
                      className="!py-1"
                      sx={{
                        backgroundColor: isSelected
                          ? "rgba(25, 118, 210, 0.08)"
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "rgva(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={rating.label} />
                    </ListItem>
                  );
                })}
                {currentRatings.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No ratings selected"
                      className="!text-gray-400"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-full max-w-4xl mx-auto p-2 bg-white rounded-lg shadow-sm">
        <Alert severity="info" className="mb-6">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              Licenses & Certifications
            </Typography>
            <Typography variant="body2">
              Add your aviation licenses and certifications. This information is
              crucial for employers to verify your qualifications.
            </Typography>
          </Box>
        </Alert>

        <form onSubmit={handleSubmit}>
          {licenses.map((license, index) => (
            <div
              key={index}
              className="mb-8 p-6 border border-gray-200 rounded-lg relative"
            >
              {index > 0 && (
                <IconButton
                  onClick={() => handleRemoveLicense(index)}
                  className="!absolute !top-2 !right-2 !text-red-500"
                  size="small"
                >
                  <Trash2 size={16} />
                </IconButton>
              )}

              <Typography
                variant="h6"
                className="!font-medium !text-gray-800 !mb-4"
              >
                License #{index + 1}
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl
                  fullWidth
                  error={!!errors[`license_type_${index}`]}
                >
                  <InputLabel id={`license-type-label-${index}`}>
                    License Type *
                  </InputLabel>
                  <Select
                    labelId={`license-type-label-${index}`}
                    value={license.license_type}
                    label="License Type *"
                    onChange={(e) =>
                      handleChange(index, "license_type", e.target.value)
                    }
                  >
                    {licenseTypeOptions.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`license_type_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`license_type_${index}`]}
                    </Typography>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  error={!!errors[`issue_authority_${index}`]}
                >
                  <InputLabel id={`issue-authority-label-${index}`}>
                    Issue Authority *
                  </InputLabel>
                  <Select
                    labelId={`issue-authority-label-${index}`}
                    value={license.issue_authority}
                    label="Issue Authority *"
                    onChange={(e) =>
                      handleChange(index, "issue_authority", e.target.value)
                    }
                  >
                    {regulatoryBodyOptions.map((authority) => (
                      <MenuItem key={authority.value} value={authority.value}>
                        {authority.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`issue_authority_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`issue_authority_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl
                  fullWidth
                  error={!!errors[`license_number_${index}`]}
                >
                  <input
                    type="text"
                    placeholder="License Number *"
                    value={license.license_number}
                    onChange={(e) =>
                      handleChange(index, "license_number", e.target.value)
                    }
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`license_number_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`license_number_${index}`]}
                    </Typography>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  error={!!errors[`license_status_${index}`]}
                >
                  <InputLabel id={`license-status-label-${index}`}>
                    License Status *
                  </InputLabel>
                  <Select
                    labelId={`license-status-label-${index}`}
                    value={license.license_status}
                    label="License Status *"
                    onChange={(e) =>
                      handleChange(index, "license_status", e.target.value)
                    }
                  >
                    {licenseStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.display}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`license_status_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`license_status_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth>
                  <DatePicker
                    label="Issue Date"
                    value={license.issue_date}
                    onChange={(date) => handleChange(index, "issue_date", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <DatePicker
                    label="Expiry Date"
                    value={license.expiry_date}
                    onChange={(date) =>
                      handleChange(index, "expiry_date", date)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth>
                  <DatePicker
                    label="Renewal Date"
                    value={license.renewal_date}
                    onChange={(date) =>
                      handleChange(index, "renewal_date", date)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </FormControl>
              </div>

              {/* Transfer List for License Ratings */}
              <TransferList index={index} />

              <div className="mb-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                  onClick={() =>
                    document.getElementById(`license-upload-${index}`)?.click()
                  }
                >
                  <input
                    type="file"
                    id={`license-upload-${index}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(index, e)}
                  />

                  {license.license_upload ? (
                    <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
                      <div className="flex items-center">
                        <FileText className="text-blue-500 mr-2" size={20} />
                        <span className="text-blue-700 font-medium">
                          {license.license_upload.name}
                        </span>
                      </div>
                      <IconButton
                        onClick={(e) => handleRemoveFile(index, e)}
                        size="small"
                        className="!text-red-500"
                      >
                        <X size={16} />
                      </IconButton>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="mx-auto text-gray-400 mb-2"
                        size={24}
                      />
                      <p className="text-gray-500">Upload License Document</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleAddLicense}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <Plus size={18} className="mr-1" />
              <span>Add Another License</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Save Licenses
            </button>
          </div>
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
      </div>
    </LocalizationProvider>
  );
};

export default LicenseForm;
