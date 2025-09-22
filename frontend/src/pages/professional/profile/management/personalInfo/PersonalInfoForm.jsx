import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextareaAutosize,
  TextField,
} from "@mui/material";
import { useState } from "react";

import {
  availabilityOptions,
  languageOptions,
} from "../../components/dropDownData";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";
import ProfilePhotoUpload from "../../wizard/ProfilePhotoUpload";

const PersonalInfoForm = ({ data, onSave, onCancel, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    // top-level
    full_name: data.full_name,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    profile_picture: data.profile_picture || null,

    // nested personal_info
    phone_number: data.personal_info?.phone_number || "",
    date_of_birth: data.personal_info?.date_of_birth || "",
    nationality: data.personal_info?.nationality || "",
    national_id: data.personal_info?.national_id || "",
    city: data.personal_info?.city || "",
    country: data.personal_info?.country || "",
    language: data.personal_info?.language || "",
    availability: data.personal_info?.availability || "",
    willing_to_relocate: data.personal_info?.willing_to_relocate || false,
    preferred_work_regions: data.personal_info?.preferred_work_regions || "",
    professional_bio: data.personal_info?.professional_bio || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    handleChange(field, checked);
  };

  const validateForm = () => {
    let valid = true;
    // let newErrors = {};
    const personalInfo = formData;
    if (!personalInfo.full_name?.trim()) {
      setErrors((prev) => ({
        ...prev,
        first_name: "Name is required",
      }));
      valid = false;
    }
    //   if (!personalInfo.last_name?.trim()) {
    //     setErrors((prev) => ({ ...prev, last_name: "Last name is required" }));
    //     valid = false;
    //   }
    if (!personalInfo.phone_number?.trim()) {
      setErrors((prev) => ({
        ...prev,
        phone_number: "Phone number is required",
      }));
      valid = false;
    }
    if (!personalInfo.date_of_birth) {
      setErrors((prev) => ({
        ...prev,
        date_of_birth: "Date of birth is required",
      }));
      valid = false;
    }

    if (!personalInfo.nationality?.trim()) {
      setErrors((prev) => ({
        ...prev,
        nationality: "Nationality is required",
      }));
      valid = false;
    }

    if (!personalInfo.national_id?.trim()) {
      setErrors((prev) => ({
        ...prev,
        national_id: "National ID is required",
      }));
      valid = false;
    }

    if (!personalInfo.city?.trim()) {
      setErrors((prev) => ({ ...prev, city: "City is required" }));
      valid = false;
    }

    if (!personalInfo.country?.trim()) {
      setErrors((prev) => ({ ...prev, country: "Country is required" }));
      valid = false;
    }

    if (!personalInfo.language?.trim()) {
      setErrors((prev) => ({ ...prev, language: "Language is required" }));
      valid = false;
    }

    if (!personalInfo.availability?.trim()) {
      setErrors((prev) => ({
        ...prev,
        availability: "Availability is required",
      }));
      valid = false;
    }
    return valid;
  };

  const getFirstAndLastName = (fullname) => {
    const nameArray = fullname.split(" ");
    const [firstname, ...rest] = nameArray;
    const lastname = rest.join(" ");

    return [firstname, lastname];
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        // profile_picture: formData.profile_picture,
        personal_info: {
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          nationality: formData.nationality,
          national_id: formData.national_id,
          city: formData.city,
          country: formData.country,
          language: formData.language,
          availability: formData.availability,
          willing_to_relocate: formData.willing_to_relocate,
          preferred_work_regions: formData.preferred_work_regions,
          professional_bio: formData.professional_bio,
        },
      };
      onSave(payload);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            px: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <ProfilePhotoUpload formData={formData} setFormData={setFormData} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="full_name" sx={{ fontWeight: 600 }}>
                  Full Name <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="full_name"
                  fullWidth
                  variant="outlined"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="email" sx={{ fontWeight: 600 }}>
                  Email <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="email"
                  fullWidth
                  variant="outlined"
                  value={formData.email}
                  disabled
                  // onChange={(e) => handleChange("last_name", e.target.value)}
                  // error={!!errors.last_name}
                  // helperText={errors.last_name}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="phone_number" sx={{ fontWeight: 600 }}>
                  Phone Number <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="phone_number"
                  fullWidth
                  variant="outlined"
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="date_of_birth" sx={{ fontWeight: 600 }}>
                  Date of Birth <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="date_of_birth"
                  fullWidth
                  variant="outlined"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleChange("date_of_birth", e.target.value)
                  }
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="nationality" sx={{ fontWeight: 600 }}>
                  Nationality <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="nationality"
                  fullWidth
                  variant="outlined"
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  error={!!errors.nationality}
                  helperText={errors.nationality}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="national_id" sx={{ fontWeight: 600 }}>
                  National ID <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="national_id"
                  fullWidth
                  variant="outlined"
                  value={formData.national_id}
                  onChange={(e) => handleChange("national_id", e.target.value)}
                  error={!!errors.national_id}
                  helperText={errors.national_id}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="city" sx={{ fontWeight: 600 }}>
                  City <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="city"
                  fullWidth
                  variant="outlined"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="country" sx={{ fontWeight: 600 }}>
                  Country <RequiredAsterisk />
                </InputLabel>
                <TextField
                  id="country"
                  fullWidth
                  variant="outlined"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  error={!!errors.country}
                  helperText={errors.country}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="language" sx={{ fontWeight: 600 }}>
                  Language <RequiredAsterisk />
                </InputLabel>
                <FormControl fullWidth error={!!errors.language}>
                  <Select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    displayEmpty
                  >
                    {/* <MenuItem value="">
                    <em>Select Language</em>
                  </MenuItem> */}
                    {languageOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.language && (
                    <FormHelperText error>{errors.language}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="availability" sx={{ fontWeight: 600 }}>
                  Availability <RequiredAsterisk />
                </InputLabel>
                <FormControl fullWidth error={!!errors.availability}>
                  <Select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) =>
                      handleChange("availability", e.target.value)
                    }
                    displayEmpty
                  >
                    {/* <MenuItem value="">
                    <em>Availability status</em>
                  </MenuItem> */}
                    {availabilityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.availability && (
                    <FormHelperText error>{errors.availability}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.willing_to_relocate || false}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "willing_to_relocate",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Willing to Relocate"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel
                  htmlFor="preferred_work_regions"
                  sx={{ fontWeight: 600 }}
                >
                  Preferred work regions
                </InputLabel>
                <TextareaAutosize
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 5,
                    fontSize: 16,
                  }}
                  placeholder="Preferred regions for work opportunities (comma-separated)"
                  id="preferred_work_regions"
                  minRows={3}
                  value={formData.preferred_work_regions || ""}
                  onChange={(e) =>
                    handleChange("preferred_work_regions", e.target.value)
                  }
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputLabel htmlFor="professional_bio" sx={{ fontWeight: 600 }}>
                  Professional Bio
                </InputLabel>
                <TextareaAutosize
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 5,
                    fontSize: 16,
                  }}
                  placeholder="Tell us about your aviation background and career goals..."
                  id="professional_bio"
                  minRows={3}
                  value={formData.professional_bio || ""}
                  onChange={(e) =>
                    handleChange("professional_bio", e.target.value)
                  }
                />
              </Box>
              <FormHelperText>
                This will be visible to potential employers
              </FormHelperText>
            </Grid>
          </Grid>
        </Box>
        {isEditMode && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </div>
        )}
      </form>
    </Paper>
  );
};

export default PersonalInfoForm;
