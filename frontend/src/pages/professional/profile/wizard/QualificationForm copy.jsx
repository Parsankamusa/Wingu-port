import React, { useState } from "react";
import { Plus, X, Trash2, Upload, FileText } from "lucide-react";
import {
  Alert,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar
} from "@mui/material";
import { educationLevelOptions } from "../components/dropDownData";

const QualificationForm = () => {
  const [qualifications, setQualifications] = useState([
    {
      education_level_display: "",
      highest_education_level: "",
      course_of_study: "",
      institution: "",
      expected_graduation_year: "",
      aviation_certifications: "",
      certificate_upload: null,
      gpa: ""
    }
  ]);

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const educationLevels = [
    { value: "high_school", display: "High School" },
    { value: "diploma", display: "Diploma" },
    { value: "associate", display: "Associate Degree" },
    { value: "bachelor", display: "Bachelor's Degree" },
    { value: "master", display: "Master's Degree" },
    { value: "phd", display: "PhD" },
    { value: "other", display: "Other" }
  ];

  const courseOfStudyOptions = [
    "Aviation Management",
    "Pilot Training",
    "Aeronautical Engineering",
    "Aerospace Engineering",
    "Air Traffic Control",
    "Aviation Safety",
    "Aircraft Maintenance",
    "Aviation Electronics",
    "Flight Operations",
    "Aviation Law",
    "Airport Management"
  ];

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleAddQualification = () => {
    setQualifications([
      ...qualifications,
      {
        education_level_display: "",
        highest_education_level: "",
        course_of_study: "",
        institution: "",
        expected_graduation_year: "",
        aviation_certifications: "",
        certificate_upload: null,
        gpa: ""
      }
    ]);
  };

  const handleRemoveQualification = (index) => {
    if (qualifications.length === 1) return;
    const updatedQualifications = [...qualifications];
    updatedQualifications.splice(index, 1);
    setQualifications(updatedQualifications);
  };

  const handleChange = (index, field, value) => {
    const updatedQualifications = [...qualifications];
    updatedQualifications[index][field] = value;
    
    // Update display value when education level changes
    if (field === "highest_education_level") {
      const selectedLevel = educationLevels.find(level => level.value === value);
      updatedQualifications[index].education_level_display = selectedLevel ? selectedLevel.display : "";
    }
    
    setQualifications(updatedQualifications);

    // Clear error when field is updated
    if (errors[`${field}_${index}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`${field}_${index}`];
      setErrors(updatedErrors);
    }
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
    
    const updatedQualifications = [...qualifications];
    updatedQualifications[index].certificate_upload = file;
    setQualifications(updatedQualifications);
    
    return true;
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    handleFileUpload(index, file);
  };

  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    const updatedQualifications = [...qualifications];
    updatedQualifications[index].certificate_upload = null;
    setQualifications(updatedQualifications);
  };

  const validateForm = () => {
    const newErrors = {};
    
    qualifications.forEach((qualification, index) => {
      if (!qualification.highest_education_level) {
        newErrors[`highest_education_level_${index}`] = "Education level is required";
      }
      if (!qualification.course_of_study) {
        newErrors[`course_of_study_${index}`] = "Course of study is required";
      }
      if (!qualification.institution) {
        newErrors[`institution_${index}`] = "Institution is required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form data:", qualifications);
      // Here you would typically send the data to your backend
      alert("Qualifications saved successfully!");
    }
  };

  const handleCloseError = () => {
    setFileError("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 bg-white rounded-lg shadow-sm">
      <Alert severity="info" className="mb-6">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" fontWeight="bold">
            Qualifications
          </Typography>
          <Typography variant="body2">
            Add your educational background and aviation certifications. This information helps employers assess your qualifications.
          </Typography>
        </Box>
      </Alert>

      <form onSubmit={handleSubmit}>
        {qualifications.map((qualification, index) => (
          <div key={index} className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            {index > 0 && (
              <IconButton
                onClick={() => handleRemoveQualification(index)}
                className="!absolute !top-2 !right-2 !text-red-500"
                size="small"
              >
                <Trash2 size={16} />
              </IconButton>
            )}
            
            <Typography variant="h6" className="!font-medium !text-gray-800 !mb-4">
              Qualification #{index + 1}
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormControl fullWidth error={!!errors[`highest_education_level_${index}`]}>
                <InputLabel id={`education-level-label-${index}`}>Highest Education Level *</InputLabel>
                <Select
                  labelId={`education-level-label-${index}`}
                  value={qualification.highest_education_level}
                  label="Highest Education Level *"
                  onChange={(e) => handleChange(index, "highest_education_level", e.target.value)}
                >
                  {educationLevelOptions.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`highest_education_level_${index}`] && (
                  <Typography variant="caption" color="error">
                    {errors[`highest_education_level_${index}`]}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors[`course_of_study_${index}`]}>
                {/* <label htmlFor={`course-of-study-${index}`} className="mb-1 block font-medium text-gray-700">Course of Study</label> */}
                <input
                  type="text"
                  placeholder="Course of Study *"
                  value={qualification.course_of_study}
                  onChange={(e) => handleChange(index, "course_of_study", e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {errors[`course_of_study_${index}`] && (
                  <Typography variant="caption" color="error">
                    {errors[`course_of_study_${index}`]}
                  </Typography>
                )}
              </FormControl>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormControl fullWidth error={!!errors[`institution_${index}`]}>
                <input
                  type="text"
                  placeholder="Institution *"
                  value={qualification.institution}
                  onChange={(e) => handleChange(index, "institution", e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[`institution_${index}`] && (
                  <Typography variant="caption" color="error">
                    {errors[`institution_${index}`]}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id={`graduation-year-label-${index}`}>Expected Graduation Year</InputLabel>
                <Select
                  labelId={`graduation-year-label-${index}`}
                  value={qualification.expected_graduation_year}
                  label="Expected Graduation Year"
                  onChange={(e) => handleChange(index, "expected_graduation_year", e.target.value)}
                >
                  {graduationYears.map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="mb-4">

            <FormControl fullWidth>
                <input
                  type="text"
                  placeholder="GPA (e.g., 8.00)"
                  value={qualification.gpa}
                  onChange={(e) => handleChange(index, "gpa", e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
                  </div>

            <div className="mb-4">
              <textarea
                type="text"
                placeholder="Aviation Certifications"
                value={qualification.aviation_certifications}
                onChange={(e) => handleChange(index, "aviation_certifications", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

              
              <div className="mb-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
                  onClick={() => document.getElementById(`certificate-upload-${index}`)?.click()}
                >
                  <input
                    type="file"
                    id={`certificate-upload-${index}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(index, e)}
                  />

                  {qualification.certificate_upload ? (
                    <div className="flex items-center justify-between bg-blue-50 rounded-md p-3">
                      <div className="flex items-center">
                        <FileText className="text-blue-500 mr-2" size={20} />
                        <span className="text-blue-700 font-medium">
                          {qualification.certificate_upload.name}
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
                      <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-gray-500">Upload Certificate</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            </div> */}
          </div>
        ))}

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleAddQualification}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <Plus size={18} className="mr-1" />
            <span>Add Another Qualification</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Save Qualifications
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
  );
};

export default QualificationForm;