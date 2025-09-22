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
  Building,
  Briefcase,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import professionalProfileApi from "../../../../../api/professionalProfile";
import EmploymentHistoryForm from "./EmploymentHistoryForm";
import EmptyStateCard from "../components/EmptyStateCard";
import Modal from "../components/Modal";

const EmploymentHistoryTab = ({
  employmentHistories,
  onModification,
  setNotification,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedEmploymentHistory, setSelectedEmploymentHistory] =
    useState(null);

  const handleOpen = (employment = null) => {
    setSelectedEmploymentHistory(employment);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedEmploymentHistory(null);
    setOpen(false);
  };

  const handleSave = async (data) => {
    try {
      let payload = { ...data };

      if (selectedEmploymentHistory) {
        const res = await professionalProfileApi.updateSingleResource(
          data.id,
          "employment-history",
          payload
        );
        if (res.status === 200) {
          onModification();
          setNotification("Employment history updated successfully", "success");
        }
      } else {
        delete payload.id;
        const res = await professionalProfileApi.updateProfessionalProfile({
          employment_history: [payload],
        });
        if (res.status === 200 || res.status === 201) {
          onModification();
          setNotification("Employment history added successfully", "success");
        }
      }
      handleClose();
    } catch (error) {
      console.error(error);
      setNotification(
        "An error occurred while updating employment history",
        "error"
      );
      handleClose();
    }
  };

  const handleDelete = (id) => {
    setNotification("Employment history deleted", "success");
  };

  const dialogTitle = selectedEmploymentHistory
    ? "Edit Employment"
    : "Add Employment";

  return (
    <div>
      {/* Header with Add Button */}
      {employmentHistories?.length === 0 ? (
        <EmptyStateCard
          icon={<Briefcase size={48} color="#1976d2" />}
          title="No employment history added yet"
          description="Add your previous job roles, companies, and duration of employment to
        showcase your work experience. This helps employers understand your
        background and professional journey."
          buttonText="Add Employment"
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
            <Typography variant="h6">Employment History</Typography>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              color="primary"
              onClick={() => handleOpen()}
            >
              Add Employment
            </Button>
          </Box>

          {/* Employment History List */}
          <Grid container spacing={3}>
            {employmentHistories.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
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
                    {/* Company Name */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Building size={18} style={{ marginRight: 8 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        {job.company_name}
                      </Typography>
                    </Box>

                    {/* Job Title */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Briefcase size={16} style={{ marginRight: 8 }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        Title: {job.job_title}
                      </Typography>
                    </Box>

                    {/* Duration */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Clock size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {job.duration}
                      </Typography>
                    </Box>

                    {/* Start Date */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar size={16} style={{ marginRight: 8 }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "400px",
                        }}
                      >
                        Start: {job.start_date}
                      </Typography>
                    </Box>

                    {/* End Date or Current */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Calendar size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.is_current
                          ? "Current Employment"
                          : `End: ${job.end_date}`}
                      </Typography>
                    </Box>

                    {/* Responsibilities */}
                    {job.responsibilities && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <ClipboardList size={16} style={{ marginRight: 8 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "400px",
                          }}
                        >
                          Responsibilities: {job.responsibilities}
                        </Typography>
                      </Box>
                    )}

                    {/* Reason for Leaving */}
                    {job.reason_leaving && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <FileText size={16} style={{ marginRight: 8 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "400px",
                          }}
                        >
                          Reason: {job.reason_leaving}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton color="primary" onClick={() => handleOpen(job)}>
                      <Pencil size={18} />
                    </IconButton>
                    {/* <IconButton
                      color="error"
                      onClick={() => handleDelete(job.id)}
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
        <EmploymentHistoryForm
          onSubmit={handleSave}
          onCancel={handleClose}
          employment={selectedEmploymentHistory}
        />
      </Modal>
    </div>
  );
};

export default EmploymentHistoryTab;
