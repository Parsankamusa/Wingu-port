import React, { useState } from "react";
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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  aviationCategoryOptions,
  regulatoryBodyOptions,
} from "../components/dropDownData";

const ProfessionalRoleForm = () => {
  const [roles, setRoles] = useState([
    {
      aviation_category: "",
      title: "",
      aircraft_type_experience: "",
      icao_type_ratings: "",
      icao_ratings_expiry: null,
      regulatory_body: "",
    },
  ]);

  const [errors, setErrors] = useState({});

  const aviationCategories = [
    { value: "pilot", label: "Pilot" },
    { value: "cabin_crew", label: "Cabin Crew" },
    { value: "maintenance", label: "Maintenance" },
    { value: "ground_crew", label: "Ground Crew" },
    { value: "air_traffic_controller", label: "Air Traffic Controller" },
    { value: "aviation_management", label: "Aviation Management" },
  ];

  const regulatoryBodies = [
    { value: "kcaa", label: "KCAA (Kenya Civil Aviation Authority)" },
    { value: "faa", label: "FAA (Federal Aviation Administration)" },
    { value: "easa", label: "EASA (European Union Aviation Safety Agency)" },
    { value: "caa", label: "CAA (UK Civil Aviation Authority)" },
    { value: "caac", label: "CAAC (Civil Aviation Administration of China)" },
    { value: "dgc", label: "DGAC (Direction Générale de l'Aviation Civile)" },
  ];

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        aviation_category: "",
        title: "",
        aircraft_type_experience: "",
        icao_type_ratings: "",
        icao_ratings_expiry: null,
        regulatory_body: "",
      },
    ]);
  };

  const handleRemoveRole = (index) => {
    if (roles.length === 1) return; // Don't remove the last role
    const updatedRoles = [...roles];
    updatedRoles.splice(index, 1);
    setRoles(updatedRoles);
  };

  const handleChange = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index][field] = value;
    setRoles(updatedRoles);

    // Clear error when field is updated
    if (errors[`${field}_${index}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`${field}_${index}`];
      setErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    roles.forEach((role, index) => {
      if (!role.aviation_category) {
        newErrors[`aviation_category_${index}`] =
          "Aviation category is required";
      }
      if (!role.title) {
        newErrors[`title_${index}`] = "Title is required";
      }
      if (!role.regulatory_body) {
        newErrors[`regulatory_body_${index}`] = "Regulatory body is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form data:", roles);
      // Here you would typically send the data to your backend
      alert("Professional roles saved successfully!");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-full max-w-2xl mx-auto p-2 bg-white rounded-lg shadow-sm">
        <Alert severity="info" className="mb-6">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              Professional Roles
            </Typography>
            <Typography variant="body2">
              Add your professional aviation roles and certifications. This
              information helps employers understand your qualifications.
            </Typography>
          </Box>
        </Alert>

        <form onSubmit={handleSubmit}>
          {roles.map((role, index) => (
            <div
              key={index}
              className="mb-8 p-4 border border-gray-200 rounded-lg relative"
            >
              {index > 0 && (
                <IconButton
                  onClick={() => handleRemoveRole(index)}
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
                Role #{index + 1}
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl
                  fullWidth
                  error={!!errors[`aviation_category_${index}`]}
                >
                  <InputLabel id={`aviation-category-label-${index}`}>
                    Aviation Category *
                  </InputLabel>
                  <Select
                    labelId={`aviation-category-label-${index}`}
                    value={role.aviation_category}
                    label="Aviation Category *"
                    onChange={(e) =>
                      handleChange(index, "aviation_category", e.target.value)
                    }
                  >
                    {aviationCategoryOptions.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`aviation_category_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`aviation_category_${index}`]}
                    </Typography>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  error={!!errors[`regulatory_body_${index}`]}
                >
                  <InputLabel id={`regulatory-body-label-${index}`}>
                    Regulatory Body *
                  </InputLabel>
                  <Select
                    labelId={`regulatory-body-label-${index}`}
                    value={role.regulatory_body}
                    label="Regulatory Body *"
                    onChange={(e) =>
                      handleChange(index, "regulatory_body", e.target.value)
                    }
                  >
                    {regulatoryBodyOptions.map((body) => (
                      <MenuItem key={body.value} value={body.value}>
                        {body.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`regulatory_body_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`regulatory_body_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="mb-4">
                <FormControl fullWidth error={!!errors[`title_${index}`]}>
                  {/* <InputLabel id={`title-label-${index}`}>Professional Title *</InputLabel> */}
                  {/* <Select
                    labelId={`title-label-${index}`}
                    value={role.title}
                    label="Professional Title *"
                    onChange={(e) => handleChange(index, "title", e.target.value)}
                  >
                    <MenuItem value="captain">Captain</MenuItem>
                    <MenuItem value="first_officer">First Officer</MenuItem>
                    <MenuItem value="second_officer">Second Officer</MenuItem>
                    <MenuItem value="flight_engineer">Flight Engineer</MenuItem>
                    <MenuItem value="flight_attendant">Flight Attendant</MenuItem>
                    <MenuItem value="purser">Purser</MenuItem>
                    <MenuItem value="maintenance_engineer">Maintenance Engineer</MenuItem>
                    <MenuItem value="aviation_technician">Aviation Technician</MenuItem>
                    <MenuItem value="air_traffic_controller">Air Traffic Controller</MenuItem>
                    <MenuItem value="operations_manager">Operations Manager</MenuItem>
                  </Select> */}
                  <input
                    type="text"
                    labelId={`title-label-${index}`}
                    label="Professional Title *"
                    placeholder="Rank/Title (E.g., Captain, First Officer, A&P Technician, etc.)"
                    value={role.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`title_${index}`] && (
                    <Typography variant="caption" color="error">
                      {errors[`title_${index}`]}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth>
                  <input
                    type="number"
                    min={0}
                    placeholder="ICAO Type Ratings"
                    value={role.icao_type_ratings}
                    onChange={(e) =>
                      handleChange(index, "icao_type_ratings", e.target.value)
                    }
                    className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>

                <div>
                  <DatePicker
                    label="ICAO Ratings Expiry Date"
                    value={role.icao_ratings_expiry}
                    onChange={(date) =>
                      handleChange(index, "icao_ratings_expiry", date)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </div>
              </div>
              <FormControl fullWidth>
                <textarea
                  type="text"
                  placeholder="Aircraft Type Experience (e.g., Boeing 737, Airbus A320)"
                  value={role.aircraft_type_experience}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "aircraft_type_experience",
                      e.target.value
                    )
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleAddRole}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <Plus size={18} className="mr-1" />
              <span>Add Another Role</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Save Professional Roles
            </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
};

export default ProfessionalRoleForm;
