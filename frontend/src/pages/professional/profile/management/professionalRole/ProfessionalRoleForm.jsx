import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  aviationCategoryOptions,
  regulatoryBodyOptions,
} from "../../components/dropDownData";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";

const ProfessionalRoleForm = ({ role = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: role?.id || null,
    aviation_category: role?.aviation_category || "",
    title: role?.title || "",
    aircraft_type_experience: role?.aircraft_type_experience || "",
    icao_type_ratings: role?.icao_type_ratings || "",
    icao_ratings_expiry: role?.icao_ratings_expiry || null,
    regulatory_body: role?.regulatory_body || "",
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }
    if (!formData.aviation_category) {
      newErrors.aviation_category = "Aviation category is required";
      valid = false;
    }
    if (!formData.regulatory_body?.trim()) {
      newErrors.regulatory_body = "Regulatory body is required";
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
    <form onSubmit={handleSubmit} className="space-y-4 my-3">
      {/* Aviation Category */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <InputLabel htmlFor="aviation_category" sx={{ fontWeight: 600 }}>
              Aviation Category <RequiredAsterisk />
            </InputLabel>
            <FormControl fullWidth error={!!errors[`aviation_category`]}>
              <InputLabel id={`aviation-category-label`}>
                Aviation Category *
              </InputLabel>
              <Select
                labelId={`aviation-category-label`}
                value={formData.aviation_category}
                label="Aviation Category *"
                onChange={(e) =>
                  handleChange("aviation_category", e.target.value)
                }
              >
                {aviationCategoryOptions.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              {errors[`aviation_category`] && (
                <Typography variant="caption" color="error">
                  {errors[`aviation_category`]}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <InputLabel htmlFor="regulatory_body" sx={{ fontWeight: 600 }}>
              Regulatory Body <RequiredAsterisk />
            </InputLabel>
            <FormControl fullWidth error={!!errors[`regulatory_body`]}>
              <InputLabel id={`regulatory-body-label`}>
                Regulatory Body *
              </InputLabel>
              <Select
                labelId={`regulatory-body-label`}
                value={formData.regulatory_body}
                label="Regulatory Body *"
                onChange={(e) =>
                  handleChange("regulatory_body", e.target.value)
                }
              >
                {regulatoryBodyOptions.map((body) => (
                  <MenuItem key={body.value} value={body.value}>
                    {body.label}
                  </MenuItem>
                ))}
              </Select>
              {errors[`regulatory_body`] && (
                <Typography variant="caption" color="error">
                  {errors[`regulatory_body`]}
                </Typography>
              )}
            </FormControl>
          </Box>
        </div>

        <div className="mb-4">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <InputLabel htmlFor="title" sx={{ fontWeight: 600 }}>
              Rank/Title <RequiredAsterisk />
            </InputLabel>
            <FormControl fullWidth error={!!errors[`title`]}>
              <input
                id="title"
                type="text"
                placeholder="E.g., Captain, First Officer, A&P Technician, etc."
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  errors["title"]
                    ? "focus:ring-red-500 border-red-500 focus:border-2"
                    : "focus:ring-blue-500 border-gray-400"
                }`}
              />
              {errors[`title`] && (
                <Typography variant="caption" color="error">
                  {errors[`title`]}
                </Typography>
              )}
            </FormControl>
          </Box>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <InputLabel htmlFor="icao_type_ratings" sx={{ fontWeight: 600 }}>
              ICAO Type Ratings
            </InputLabel>
            <FormControl fullWidth>
              <input
                type="text"
                placeholder="78"
                value={formData.icao_type_ratings}
                onChange={(e) =>
                  handleChange("icao_type_ratings", e.target.value)
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <InputLabel htmlFor="icao_ratings_expiry" sx={{ fontWeight: 600 }}>
              ICAO Ratings Expiry Date
            </InputLabel>
            <FormControl fullWidth>
              <DatePicker
                label="Expiry Date"
                value={formData.icao_ratings_expiry}
                onChange={(date) => handleChange("icao_ratings_expiry", date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </FormControl>
          </Box>
        </div>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <InputLabel
            htmlFor="aircraft_type_experience"
            sx={{ fontWeight: 600 }}
          >
            Aircraft Type Experience
          </InputLabel>
          <FormControl fullWidth>
            <textarea
              id="aircraft_type_experience"
              placeholder="e.g., Boeing 737, Airbus A320"
              value={formData.aircraft_type_experience}
              onChange={(e) =>
                handleChange("aircraft_type_experience", e.target.value)
              }
              rows={3}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
        </Box>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </div>
      </LocalizationProvider>
    </form>
  );
};

export default ProfessionalRoleForm;
