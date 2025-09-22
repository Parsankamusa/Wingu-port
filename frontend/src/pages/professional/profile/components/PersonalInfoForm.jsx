import React from "react";
import { Grid, TextField, FormControlLabel, Switch, MenuItem } from "@mui/material";

const PersonalInfoForm = ({ formData, handleChange }) => {
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        {/* Phone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Location */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Date of Birth */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            name="date_of_birth"
            InputLabelProps={{ shrink: true }}
            value={formData.date_of_birth || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Nationality */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nationality"
            name="nationality"
            value={formData.nationality || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* National ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="National ID"
            name="national_id"
            value={formData.national_id || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* City */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Country */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Willing to Relocate */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.willing_to_relocate || false}
                onChange={(e) =>
                  handleChange({
                    target: { name: "willing_to_relocate", value: e.target.checked },
                  })
                }
              />
            }
            label="Willing to Relocate"
          />
        </Grid>
        {/* Preferred Work Regions */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Preferred Work Regions"
            name="preferred_work_regions"
            value={formData.preferred_work_regions || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* Language */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Language"
            name="language"
            value={formData.language || ""}
            onChange={handleChange}
          >
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="swahili">Swahili</MenuItem>
            <MenuItem value="french">French</MenuItem>
          </TextField>
        </Grid>
        {/* Availability */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Availability"
            name="availability"
            value={formData.availability || ""}
            onChange={handleChange}
          >
            <MenuItem value="immediately">Immediately</MenuItem>
            <MenuItem value="1_month">1 Month Notice</MenuItem>
            <MenuItem value="2_months">2 Months Notice</MenuItem>
          </TextField>
        </Grid>
        {/* Professional Bio */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Professional Bio"
            name="professional_bio"
            value={formData.professional_bio || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoForm;
