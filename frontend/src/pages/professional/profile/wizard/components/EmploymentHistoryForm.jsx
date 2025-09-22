import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const EmploymentHistoryForm = ({
  data,
  onUpdate,
  onCompletionUpdate,
  errors,
  setErrors,
}) => {
  console.log("e,mployment errors:", errors);
  const [employmentHistory, setEmploymentHistory] = useState(
    data || [
      {
        duration: "",
        company_name: "",
        job_title: "",
        start_date: null,
        end_date: null,
        is_current: false,
        responsibilities: "",
        reason_leaving: "",
      },
    ]
  );

  // Calculate completion percentage
  useEffect(() => {
    const calculateCompletion = () => {
      if (employmentHistory.length === 0) return 0;

      let totalScore = 0;
      let maxScore = 0;

      employmentHistory.forEach((employment) => {
        // Base fields (always required)
        const baseFields = [
          { value: employment.company_name, weight: 1 },
          { value: employment.job_title, weight: 1 },
          { value: employment.start_date, weight: 1 },
          { value: employment.responsibilities, weight: 1 },
        ];

        // Conditional field (end_date only required if not current)
        const conditionalFields = !employment.is_current
          ? [{ value: employment.end_date, weight: 1 }]
          : [];

        // All fields for this employment entry
        const allFields = [...baseFields, ...conditionalFields];

        // Calculate score for this employment entry
        const entryScore = allFields.reduce((score, field) => {
          const isFieldComplete =
            field.value !== null &&
            field.value !== undefined &&
            field.value.toString().trim() !== "";
          return score + (isFieldComplete ? field.weight : 0);
        }, 0);

        const entryMaxScore = allFields.reduce(
          (total, field) => total + field.weight,
          0
        );

        totalScore += entryScore;
        maxScore += entryMaxScore;
      });

      return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    };

    const percentage = calculateCompletion();
    onCompletionUpdate(percentage);
  }, [employmentHistory]);

  const handleAddEmployment = () => {
    const newEmployment = {
      duration: "",
      company_name: "",
      job_title: "",
      start_date: null,
      end_date: null,
      is_current: false,
      responsibilities: "",
      reason_leaving: "",
    };

    const updatedHistory = [...employmentHistory, newEmployment];
    setEmploymentHistory(updatedHistory);
    onUpdate(updatedHistory);
  };

  const handleRemoveEmployment = (index) => {
    if (employmentHistory.length === 1) return;
    const updatedHistory = [...employmentHistory];
    updatedHistory.splice(index, 1);
    setEmploymentHistory(updatedHistory);
    onUpdate(updatedHistory);
  };

  const handleChange = (index, field, value) => {
    const updatedHistory = [...employmentHistory];
    updatedHistory[index][field] = value;

    // Calculate duration if both start and end dates are available
    if (
      (field === "start_date" ||
        field === "end_date" ||
        field === "is_current") &&
      !updatedHistory[index].is_current
    ) {
      const startDate = updatedHistory[index].start_date;
      const endDate = updatedHistory[index].end_date;

      if (startDate && endDate) {
        const duration = calculateDuration(startDate, endDate);
        updatedHistory[index].duration = duration;
      }
    }

    // If current job is checked, clear end date
    if (field === "is_current" && value === true) {
      updatedHistory[index].end_date = null;
      if (updatedHistory[index].start_date) {
        updatedHistory[index].duration =
          calculateDuration(updatedHistory[index].start_date, new Date()) +
          " (current)";
      }
    }

    // If current job is unchecked and there's a start date, recalculate duration
    if (
      field === "is_current" &&
      value === false &&
      updatedHistory[index].start_date
    ) {
      if (updatedHistory[index].end_date) {
        const duration = calculateDuration(
          updatedHistory[index].start_date,
          updatedHistory[index].end_date
        );
        updatedHistory[index].duration = duration;
      } else {
        updatedHistory[index].duration = "";
      }
    }

    setEmploymentHistory(updatedHistory);
    onUpdate(updatedHistory);

    // Clear error when field is updated
    if (errors[`${field}_${index}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`${field}_${index}`];
      setErrors(updatedErrors);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    let totalMonths = years * 12 + months;
    if (end.getDate() < start.getDate()) {
      totalMonths--;
    }

    const calculatedYears = Math.floor(totalMonths / 12);
    const calculatedMonths = totalMonths % 12;

    return `${calculatedYears} years, ${calculatedMonths} months`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-full max-w-4xl mx-auto p-2 bg-white rounded-lg shadow-sm">
        <Alert severity="info" className="mb-6">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              Employment History
            </Typography>
            <Typography variant="body2">
              Add your aviation employment history. This information helps
              employers understand your professional experience and background.
            </Typography>
          </Box>
        </Alert>

        <form>
          {employmentHistory.map((employment, index) => (
            <div
              key={index}
              className="mb-8 p-6 border border-gray-200 rounded-lg relative"
            >
              {index > 0 && (
                <IconButton
                  onClick={() => handleRemoveEmployment(index)}
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
                Employment #{index + 1}
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl
                  fullWidth
                  error={!!errors[`company_name_${index}`]}
                >
                  <input
                    type="text"
                    placeholder="Company Name *"
                    value={employment.company_name}
                    onChange={(e) =>
                      handleChange(index, "company_name", e.target.value)
                    }
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`company_name_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`company_name_${index}`]}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth error={!!errors[`job_title_${index}`]}>
                  <input
                    type="text"
                    placeholder="Job Title *"
                    value={employment.job_title}
                    onChange={(e) =>
                      handleChange(index, "job_title", e.target.value)
                    }
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {errors[`job_title_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`job_title_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth error={!!errors[`start_date_${index}`]}>
                  <DatePicker
                    label="Start Date *"
                    value={employment.start_date}
                    onChange={(date) => handleChange(index, "start_date", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors[`start_date_${index}`],
                        helperText: errors[`start_date_${index}`],
                      },
                    }}
                  />
                </FormControl>

                <FormControl fullWidth error={!!errors[`end_date_${index}`]}>
                  <DatePicker
                    label="End Date *"
                    value={employment.end_date}
                    onChange={(date) => handleChange(index, "end_date", date)}
                    disabled={employment.is_current}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors[`end_date_${index}`],
                        helperText: errors[`end_date_${index}`],
                      },
                    }}
                  />
                </FormControl>
              </div>

              <div className="mb-4">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={employment.is_current}
                      onChange={(e) =>
                        handleChange(index, "is_current", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="This is my current employment"
                />
              </div>

              {employment.duration && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <Typography variant="body2" className="!text-gray-700">
                    <strong>Duration:</strong> {employment.duration}
                  </Typography>
                </div>
              )}

              <div className="mb-4">
                <FormControl
                  fullWidth
                  error={!!errors[`responsibilities_${index}`]}
                >
                  <textarea
                    placeholder="Responsibilities & Achievements *"
                    value={employment.responsibilities}
                    onChange={(e) =>
                      handleChange(index, "responsibilities", e.target.value)
                    }
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`responsibilities_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`responsibilities_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              {!employment.is_current && (
                <div className="mb-4">
                  <FormControl fullWidth>
                    <textarea
                      placeholder="Reason for leaving"
                      value={employment.reason_leaving}
                      onChange={(e) =>
                        handleChange(index, "reason_leaving", e.target.value)
                      }
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleAddEmployment}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <Plus size={18} className="mr-1" />
              <span>Add Another Employment</span>
            </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
};

export default EmploymentHistoryForm;
