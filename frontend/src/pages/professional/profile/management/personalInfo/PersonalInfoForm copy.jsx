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
import { availabilityOptions, languageOptions } from "../../components/dropDownData";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";

// import ProfilePhotoUpload from "./ProfilePhotoUpload";

const PersonalInfoForm = ({ data, onSave, onCancel, isEditMode=false }) => {
  const [formData, setFormData] = useState({
    first_name: data.first_name || "",
    last_name: data.last_name ||"",
    phone_number: data.phone_number || "",
    date_of_birth: data.date_of_birth || "",
    nationality: data.nationality || "",
    national_id: data.national_id || "",
    city: data.city || "",
    country: data.country || "",
    language: data.language || "",
    availability: data.availability || "",
    willing_to_relocate: data.willing_to_relocate || false,
    preferred_work_regions: data.preferred_work_regions || "",
    professional_bio: data.professional_bio || ""
  });

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    handleChange(field, checked);
  };

  const validateForm = () => {
    let valid = true;
    // let newErrors = {};
    const personalInfo = formData;
      if (!personalInfo.first_name?.trim()) {
        setErrors((prev) => ({
          ...prev,
          first_name: "First name is required",
        }));
        valid = false;
      }
      if (!personalInfo.last_name?.trim()) {
        setErrors((prev) => ({ ...prev, last_name: "Last name is required" }));
        valid = false;
      }
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
  }

  console.log("personal info errors",errors)

  const handleSubmit = (e) => {
    e.preventDefault()
    if(validateForm()){
        onSave(formData)
    }
  }

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
        {/* <ProfilePhotoUpload formData={formData} onUpdate={(photoData) => {
          // Handle profile photo updates if needed
          console.log("Profile photo updated:", photoData);
        }} /> */}
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="first_name" sx={{ fontWeight: 600 }}>
                First Name <RequiredAsterisk />
              </InputLabel>
              <TextField 
                id="first_name" 
                fullWidth 
                variant="outlined"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="last_name" sx={{ fontWeight: 600 }}>
                Last Name <RequiredAsterisk />
              </InputLabel>
              <TextField 
                id="last_name" 
                fullWidth 
                variant="outlined"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                error={!!errors.last_name}
                helperText={errors.last_name}
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
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
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
                  onChange={(e) => handleChange("availability", e.target.value)}
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
                  onChange={(e) => handleCheckboxChange("willing_to_relocate", e.target.checked)}
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
                onChange={(e) => handleChange("preferred_work_regions", e.target.value)}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12}}>
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
                onChange={(e) => handleChange("professional_bio", e.target.value)}
              />
            </Box>
            <FormHelperText>
              This will be visible to potential employers
            </FormHelperText>
          </Grid>
        </Grid>
        
      </Box>
      <div className="flex justify-end space-x-2 mt-4">
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">
                    Save
                  </Button>
                </div>
    </form>
    </Paper>
  );
};

export default PersonalInfoForm;