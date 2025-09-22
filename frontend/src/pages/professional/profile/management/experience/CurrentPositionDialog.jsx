import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import professionalProfileApi from "../../../../../api/professionalProfile";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import CheckBoxCard from "../../wizard/CheckBoxCard";
import { aviationSpecializations } from "../../components/dropDownData";
import { RequiredAsterisk } from "../../components/RequiredAsterisk";
import { X } from "lucide-react";

const CurrentPositionDialog = ({
  open,
  onClose,
  data,
  onSave,
  setNotification,
}) => {
  const [formData, setFormData] = useState(
    data || {
      current_job_title: "",
      years_of_experience: "",
      aviation_specialization: "",
    }
  );

  const [errors, setErrors] = useState({});

  const [selectedSpecializations, setSelectedSpecializations] = useState(
    data?.aviation_specialization
      ? data.aviation_specialization.split(", ")
      : []
  );

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.current_job_title?.trim()) {
      newErrors.current_job_title = "Current job title is required";
      valid = false;
    }
    if (!formData.years_of_experience) {
      newErrors.years_of_experience = "Years of experience is required";
      valid = false;
    }
    if (!formData.aviation_specialization?.trim()) {
      newErrors.aviation_specialization =
        "At least one specialization is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await professionalProfileApi.updateProfessionalProfile({
          experience: formData,
        });
        //   onSave(formData); // update parent state
        if (res.status === 200) {
          onClose();
          onSave();
          setNotification("Profile updated successfully", "success");
        }
        //   onClose();
      } catch (error) {
        setNotification("Failed to update profile. Please try again.", "error");
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSpecializationChange = (specialization, isChecked) => {
    const updatedSpecializations = isChecked
      ? [...selectedSpecializations, specialization]
      : selectedSpecializations.filter((item) => item !== specialization);

    setSelectedSpecializations(updatedSpecializations);

    const specializationString = updatedSpecializations.join(", ");
    setFormData((prev) => ({
      ...prev,
      aviation_specialization: specializationString,
    }));

    if (errors.aviation_specialization) {
      setErrors((prev) => ({ ...prev, aviation_specialization: undefined }));
    }
  };

  const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Edit Current Position
        </Typography>
    </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <X />
      </IconButton>
      <DialogContent dividers>
        <form className="my-2 py-2">
          <Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <InputLabel
                    htmlFor="current_job_title"
                    sx={{ fontWeight: 600 }}
                  >
                    Current Job Title <RequiredAsterisk />
                  </InputLabel>
                  <TextField
                    id="current_job_title"
                    name="current_job_title"
                    fullWidth
                    variant="outlined"
                    placeholder="e.g Commercial Pilot"
                    value={formData.current_job_title}
                    onChange={(e) =>
                      handleChange("current_job_title", e.target.value)
                    }
                    error={!!errors.current_job_title}
                    helperText={errors.current_job_title}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <InputLabel
                    htmlFor="years_of_experience"
                    sx={{ fontWeight: 600 }}
                  >
                    Years of Experience <RequiredAsterisk />
                  </InputLabel>
                  <TextField
                    id="years_of_experience"
                    name="years_of_experience"
                    fullWidth
                    variant="outlined"
                    type="number"
                    slotProps={{ htmlInput: { min: 0, max: 50 } }}
                    value={formData.years_of_experience}
                    onChange={(e) =>
                      handleChange("years_of_experience", e.target.value)
                    }
                    error={!!errors.years_of_experience}
                    helperText={errors.years_of_experience}
                  />
                </Box>
              </Grid>

              <Grid>
                <InputLabel sx={{ fontWeight: 600, mb: 2 }}>
                  Aviation Specializations <RequiredAsterisk />
                </InputLabel>
                <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={2}>
                  {aviationSpecializations.map((specialization, index) => (
                    <Grid size={{ xs: 4 }} key={index}>
                      <CheckBoxCard>
                        <FormControlLabel
                          sx={{ px: 1, width: "100%" }}
                          control={
                            <Checkbox
                              checked={selectedSpecializations.includes(
                                specialization
                              )}
                              onChange={(e) =>
                                handleSpecializationChange(
                                  specialization,
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label={specialization}
                        />
                      </CheckBoxCard>
                    </Grid>
                  ))}
                </Grid>
                {errors[`aviation_specialization`] && (
                  <Typography variant="caption" color="error">
                    {errors[`aviation_specialization`]}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CurrentPositionDialog;
