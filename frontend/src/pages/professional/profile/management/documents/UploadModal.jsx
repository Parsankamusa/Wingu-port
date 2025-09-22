import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  IconButton,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { FileText, X } from "lucide-react";

const categories = [
  { key: "cv", label: "CV" },
  { key: "aviation_licenses", label: "Aviation Licenses" },
  { key: "passport", label: "Passport" },
  { key: "reference_letters", label: "Reference Letters" },
  { key: "other", label: "Other Documents" },
];

export default function UploadModal({ open, handleClose, onUpload, editData }) {
  const [category, setCategory] = useState(editData?.category || "");
  const [files, setFiles] = useState({
    cv: [],
    aviation_licenses: [],
    passport: [],
    reference_letters: [],
    other: [],
  });
  const [error, setError] = useState("");

  const validateFile = (type, file) => {
    setError("");

    if (!file) return false;

    let validTypes = [];
    let maxSize = 0;

    if (type === "cv" || type === "reference_letters") {
      validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      maxSize = 10 * 1024 * 1024; // 10MB
    } else {
      validTypes = ["image/jpeg", "image/png", "application/pdf"];
      maxSize = 5 * 1024 * 1024; // 5MB
    }

    if (!validTypes.includes(file.type)) {
      const allowedTypes =
        type === "cv" || type === "reference_letters"
          ? "PDF, DOC, DOCX"
          : "JPG, PNG, PDF";
      setError(`Invalid file type. Please select a ${allowedTypes} file.`);
      return false;
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size must be less than ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (catKey, newFiles) => {
    const validatedFiles = Array.from(newFiles).filter((file) =>
      validateFile(catKey, file)
    );

    if (validatedFiles.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [catKey]: [...prev[catKey], ...validatedFiles],
      }));
    }
  };

  const handleRemoveFile = (catKey, index) => {
    setFiles((prev) => {
      const updated = [...prev[catKey]];
      updated.splice(index, 1);
      return { ...prev, [catKey]: updated };
    });
  };

  const handleSave = () => {
    onUpload({ category, files: files[category] });
    handleClose();
  };

  const selectedCategory = categories.find((c) => c.key === category);
  const catKey = selectedCategory?.key || "";
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle>
        {editData ? "Edit Documents" : "Upload Documents"}
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
      <DialogContent>
        {/* Category dropdown */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.key} value={cat.key}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File input */}
        {catKey && (
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              Select Files
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => handleFileChange(catKey, e.target.files)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </Button>

            {/* Selected files list */}
            {files[catKey]?.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {files[catKey].map((file, i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FileText size={20} style={{ marginRight: 8 }} />
                      <Typography variant="body2">
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}{" "}
                        MB)
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFile(catKey, i)}
                    >
                      <X size={16} />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!category || files[catKey]?.length === 0}
        >
          {editData ? "Update" : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
