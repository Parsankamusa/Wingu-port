import { Box, Button, Card, Typography } from "@mui/material";
import { Award, Plus } from "lucide-react";

const EmptyLicenseCard = ({ handleOpen }) => {
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
        <Award size={48} color="#1976d2" />
      </Box>
      <Typography variant="h6" gutterBottom>
        No licenses added yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your aviation licenses, ratings, and certifications to highlight 
        your professional credentials. This helps employers verify your 
        qualifications and compliance with regulatory requirements.
      </Typography>
      <Button
        startIcon={<Plus size={18} />}
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
      >
        Add License
      </Button>
    </Card>
  );
};

export default EmptyLicenseCard;
