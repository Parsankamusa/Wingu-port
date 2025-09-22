import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Typography
} from "@mui/material";
import {
  BadgeCheck,
  Briefcase,
  Building,
  CalendarClock,
  Pencil,
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import professionalProfileApi from "../../../../../api/professionalProfile";
import EmptyStateCard from "../components/EmptyStateCard";
import Modal from "../components/Modal";
import ProfessionalRoleForm from "./ProfessionalRoleForm";

const ProfessionalRoleTab = ({ roles, onModification, setNotification }) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleOpen = (role = null) => {
    setSelectedRole(role);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedRole(null);
    setOpen(false);
  };

  const dialogTitle = selectedRole ? "Edit Role" : "Add Role"

  const handleSave = async (data) => {
    try {
      if (selectedRole) {
        const res = await professionalProfileApi.updateSingleResource(
          data.id,
          "professional-role",
          data
        );
        if (res.status === 200) {
          onModification();
          setNotification("Profile updated successfully", "success");
        }
      } else {
        const payload = { ...data };
        delete payload.id;
        const res = await professionalProfileApi.updateProfessionalProfile({
          professional_roles: [payload],
        });
        if (res.status === 200 || res.status === 201) {
          onModification();
          setNotification("Professional role saved successfully", "success");
        }
      }
      handleClose();
    } catch (error) {
      console.error(error);
      setNotification("An error occurred while updating the form", "error");
      handleClose();
    }
  };

  console.log("open", open)
  return (
    <div>
      {/* Header with Add Button */}

      {roles?.length === 0 ? (
        <EmptyStateCard
          icon={<Briefcase size={48} color="#1976d2" />}
          title="No professional roles added yet"
          description="Add your aviation roles, job titles, aircraft experience, and regulatory details to highlight your expertise and qualifications."
          buttonText="Add Role"
          handleOpen={handleOpen}
        />
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
            <Typography variant="h6">Professional Roles</Typography>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              color="primary"
              onClick={() => handleOpen()}
            >
              Add Role
            </Button>
          </Box>

          {/* Role List */}
          <Grid container spacing={3}>
            {roles.map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={role.id}>
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
                    {/* Category display */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {role.aviation_category_display}
                    </Typography>

                    {/* Title as subtitle */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Briefcase size={16} style={{ marginRight: 8 }} />
                      <Typography variant="subtitle1" color="text.primary">
                        {role.title}
                      </Typography>
                    </Box>

                    {/* Details with icons */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Plane size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        {role.aviation_category} —{" "}
                        {role.aircraft_type_experience}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <BadgeCheck size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        Ratings: {role.icao_type_ratings}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarClock size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        Expiry: {role.icao_ratings_expiry || "Not set"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Building size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        Regulator:{" "}
                        {role.regulatory_body_display || role.regulatory_body}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(role)}
                    >
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton color="error" onClick={() => onDelete(role.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

        </>
      )}
          {/* Add/Edit Dialog */}
          <Modal handleClose={handleClose} open={open} title={dialogTitle}>
            <ProfessionalRoleForm
                role={selectedRole}
                onSubmit={handleSave}
                onCancel={handleClose}
              />
          </Modal>
          
    </div>
  );
};

export default ProfessionalRoleTab;
