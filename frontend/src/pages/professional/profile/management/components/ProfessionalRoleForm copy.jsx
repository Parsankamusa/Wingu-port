import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { aviationCategoryOptions, regulatoryBodyOptions } from "../../components/dropDownData";

const ProfessionalRoleForm = ({ role = {}, onSubmit, onCancel }) => {
    console.log("Role data in ProfessionalRoleForm:", role);
  const [formData, setFormData] = useState({
    aviation_category: role?.aviation_category || "",
    title: role?.title || "",
    aircraft_type_experience: role?.aircraft_type_experience || "",
    icao_type_ratings: role?.icao_type_ratings || "",
    icao_ratings_expiry: role?.icao_ratings_expiry || null,
    regulatory_body: role?.regulatory_body || "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation here if needed
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Aviation Category */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>

      
      <FormControl fullWidth>
        <InputLabel>Aviation Category</InputLabel>
        <Select
          value={formData.aviation_category}
          onChange={(e) => handleChange("aviation_category", e.target.value)}
        >
          {aviationCategoryOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Regulatory Body */}
      <FormControl fullWidth>
        <InputLabel>Regulatory Body</InputLabel>
        <Select
          value={formData.regulatory_body}
          onChange={(e) => handleChange("regulatory_body", e.target.value)}
        >
          {regulatoryBodyOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Title */}
      <TextField
        fullWidth
        label="Rank/Title"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      {/* ICAO Type Ratings */}
      <TextField
        fullWidth
        label="ICAO Type Ratings"
        value={formData.icao_type_ratings}
        onChange={(e) => handleChange("icao_type_ratings", e.target.value)}
      />

      {/* ICAO Ratings Expiry */}
      <DatePicker
        label="ICAO Ratings Expiry Date"
        value={formData.icao_ratings_expiry}
        onChange={(date) => handleChange("icao_ratings_expiry", date)}
        slotProps={{ textField: { fullWidth: true } }}
      />

      {/* Aircraft Type Experience */}
      <TextField
        fullWidth
        label="Aircraft Type Experience"
        multiline
        rows={3}
        value={formData.aircraft_type_experience}
        onChange={(e) => handleChange("aircraft_type_experience", e.target.value)}
      />

      {/* Buttons */}
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