import React, { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  StepConnector,
} from "@mui/material";
import {
  User,
  Briefcase,
  Upload,
  CheckCircle,
  Wrench,
  GraduationCap,
  BookCheck,
  BriefcaseBusiness,
} from "lucide-react";
import { styled } from "@mui/system";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import DocumentsUpload from "./DocumentsUpload";
import ProfessionalRoleForm from "./ProfessionalRoleForm";
import QualificationForm from "./QualificationForm";
import LicenseForm from "./components/LicenseForm";
import EmploymentHistoryForm from "./components/EmploymentHistoryForm";
import ProfileCompletionStep from "./components/ProfileCompletionHistory";

// Define steps
const steps = [
  { label: "Personal Info", icon: User },
  { label: "Experience", icon: Briefcase },
  { label: "Upload Docs", icon: Upload },
  { label: "Professional Role", icon: Wrench },
  { label: "Qualifications", icon: GraduationCap },
  { label: "Licenses", icon: BookCheck },
  { label: "Employment History", icon: BriefcaseBusiness },
  { label: "Finish", icon: CheckCircle },
];

// Custom Connector
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${StepConnector.line}`]: {
    borderColor: "#e0e0e0",
    borderTopWidth: 3,          // thinner line
    margin: "0 4px",            // reduce connector length
    borderRadius: 1,
  },
  [`&.Mui-active .${StepConnector.line}`]: {
    borderColor: "#1976d2",     // active blue
  },
  [`&.Mui-completed .${StepConnector.line}`]: {
    borderColor: "#1976d2",     // completed blue
  },
}));

// Custom Step Icon
const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;
  const StepIcon = steps[Number(icon) - 1].icon;

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: completed
          ? "#1976d2"
          : active
          ? "#1976d2"
          : "#e0e0e0",
        color: "#fff",
        transition: "all 0.3s ease",
      }}
    >
      {completed ? (
        <CheckCircle size={20} />
      ) : (
        <StepIcon size={20} />
      )}
    </Box>
  );
};

const ProfileWizard = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PersonalInfoForm />;
      case 1:
        return <ExperienceForm />;
      case 2:
        return <DocumentsUpload />;
      case 3:
        return <ProfessionalRoleForm />;
      case 4:
        return <QualificationForm />
      case 5:
        return <LicenseForm />;
      case 6:
        return <EmploymentHistoryForm />
      case 7:
        return <ProfileCompletionStep />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 5 }}>
      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector />}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel slots={{stepIcon: CustomStepIcon}}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 3 }}>
        {/* <Typography variant="h6" gutterBottom>
          {steps[activeStep].label}
        </Typography> */}
        {renderStepContent()}

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success">
              Finish
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileWizard;
