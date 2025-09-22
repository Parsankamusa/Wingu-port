import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
} from "@mui/material";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import {
  availabilityOptions,
  languageOptions,
} from "../components/dropDownData";
import { RequiredAsterisk } from "./RequiredAsterisk";

const PersonalInfoForm = ({ formData, handleChange }) => {
  return (
    <div>
      <Box
        sx={{
          //   border: "1px solid #e0e0e0",
          //   borderRadius: 2,
          px: 2,
          //   mt: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <ProfilePhotoUpload formData={formData} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="first-name" sx={{ fontWeight: 600 }}>
                First Name <RequiredAsterisk />
              </InputLabel>
              <TextField id="first-name" fullWidth variant="outlined" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="last-name" sx={{ fontWeight: 600 }}>
                Last Name <RequiredAsterisk />
              </InputLabel>
              <TextField id="last-name" fullWidth variant="outlined" />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="phone-number" sx={{ fontWeight: 600 }}>
                Phone Number <RequiredAsterisk />
              </InputLabel>
              <TextField id="phone-number" fullWidth variant="outlined" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="dob" sx={{ fontWeight: 600 }}>
                Date of Birth <RequiredAsterisk />
              </InputLabel>
              <TextField id="dob" fullWidth variant="outlined" type="date" />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="nationality" sx={{ fontWeight: 600 }}>
                Nationality <RequiredAsterisk />
              </InputLabel>
              <TextField id="nationality" fullWidth variant="outlined" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="national-id" sx={{ fontWeight: 600 }}>
                National ID <RequiredAsterisk />
              </InputLabel>
              <TextField id="national-id" fullWidth variant="outlined" />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="city" sx={{ fontWeight: 600 }}>
                City <RequiredAsterisk />
              </InputLabel>
              <TextField id="city" fullWidth variant="outlined" />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="country" sx={{ fontWeight: 600 }}>
                Country <RequiredAsterisk />
              </InputLabel>
              <TextField id="country" fullWidth variant="outlined" />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="language" sx={{ fontWeight: 600 }}>
                Language <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  // labelId="demo-simple-select-label"
                  id="language"
                  // value={age}
                  // label="Language"
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" selected>
                    <em>Select Language</em>
                  </MenuItem>
                  {languageOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="availability" sx={{ fontWeight: 600 }}>
                Availability <RequiredAsterisk />
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  // labelId="demo-simple-select-label"
                  id="availability"
                  // value={age}
                  // label="Language"
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" selected>
                    <em>Availability status</em>
                  </MenuItem>
                  {availabilityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={false}
                  //   onChange={(e) =>
                  //     handleChange({
                  //       target: { name: "willing_to_relocate", value: e.target.checked },
                  //     })
                  //   }
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
                // multiline
                id="preferred_work_regions"
                minRows={3}
                name="preferred_work_regions"
                // value={formData.professional_bio || ""}
                onChange={handleChange}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="bio" sx={{ fontWeight: 600 }}>
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
                placeholder="Tell us about your aviation background and creer goals..."
                // multiline
                id="bio"
                minRows={3}
                name="professional_bio"
                // value={formData.professional_bio || ""}
                onChange={handleChange}
              />
            </Box>
            <FormHelperText>
              This will be visible to potential employers
            </FormHelperText>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default PersonalInfoForm;
