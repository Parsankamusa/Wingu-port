import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { styled } from "@mui/material/styles";
export const StyledAccordion = styled(Accordion)(() => ({
  borderRadius: "16px", // same as rounded-2xl
  marginBottom: "20px",
  border: "1px solid #f1f1f1",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // soft shadow
  overflow: "hidden",
  "&:before": {
    display: "none", // remove default divider line
  },
}));

export const StyledSummary = styled(AccordionSummary)(() => ({
  backgroundColor: "#fff",
  padding: "16px 24px",
  "& .MuiTypography-root": {
    fontWeight: 700, // bold like SectionCard
    fontSize: "1.125rem", // ~text-xl
    color: "#1f2937", // text-secondary-800
  },
}));

export const StyledDetails = styled(AccordionDetails)(() => ({
  backgroundColor: "#fff",
  padding: "24px",
  borderTop: "1px solid #f1f1f1",
}));