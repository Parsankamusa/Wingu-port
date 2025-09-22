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
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FileText, Upload, X } from "lucide-react";
import { educationLevelOptions } from "../../components/dropDownData";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";

const QualificationForm = ({
  qualification = {},
  onSubmit,
  onCancel,
  certificateUrl = "",
}) => {
  const [formData, setFormData] = useState({
    id: qualification?.id || null,
    // education_level_display: qualification?.education_level_display || "",
    highest_education_level: qualification?.highest_education_level || "",
    course_of_study: qualification?.course_of_study || "",
    institution: qualification?.institution || "",
    expected_graduation_year: qualification?.expected_graduation_year || "",
    aviation_certifications: qualification?.aviation_certifications || "",
    certificate_upload: qualification?.certificate_upload || null,
    gpa: qualification?.gpa || "",
  });

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.highest_education_level?.trim()) {
      newErrors.highest_education_level = "Education level is required";
      valid = false;
    }
    if (!formData.course_of_study) {
      newErrors.course_of_study = "Course of study is required";
      valid = false;
    }
    if (!formData.institution?.trim()) {
      newErrors.institution = "Institution is required";
      valid = false;
    }
    if (!formData.expected_graduation_year?.trim()) {
      newErrors.expected_graduation_year = "Graduation year is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, certificate_upload: null }));
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

    setFormData((prev) => ({ ...prev, certificate_upload: file }));

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviation Category */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel
                  htmlFor="highest_education_level"
                  sx={{ fontWeight: 600 }}
                >
                  Highest Education Level <RequiredAsterisk />
                </InputLabel>
                <FormControl
                  fullWidth
                  error={!!errors[`highest_education_level`]}
                >
                  <InputLabel id={`education-level-label`}>
                    Highest Education Level *
                  </InputLabel>
                  <Select
                    labelId={`education-level-label`}
                    value={formData.highest_education_level}
                    label="Highest Education Level *"
                    id="highest_education_level"
                    onChange={(e) =>
                      handleChange("highest_education_level", e.target.value)
                    }
                  >
                    {educationLevelOptions.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`highest_education_level`] && (
                    <Typography variant="caption" color="error">
                      {errors[`highest_education_level`]}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="course_of_study" sx={{ fontWeight: 600 }}>
                  Course of Study <RequiredAsterisk />
                </InputLabel>

                <FormControl fullWidth error={!!errors[`course_of_study`]}>
                  <input
                    type="text"
                    id="course_of_study"
                    placeholder="Course of Study *"
                    value={formData.course_of_study}
                    onChange={(e) =>
                      handleChange("course_of_study", e.target.value)
                    }
                    className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors["course_of_study"]
                        ? "focus:ring-red-500 border-red-500 focus:border-2"
                        : "focus:ring-blue-500 border-gray-300"
                    } `}
                  />

                  {errors[`course_of_study`] && (
                    <Typography variant="caption" color="error">
                      {errors[`course_of_study`]}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="institution" sx={{ fontWeight: 600 }}>
                  Institution <RequiredAsterisk />
                </InputLabel>
                <FormControl fullWidth error={!!errors[`institution`]}>
                  <input
                    type="text"
                    placeholder="Institution *"
                    id="institution"
                    value={formData.institution}
                    onChange={(e) =>
                      handleChange("institution", e.target.value)
                    }
                    className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors["institution"]
                        ? "focus:ring-red-500 border-red-500 focus:border-2"
                        : "focus:ring-blue-500 border-gray-300"
                    }`}
                  />
                  {errors[`institution`] && (
                    <Typography variant="caption" color="error">
                      {errors[`institution`]}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel
                  htmlFor="expected_graduation_year"
                  sx={{ fontWeight: 600 }}
                >
                  Expected Graduation Year
                </InputLabel>
                <FormControl
                  fullWidth
                  error={!!errors[`expected_graduation_year`]}
                >
                  <input
                    type="text"
                    id="expected_graduation_year"
                    placeholder="2025"
                    value={formData.expected_graduation_year}
                    onChange={(e) =>
                      handleChange("expected_graduation_year", e.target.value)
                    }
                    className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors["expected_graduation_year"]
                        ? "focus:ring-red-500 border-red-500 focus:border-2"
                        : "focus:ring-blue-500 border-gray-300"
                    }`}
                  />
                  {errors[`expected_graduation_year`] && (
                    <Typography variant="caption" color="error">
                      {errors[`expected_graduation_year`]}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </div>

            <Box
              className="mb-4"
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <InputLabel htmlFor="gpa" sx={{ fontWeight: 600 }}>
                GPA
              </InputLabel>
              <FormControl fullWidth>
                <input
                  type="text"
                  id="gpa"
                  placeholder="GPA (e.g., 8.00)"
                  value={formData.gpa}
                  onChange={(e) => handleChange("gpa", e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
            </Box>

            <Box
              className="mb-4"
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <InputLabel
                htmlFor="aviation_certifications"
                sx={{ fontWeight: 600 }}
              >
                Aviation Certifications
              </InputLabel>
              <textarea
                id="aviation_certifications"
                placeholder="Aviation Certifications"
                value={formData.aviation_certifications}
                onChange={(e) =>
                  handleChange("aviation_certifications", e.target.value)
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Box>

            <Box
              className="mb-4"
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <InputLabel htmlFor="certificate-upload" sx={{ fontWeight: 600 }}>
                Certificate Upload
              </InputLabel>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                onClick={() =>
                  document.getElementById(`certificate-upload`)?.click()
                }
              >
                <input
                  type="file"
                  id={`certificate-upload`}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />

                {formData.certificate_upload ? (
                  <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
                    <div className="flex items-center">
                      <FileText className="text-blue-500 mr-2" size={20} />
                      <Typography
                        component="a"
                        href={
                          typeof formData.certificate_upload === "string"
                            ? `${certificateUrl}${formData.certificate_upload}`
                            : URL.createObjectURL(formData.certificate_upload) // preview for new upload
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-medium hover:underline"
                      >
                        {typeof formData.certificate_upload === "string"
                          ? formData.certificate_upload.split("/").pop()
                          : formData.certificate_upload.name || "Not named"}
                      </Typography>
                    </div>
                    <IconButton
                      onClick={(e) => handleRemoveFile(e)}
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
        </LocalizationProvider>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
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
    </>
  );
};

export default QualificationForm;
