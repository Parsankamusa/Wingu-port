import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Award,
  BookOpen,
  Building,
  Calendar,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { fileToBase64 } from "../../../../../api/authService";
import professionalProfileApi from "../../../../../api/professionalProfile";

import EmptyLicenseCard from "./EmptyLicenseCard";

import LicenseForm from "./LicenseForm";
import CertificatePreview from "../qualifications/CertificatePreview";
import Modal from "../components/Modal";

const LicenseTab = ({ licenses, onModification, setNotification }) => {
  const [open, setOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  const handleOpen = (license = null) => {
    setSelectedLicense(license);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedLicense(null);
    setOpen(false);
  };

  const handleSave = async (data) => {
    try {
      let payload = { ...data };

      if (payload.license_upload instanceof File) {
        payload.license_upload = await fileToBase64(payload.license_upload);
      } else if (typeof payload.license_upload === "string") {
        delete payload.license_upload;
      } else if (payload.license_upload === null) {
        payload.license_upload = null;
      }
      if (selectedLicense) {
        console.log(payload);
        const res = await professionalProfileApi.updateSingleResource(
          data.id,
          "license",
          payload
        );
        if (res.status === 200) {
          onModification();
          setNotification("Profile updated successfully", "success");
        }
      } else {
        delete payload.id;
        const res = await professionalProfileApi.updateProfessionalProfile({
          licenses: [payload],
        });
        if (res.status === 200 || res.status === 201) {
          onModification();
          console.log("Add license", data);
          setNotification("Test license add", "success");
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
    console.log("Deleting license", id);
    setNotification("License deleted", "success");
  };

  const licenseFileUrl =
    import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:8000";

  const dialogTitle = selectedLicense ? "Edit License" : "Add License";

  return (
    <div>
      {/* Header with Add Button */}
      {licenses?.length === 0 ? (
        <>
          {/* <TransitionAlert message="Add your educational background and aviation certifications. This information helps employers assess your qualifications." /> */}
          <EmptyLicenseCard handleOpen={handleOpen} />
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
            <Typography variant="h6">Licenses</Typography>
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
            {licenses.map((license) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={license.id}>
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
                    {/* License Type */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Award size={18} style={{ marginRight: 8 }} />
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {license.license_type}
                      </Typography>
                    </Box>

                    {/* License Number */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <FileText size={16} style={{ marginRight: 8 }} />
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
                        Number: {license.license_number}
                      </Typography>
                    </Box>

                    {/* Issue Authority */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Building size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        Authority: {license.issue_authority}
                      </Typography>
                    </Box>

                    {/* Issue Date */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar size={16} style={{ marginRight: 8 }} />
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
                        Issued: {license.issue_date}
                      </Typography>
                    </Box>

                    {/* Expiry Date */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar size={16} style={{ marginRight: 8 }} />
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
                        Expiry: {license.expiry_date}
                      </Typography>
                    </Box>

                    {/* Renewal Date */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar size={16} style={{ marginRight: 8 }} />
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
                        Renewal: {license.renewal_date}
                      </Typography>
                    </Box>

                    {/* Rating */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <GraduationCap size={16} style={{ marginRight: 8 }} />
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
                        Ratings: {license.license_rating}
                      </Typography>
                    </Box>

                    {/* Status */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <BookOpen size={16} style={{ marginRight: 8 }} />
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
                        Status: {license.license_status_display}
                      </Typography>
                    </Box>

                    {/* License Upload */}
                    {license.license_upload && (
                      <CertificatePreview
                        certificateUrl={licenseFileUrl}
                        filePath={license.license_upload}
                      />
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(license)}
                    >
                      <Pencil size={18} />
                    </IconButton>
                    {/* <IconButton
                      color="error"
                      onClick={() => handleDelete(license.id)}
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
        <LicenseForm
          license={selectedLicense}
          onSubmit={handleSave}
          onCancel={handleClose}
          certificateUrl={licenseFileUrl}
        />
      </Modal>
    </div>
  );
};

export default LicenseTab;
