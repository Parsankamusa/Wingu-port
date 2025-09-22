import { Box, Button, Card, Typography } from "@mui/material";
import { GraduationCap, Plus } from "lucide-react";

const EmptyQualificationCard = ({handleOpen}) => {
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
        <GraduationCap size={48} color="#1976d2" />
      </Box>
      <Typography variant="h6" gutterBottom>
        No qualifications added yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your educational background, course of study, and aviation
        certifications to showcase your expertise. This helps employers
        understand your skills and suitability for aviation roles.
      </Typography>
      <Button
        startIcon={<Plus size={18} />}
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
      >
        Add Qualification
      </Button>
    </Card>
  );
};

export default EmptyQualificationCard;
