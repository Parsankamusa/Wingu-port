import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  BookOpen,
  Building,
  Calendar,
  Award,
  FileText,
} from "lucide-react";
import QualificationForm from "./QualificationsForm";
import professionalProfileApi from "../../../../../api/professionalProfile";
import CertificatePreview from "./CertificatePreview";
import TransitionAlert from "../components/TransitionAlert";
import EmptyQualificationCard from "./EmptyQualificationCard";
import { fileToBase64 } from "../../../../../api/authService";
import Modal from "../components/Modal";

const QualificationsTab = ({
  qualifications,
  onModification,
  setNotification,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState(null);

  const handleOpen = (qualification = null) => {
    setSelectedQualification(qualification);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedQualification(null);
    setOpen(false);
  };

  const handleSave = async (data) => {
    try {
      let payload = { ...data };

      if (payload.certificate_upload instanceof File) {
        payload.certificate_upload = await fileToBase64(
          payload.certificate_upload
        );
      } else if (typeof payload.certificate_upload === "string") {
        delete payload.certificate_upload;
      } else if (payload.certificate_upload === null) {
        payload.certificate_upload = null;
      }
      if (selectedQualification) {
        console.log(payload);
        const res = await professionalProfileApi.updateSingleResource(
          data.id,
          "qualification",
          payload
        );
        if (res.status === 200) {
          onModification();
          setNotification("Profile updated successfully", "success");
        }
      } else {
        delete payload.id;
        const res = await professionalProfileApi.updateProfessionalProfile({
          qualifications: [payload],
        });
        if (res.status === 200) {
          console.log("Add qualification", data);
          onModification();
          setNotification("Test qualification add", "success");
        }
      }
      handleClose();
    } catch (error) {
      console.error(error);
      setNotification("An error occurred while updating the form", "error");
      handleClose();
    }
  };

  const handleDelete = (id) => {
    // implement delete API call
    console.log("Deleting qualification", id);
    setNotification("Qualification deleted", "success");
  };

  const certificateUrl =
    import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";

  const dialogTitle = selectedQualification
    ? "Edit Qualification"
    : "Add Qualification";

  return (
    <div>
      {/* Header with Add Button */}
      {qualifications?.length === 0 ? (
        <>
          {/* <TransitionAlert message="Add your educational background and aviation certifications. This information helps employers assess your qualifications." /> */}
          <EmptyQualificationCard handleOpen={handleOpen} />
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6">Qualifications</Typography>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              color="primary"
              onClick={() => handleOpen()}
            >
              Add qualification
            </Button>
          </Box>

          {/* Qualification List */}
          <Grid container spacing={3}>
            {qualifications.map((qualification) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={qualification.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "0.2s",
                    "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <CardContent>
                    {/* Education Level */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          flexShrink: 0, // ✅ prevents the icon from shrinking
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <GraduationCap size={18} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        {qualification.education_level_display}
                      </Typography>
                    </Box>

                    {/* Course of Study */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          flexShrink: 0, // ✅ prevents the icon from shrinking
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <BookOpen size={16} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        {qualification.course_of_study}
                      </Typography>
                    </Box>

                    {/* Institution */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          flexShrink: 0, // ✅ prevents the icon from shrinking
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <Building size={16} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        {qualification.institution}
                      </Typography>
                    </Box>

                    {/* Graduation Year */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          flexShrink: 0, // ✅ prevents the icon from shrinking
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <Calendar size={16} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        Graduation: {qualification.expected_graduation_year}
                      </Typography>
                    </Box>

                    {/* Certifications */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <Award size={16} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        {qualification.aviation_certifications}
                      </Typography>
                    </Box>

                    {/* GPA */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                        }}
                      >
                        <FileText size={16} style={{ marginRight: 8 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        GPA: {qualification.gpa}
                      </Typography>
                    </Box>

                    {/* Certificate Upload */}
                    {qualification.certificate_upload && (
                      <CertificatePreview
                        certificateUrl={certificateUrl}
                        filePath={qualification.certificate_upload}
                      />
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(qualification)}
                    >
                      <Pencil size={18} />
                    </IconButton>
                    {/* <IconButton
                  color="error"
                  onClick={() => handleDelete(qualification.id)}
                >
                  <Trash2 size={18} />
                </IconButton> */}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {/* Add/Edit Dialog */}
      <Modal handleClose={handleClose} open={open} title={dialogTitle}>
        <QualificationForm
          qualification={selectedQualification}
          onSubmit={handleSave}
          onCancel={handleClose}
          certificateUrl={certificateUrl}
        />
      </Modal>
    </div>
  );
};

export default QualificationsTab;
