import { Card, CardContent, Typography, IconButton } from "@mui/material";
import { Pen } from "lucide-react";

const CurrentPositionCard = ({ data, onEdit }) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Typography
            variant="h6"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "400px",
            }}
          >
            {data.current_job_title || "No Job Title"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "400px",
            }}>
            {data.years_of_experience
              ? `${data.years_of_experience} years of experience`
              : "No experience added"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "400px",
            }}
          >
            {data.aviation_specialization || "No specialization selected"}
          </Typography>
        </div>
        <IconButton onClick={onEdit}>
          <Pen />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default CurrentPositionCard;
