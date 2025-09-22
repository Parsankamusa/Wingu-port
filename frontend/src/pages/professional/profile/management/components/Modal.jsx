import { Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { X } from "lucide-react";

const Modal = ({ open, handleClose, children, title }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle>
        <Typography variant="h5" sx={{fontWeight: 'bold'}}>{title}</Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <X />
      </IconButton>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
};

export default Modal;
