import { Box, Button, Card, Typography } from "@mui/material";
import { Briefcase, Plus } from "lucide-react";

const EmptyEmploymentHistoryCard = ({ handleOpen }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        p: 4,
        textAlign: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Briefcase size={48} color="#1976d2" />
      </Box>
      <Typography variant="h6" gutterBottom>
        No employment history added yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your previous job roles, companies, and duration of employment to
        showcase your work experience. This helps employers understand your
        background and professional journey.
      </Typography>
      <Button
        startIcon={<Plus size={18} />}
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
      >
        Add Employment
      </Button>
    </Card>
  );
};

export default EmptyEmploymentHistoryCard;
