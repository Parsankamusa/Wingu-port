import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { CheckCircle, FileText, Clock, Check } from "lucide-react";

const ProfileCompletionStep = ({ onPrevious, completionPercentage, documentsUploaded }) => {
  const isProfileComplete = completionPercentage === 100;
  
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      {/* Success Icon */}
      <Box sx={{ mb: 3 }}>
        <CheckCircle size={64} color={isProfileComplete ? "#4caf50" : "#ff9800"} />
      </Box>
      
      {/* Title */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: "text.primary" }}>
        {isProfileComplete ? "Profile Setup Complete!" : "Profile Almost Complete!"}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary", maxWidth: 500, mx: "auto" }}>
        {isProfileComplete 
          ? "Your aviation professional profile has been created successfully."
          : `Your profile is ${completionPercentage}% complete. Please go back and complete all required fields.`
        }
      </Typography>
      
      {/* Divider */}
      <Box sx={{ width: "100%", height: 1, bgcolor: "divider", my: 4 }} />
      
      {/* What happens next section */}
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, textAlign: "left" }}>
        What happens next?
      </Typography>
      
      <Box sx={{ textAlign: "left", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ mr: 2, mt: 0.5, color: isProfileComplete ? "primary.main" : "text.disabled" }}>
            <Check size={20} />
          </Box>
          <Typography variant="body1" color={isProfileComplete ? "text.primary" : "text.disabled"}>
            Our team will review your documents (24-48 hours)
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ mr: 2, mt: 0.5, color: isProfileComplete ? "primary.main" : "text.disabled" }}>
            <Check size={20} />
          </Box>
          <Typography variant="body1" color={isProfileComplete ? "text.primary" : "text.disabled"}>
            You'll receive verification status via email
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ mr: 2, mt: 0.5, color: isProfileComplete ? "primary.main" : "text.disabled" }}>
            <Check size={20} />
          </Box>
          <Typography variant="body1" color={isProfileComplete ? "text.primary" : "text.disabled"}>
            Start applying to exclusive job opportunities
          </Typography>
        </Box>
      </Box>
      
      {/* Divider */}
      <Box sx={{ width: "100%", height: 1, bgcolor: "divider", my: 4 }} />
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 600, 
                color: completionPercentage === 100 ? "primary.main" : "warning.main" 
              }}>
                {completionPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profile Complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                <FileText size={24} color="#f57c00" />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: "text.primary" }}>
                {documentsUploaded}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents Uploaded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                <Clock size={24} color={isProfileComplete ? "#4caf50" : "#f57c00"} />
              </Box>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600, 
                color: isProfileComplete ? "success.main" : "warning.main" 
              }}>
                {isProfileComplete ? "Ready" : "Incomplete"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For Verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Progress Bar */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Typography variant="body2" sx={{ textAlign: "left", mb: 1 }}>
          Profile completion: {completionPercentage}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: completionPercentage === 100 ? "#4caf50" : "#1976d2",
              borderRadius: 4
            }
          }}
        />
      </Box>
      
      {/* Previous Button */}
      <Button
        variant="outlined"
        onClick={onPrevious}
        sx={{ mt: 2 }}
      >
        Previous
      </Button>
    </Box>
  );
};

export default ProfileCompletionStep;