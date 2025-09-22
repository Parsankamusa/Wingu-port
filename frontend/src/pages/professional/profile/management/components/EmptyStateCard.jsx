import { Box, Button, Card, Typography } from "@mui/material";
import { Plus } from "lucide-react";

const EmptyStateCard = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  handleOpen 
}) => {
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
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Button
        startIcon={<Plus size={18} />}
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
      >
        {buttonText}
      </Button>
    </Card>
  );
};

export default EmptyStateCard;
