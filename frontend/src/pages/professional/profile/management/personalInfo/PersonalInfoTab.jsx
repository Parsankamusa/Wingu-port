import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import { Edit } from "lucide-react";
import { useState } from "react";
import professionalProfileApi from "../../../../../api/professionalProfile";
import PersonalInfoForm from "./PersonalInfoForm";

const PersonalInfoTab = ({
  personalInfo,
  additionalData,
  onModification,
  setNotification,
}) => {
  const [isEditing, setIsEditing] = useState(false);


  const toggleEditMode = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (data) => {
    let payload = { ...data };
    // if (payload.profile_picture instanceof File) {
    //   payload.profile_picture = await fileToBase64(payload.profile_picture);
    // }
    try {
      const res = await professionalProfileApi.updateProfessionalProfile(
        payload
      );
      if (res.status === 200) {
        setNotification("Profile updated successfully", "success");
        onModification();
      }
    } catch (error) {
      console.error(error);
      setNotification("Failed to update Personal information", "error");
    }
  };

  const transformString = (text = "") => {
    const transformed = text.replaceAll("_", " ");
    return transformed;
  };

  if (isEditing) {
    return (
      <div>
        <PersonalInfoForm
          data={{ personal_info: personalInfo, ...additionalData }}
          onCancel={handleCancel}
          onSave={handleSave}
          isEditMode={isEditing}
        />
      </div>
    );
  }
  return (
    <Paper elevation={3}
  sx={{
    p: { xs: 2, sm: 4 },
    mt: 3,
    borderRadius: 3,
  }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Personal Information
        </Typography>
        <IconButton onClick={() => setIsEditing(true)}>
          <Edit size={20} />
        </IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>
          <strong>Full Name:</strong> {additionalData.full_name}
        </Typography>
        <Typography>
          <strong>Email:</strong> {additionalData.email}
        </Typography>
        <Typography>
          <strong>Phone:</strong> {personalInfo.phone_number || "Not set"}
        </Typography>
        <Typography>
          <strong>Date of Birth:</strong>{" "}
          {personalInfo.date_of_birth || "Not set"}
        </Typography>
        <Typography>
          <strong>Nationality:</strong> {personalInfo.nationality || "Not set"}
        </Typography>
        <Typography>
          <strong>National ID:</strong> {personalInfo.national_id || "Not set"}
        </Typography>
        <Typography>
          <strong>City:</strong> {personalInfo.city || "Not set"}
        </Typography>
        <Typography>
          <strong>Country:</strong> {personalInfo.country || "Not set"}
        </Typography>
        <Typography>
          <strong>Language:</strong> {personalInfo.language || "Not set"}
        </Typography>
        <Typography>
          <strong>Availability:</strong>{" "}
          {personalInfo.availability
            ? transformString(personalInfo.availability)
            : "Not set"}
        </Typography>
        <Typography>
          <strong>Willing to Relocate:</strong>{" "}
          {personalInfo.willing_to_relocate ? "Yes" : "No"}
        </Typography>
        {personalInfo.preferred_work_regions && (
          <Typography>
            <strong>Preferred Work Regions:</strong>{" "}
            {personalInfo.preferred_work_regions}
          </Typography>
        )}
        {personalInfo.professional_bio && (
          <Typography>
            <strong>Professional Bio:</strong> {personalInfo.professional_bio}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PersonalInfoTab;
