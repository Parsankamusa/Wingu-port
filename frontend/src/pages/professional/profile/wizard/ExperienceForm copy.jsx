import React from "react";
import { RequiredAsterisk } from "./RequiredAsterisk";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  TextField,
} from "@mui/material";
import CheckBoxCard from "./CheckBoxCard";
import {
  aviationSpecializations,
  licenseTypeOptions,
} from "../components/dropDownData";

const ExperienceForm = () => {
  return (
    <div>
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="job-title" sx={{ fontWeight: 600 }}>
                Current Job Title <RequiredAsterisk />
              </InputLabel>
              <TextField
                id="job-title"
                fullWidth
                variant="outlined"
                placeholder="e.g Commercial Pilot"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InputLabel htmlFor="year-experience" sx={{ fontWeight: 600 }}>
                Years of Experience <RequiredAsterisk />
              </InputLabel>
              <TextField
                id="year-experience"
                fullWidth
                variant="outlined"
                type="number"
              />
            </Box>
          </Grid>

          <InputLabel htmlFor="year-experience" sx={{ fontWeight: 600 }}>
            Aviation Specializations <RequiredAsterisk />
          </InputLabel>
          <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={2}>
            {aviationSpecializations.map((option, index) => (
              <Grid size={{ xs: 4 }} key={index}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <CheckBoxCard>
                    <FormControlLabel
                      sx={{ px: 1 }}
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
                      label={option}
                    />
                  </CheckBoxCard>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <InputLabel htmlFor="license-rating" sx={{ fontWeight: 600 }}>
              Licenses & Ratings <RequiredAsterisk />
            </InputLabel>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}
            >
              {licenseTypeOptions.map((option, index) => (
                <CheckBoxCard key={index}>
                  <FormControlLabel
                    sx={{ px: 1 }}
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
                    label={option.label}
                  />
                </CheckBoxCard>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default ExperienceForm;
