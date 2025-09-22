import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  StyledAccordion,
  StyledDetails,
  StyledSummary,
} from "../../components/Accordion";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  FileBadge,
  GraduationCap,
  Info,
  Plane,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";

const ProfessionalSection = ({ formData, isEditing, onFormChange }) => (
  <div>
    {/* Current Position */}
    {/* <StyledAccordion defaultExpanded>
      <StyledSummary expandIcon={<ChevronDown />}>
        <Briefcase className="mr-2 text-primary-600" />
        Current Position
      </StyledSummary>
      <StyledDetails>
        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Job Title"
                fullWidth
                value={formData.experience.current_job_title || ""}
                onChange={(e) =>
                  onFormChange(
                    "experience",
                    "current_job_title",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Years of Experience"
                type="number"
                fullWidth
                value={formData.experience.years_of_experience || ""}
                onChange={(e) =>
                  onFormChange(
                    "experience",
                    "years_of_experience",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Aviation Specialization"
                fullWidth
                value={formData.experience.aviation_specialization || ""}
                onChange={(e) =>
                  onFormChange(
                    "experience",
                    "aviation_specialization",
                    e.target.value
                  )
                }
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <p>
                <strong>Job Title:</strong>{" "}
                {formData.experience.current_job_title || "Not set"}
              </p>
            </Grid>
            <Grid item xs={12} md={4}>
              <p>
                <strong>Experience:</strong>{" "}
                {formData.experience.years_of_experience
                  ? `${formData.experience.years_of_experience} years`
                  : "Not set"}
              </p>
            </Grid>
            <Grid item xs={12} md={4}>
              <p>
                <strong>Aviation Specialization:</strong>{" "}
                {formData.experience.aviation_specialization || "Not set"}
              </p>
            </Grid>
          </Grid>
        )}
      </StyledDetails>
    </StyledAccordion> */}
    

    {/* Specializations */}
    <StyledAccordion>
      <StyledSummary expandIcon={<ChevronDown />}>
        <GraduationCap className="mr-2 text-primary-600" />
        Specializations
      </StyledSummary>
      <StyledDetails>
        {isEditing ? (
          <TextareaAutosize
            minRows={3}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
            }}
            placeholder="e.g., Commercial Aviation, International Routes"
            value={formData.specialization || ""}
            onChange={(e) =>
              onFormChange(null, "specialization", e.target.value)
            }
          />
        ) : formData.specialization ? (
          formData.specialization
            .split(",")
            .map((spec, index) => (
              <Chip
                key={index}
                label={spec.trim()}
                color="primary"
                variant="outlined"
                className="mr-2 mb-2"
              />
            ))
        ) : (
          <p>Not set</p>
        )}
      </StyledDetails>
    </StyledAccordion>

    {/* Enhanced professional roles */}

    <StyledAccordion defaultExpanded>
      <StyledSummary expandIcon={<ChevronDown />}>
        <FileBadge className="mr-2 text-primary-600" />
        <span className="font-semibold text-lg">Professional Roles</span>
        <Tooltip title="Add your aviation roles with specific certifications and ratings">
          <Info className="w-4 h-4 ml-2 text-gray-400" />
        </Tooltip>
      </StyledSummary>

      <StyledDetails>
        <div className="space-y-6">
          {Array.isArray(formData.professional_roles) &&
          formData.professional_roles.length > 0 ? (
            formData.professional_roles.map((role, index) => (
              <Card
                key={index}
                className="relative overflow-visible border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardHeader
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-primary-100 text-primary-800 px-2.5 py-1.5 rounded-md text-sm font-medium mr-3">
                          Role #{index + 1}
                        </span>
                        <span className="text-lg font-semibold text-gray-800">
                          {role.title || "New Aviation Role"}
                        </span>
                      </div>
                      {isEditing && (
                        <Tooltip title="Remove this role">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              onFormChange(
                                "professional_roles",
                                "remove",
                                index
                              )
                            }
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  }
                  className="pb-3 bg-gray-50/50 border-b"
                />

                <CardContent className="pt-4 flex justify-center">
                  {/* Basic Information Section */}
                  <Box className="px-8 py-6 md:w-[90%]">
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center text-primary-700">
                        <span className="bg-blue-100 p-1.5 rounded-lg mr-3">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </span>
                        Basic Information
                      </h4>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Aviation Category"
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={role.aviation_category || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "aviation_category",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            placeholder="e.g., Flight Operations, Maintenance"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Professional Title"
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={role.title || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "title",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            placeholder="e.g., Senior Pilot, Aircraft Engineer"
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {/* Aircraft Experience Section */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center text-green-700">
                        <span className="bg-green-100 p-1.5 rounded-lg mr-3">
                          <Plane className="w-4 h-4 text-green-600" />
                        </span>
                        Aircraft Experience
                      </h4>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Aircraft Type Experience"
                            fullWidth
                            value={role.aircraft_type_experience || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "aircraft_type_experience",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            placeholder="Boeing 737, Airbus A320, Embraer E190"
                            variant="outlined"
                            size="small"
                            multiline
                            minRows={3}
                            sx={{
                              // '& .MuiOutlinedInput-notchedOutline': {
                              //   border: 'none',
                              // },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                            }}
                          />
                          <FormHelperText className="text-xs text-gray-500 mt-1">
                            Separate aircraft types with commas
                          </FormHelperText>
                        </Grid>
                      </Grid>
                    </div>

                    {/* Certifications Section */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center text-purple-700">
                        <span className="bg-purple-100 p-1.5 rounded-lg mr-3">
                          <FileBadge className="w-4 h-4 text-purple-600" />
                        </span>
                        Certifications & Ratings
                      </h4>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="ICAO Type Ratings"
                            id="outlined-basic"
                            fullWidth
                            value={role.icao_type_ratings || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "icao_type_ratings",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            placeholder="78"
                            variant="outlined"
                            size="small"
                            type="number"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="ICAO Ratings Expiry Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={role.icao_ratings_expiry || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "icao_ratings_expiry",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {/* Regulatory Information */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center text-orange-700">
                        <span className="bg-orange-100 p-1.5 rounded-lg mr-3">
                          <Shield className="w-4 h-4 text-orange-600" />
                        </span>
                        Regulatory Information
                      </h4>
                      <Grid item xs={12}>
                        <FormControl size="small">
                          <InputLabel id="reg-body-label">
                            Regulatory Body
                          </InputLabel>
                          <Select
                            labelId="reg-body-label"
                            id="reg-body"
                            value={role.regulatory_body || ""}
                            onChange={(e) =>
                              onFormChange(
                                "professional_roles",
                                "regulatory_body",
                                e.target.value,
                                index
                              )
                            }
                            disabled={!isEditing}
                            label="Regulatory Body"
                            fullWidth
                            displayEmpty
                          >
                            <MenuItem value="" selected>
                              <em>Select Regulatory Body</em>
                            </MenuItem>
                            <MenuItem value="kcaa">
                              KCAA (Kenya Civil Aviation Authority)
                            </MenuItem>
                            <MenuItem value="faa">
                              FAA (Federal Aviation Administration)
                            </MenuItem>
                            <MenuItem value="easa">
                              EASA (European Union Aviation Safety Agency)
                            </MenuItem>
                            <MenuItem value="caa">
                              CAA UK (Civil Aviation Authority)
                            </MenuItem>
                            <MenuItem value="other">
                              Other Regulatory Body
                            </MenuItem>
                          </Select>

                          {role.regulatory_body === "other" && (
                            <FormHelperText className="text-xs text-gray-500 mt-1">
                              Please specify the regulatory body in the aviation
                              category field
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </div>
                  </Box>
                </CardContent>

                {/* {isEditing && (
              <Box className="p-4 bg-gray-50 border-t">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => onFormChange("professional_roles", "remove", index)}
                  fullWidth
                  className="font-medium"
                >
                  Remove Role
                </Button>
              </Box>
            )} */}
              </Card>
            ))
          ) : (
            <Card
              variant="outlined"
              className="text-center py-6 bg-gray-50/50 border-dashed rounded-xl"
            >
              <CardContent>
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  No Professional Roles Added
                </h3>
                <p className="text-gray-400 mb-4 max-w-md mx-auto">
                  Add your aviation roles to showcase your experience,
                  certifications, and qualifications.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Add new role button */}
          {isEditing && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Plus className="w-5 h-5" />}
              onClick={() =>
                onFormChange("professional_roles", "add", {
                  aviation_category: "",
                  title: "",
                  aircraft_type_experience: "",
                  icao_type_ratings: "",
                  icao_ratings_expiry: "",
                  regulatory_body: "",
                })
              }
              className="py-4 border-dashed hover:border-solid transition-colors rounded-xl font-medium"
              size="large"
              sx={{
                borderWidth: "2px",
                "&:hover": {
                  borderWidth: "2px",
                  backgroundColor: "rgba(59, 130, 246, 0.04)",
                },
              }}
            >
              Add Professional Role
            </Button>
          )}
        </div>
      </StyledDetails>
    </StyledAccordion>

    {/* Qualifications */}
    <StyledAccordion>
      <StyledSummary expandIcon={<ChevronDown />}>
        <BookOpen className="mr-2 text-primary-600" />
        Qualifications
      </StyledSummary>
      <StyledDetails>
        {formData.qualifications?.map((q, index) => (
          <Grid container spacing={2} key={index} className="mb-4">
            <Grid item xs={12} md={6}>
              <TextField
                label="Highest Education Level"
                fullWidth
                value={q.highest_education_level || ""}
                onChange={(e) =>
                  onFormChange(
                    "qualifications",
                    "highest_education_level",
                    e.target.value,
                    index
                  )
                }
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course of Study"
                fullWidth
                value={q.course_of_study || ""}
                onChange={(e) =>
                  onFormChange(
                    `qualifications`,
                    "course_of_study",
                    e.target.value,
                    index
                  )
                }
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        ))}
      </StyledDetails>
    </StyledAccordion>

    {/* Employment History */}
    <StyledAccordion>
      <StyledSummary expandIcon={<ChevronDown />}>
        <Building2 className="mr-2 text-primary-600" />
        Employment History
      </StyledSummary>
      <StyledDetails>
        {formData.employment_history?.map((job, index) => (
          <Grid container spacing={2} key={index} className="mb-4">
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Name"
                fullWidth
                value={job.company_name || ""}
                onChange={(e) =>
                  onFormChange(
                    `employment_history`,
                    "company_name",
                    e.target.value,
                    index
                  )
                }
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Job Title"
                fullWidth
                value={job.job_title || ""}
                onChange={(e) =>
                  onFormChange(
                    `employment_history`,
                    "job_title",
                    e.target.value,
                    index
                  )
                }
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={job.is_current || false}
                    onChange={(e) =>
                      onFormChange(
                        `employment_history`,
                        "is_current",
                        e.target.checked,
                        index
                      )
                    }
                    disabled={!isEditing}
                  />
                }
                label="Currently Working Here"
              />
            </Grid>
          </Grid>
        ))}
      </StyledDetails>
    </StyledAccordion>
  </div>
);

export default ProfessionalSection;
