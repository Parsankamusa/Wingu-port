import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";

const EmploymentHistoryForm = ({ employment = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: employment?.id || null,
    duration: employment?.duration || "",
    company_name: employment?.company_name || "",
    job_title: employment?.job_title || "",
    start_date: employment?.start_date || null,
    end_date: employment?.end_date || null,
    is_current: employment?.is_current || false,
    responsibilities: employment?.responsibilities || "",
    reason_leaving: employment?.reason_leaving || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    let newValue = value;

    // Convert date objects to YYYY-MM-DD
    if (value instanceof Date && !isNaN(value)) {
      newValue = format(value, "yyyy-MM-dd");
    }

    setFormData((prev) => ({ ...prev, [field]: newValue }));
    if (field === "is_current" && newValue === true) {
      setFormData((prev) => ({ ...prev, end_date: null }));
    }
    if (Object.keys(errors).length > 0) {
      let updatedErrors = { ...errors };

      // Special case: if is_current is true, remove end_date errors
      if (field === "is_current" && newValue === true) {
        if (updatedErrors["end_date"]) {
          delete updatedErrors["end_date"];
        }
      }

      // Remove error for the field being changed
      if (updatedErrors[field]) {
        delete updatedErrors[field];
      }
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};
    if (!formData.company_name?.trim()) {
      newErrors[`company_name`] = "Company name is required";
      valid = false;
    }
    if (!formData.job_title?.trim()) {
      newErrors[`job_title`] = "Job title is required";
      valid = false;
    }
    if (!formData.start_date?.trim()) {
      newErrors[`start_date`] = "Start date is required";
      valid = false;
    }
    if (!formData.is_current && !formData.end_date?.trim()) {
      newErrors[`end_date`] =
        "End date is required unless this is your current job";
      valid = false;
    }
    if (!formData.responsibilities?.trim()) {
      newErrors[`responsibilities`] = "Responsibilities are required";
      valid = false;
    }

    if (!formData.reason_leaving?.trim()) {
      newErrors[`reason_leaving`] = "Reason(s) for leaving is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
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
              <InputLabel htmlFor="company_name" sx={{ fontWeight: 600 }}>
                Company Name <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`company_name`]}>
                <input
                  type="text"
                  id="company_name"
                  placeholder="Company Name *"
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                    errors["company_name"]
                      ? "focus:ring-red-500 border-red-500 focus:border-2"
                      : "focus:ring-blue-500 border-gray-400"
                  }`}
                />

                {errors[`company_name`] && (
                  <Typography variant="caption" color="error">
                    {errors[`company_name`]}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="job_title" sx={{ fontWeight: 600 }}>
                Job Title <RequiredAsterisk />
              </InputLabel>

              <FormControl fullWidth error={!!errors[`job_title`]}>
                <input
                  type="text"
                  id="job_title"
                  placeholder="Job Title *"
                  value={formData.job_title}
                  onChange={(e) => handleChange("job_title", e.target.value)}
                  className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                    errors["job_title"]
                      ? "focus:ring-red-500 border-red-500 focus:border-2"
                      : "focus:ring-blue-500 border-gray-400"
                  }`}
                />

                {errors[`job_title`] && (
                  <Typography variant="caption" color="error">
                    {errors[`job_title`]}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </div>
          <div className="mb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_current}
                  onChange={(e) => handleChange("is_current", e.target.checked)}
                  color="primary"
                />
              }
              label="This is my current employment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="start_date" sx={{ fontWeight: 600 }}>
                Start Date <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`start_date`]}>
                <DatePicker
                  label="Start Date *"
                  value={
                    formData.start_date ? new Date(formData.start_date) : null
                  }
                  onChange={(date) =>
                    handleChange(
                      "start_date",
                      date ? format(date, "yyyy-MM-dd") : null
                    )
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`start_date`],
                      helperText: errors[`start_date`],
                    },
                  }}
                />
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="end_date" sx={{ fontWeight: 600 }}>
                End Date <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`end_date`]}>
                <DatePicker
                  label="End Date *"
                  value={
                    !formData.is_current && formData.end_date
                      ? new Date(formData.end_date)
                      : null
                  }
                  onChange={(date) =>
                    handleChange(
                      "end_date",
                      date ? format(date, "yyyy-MM-dd") : null
                    )
                  }
                  disabled={formData.is_current}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`end_date`],
                      helperText: errors[`end_date`],
                    },
                  }}
                />
              </FormControl>
            </Box>
          </div>

          {/* {formData.duration && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <Typography variant="body2" className="!text-gray-700">
                <strong>Duration:</strong> {formData.duration}
              </Typography>
            </div>
          )} */}

          <div className="mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="responsibilities" sx={{ fontWeight: 600 }}>
                Responsibilities & Achievements <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`responsibilities`]}>
                <textarea
                  id="responsibilities"
                  placeholder="Responsibilities & Achievements"
                  value={formData.responsibilities}
                  onChange={(e) =>
                    handleChange("responsibilities", e.target.value)
                  }
                  rows={2}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                    errors["responsibilities"]
                      ? "focus:ring-red-500 border-red-500 focus:border-2"
                      : "focus:ring-blue-500 border-gray-400"
                  }`}
                />
                {errors[`responsibilities`] && (
                  <Typography variant="caption" color="error">
                    {errors[`responsibilities`]}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </div>

          <div className="mb-4">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="reason_leaving" sx={{ fontWeight: 600 }}>
                Reason for leaving <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth error={!!errors[`reason_leaving`]}>
                <textarea
                  id="reason_leaving"
                  placeholder="Reason for leaving"
                  value={formData.reason_leaving}
                  onChange={(e) =>
                    handleChange("reason_leaving", e.target.value)
                  }
                  rows={2}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                    errors["reason_leaving"]
                      ? "focus:ring-red-500 border-red-500 focus:border-2"
                      : "focus:ring-blue-500 border-gray-400"
                  }`}
                />
                {errors[`reason_leaving`] && (
                  <Typography variant="caption" color="error">
                    {errors[`reason_leaving`]}
                  </Typography>
                )}
              </FormControl>
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
    </>
  );
};

export default EmploymentHistoryForm;
