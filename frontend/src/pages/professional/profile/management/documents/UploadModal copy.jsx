import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Box
} from "@mui/material";

const categories = ["CV", "Aviation Licenses", "Passport", "Reference Letters"];

export default function UploadModal({ open, handleClose, onUpload, editData }) {
  const [category, setCategory] = useState(editData?.category || "");
  const [files, setFiles] = useState({
  cv: [],
  licenses: [],
  passport: [],
  referenceLetters: [],
  otherDocuments: []
});


  const handleFileChange = (category, newFiles) => {
  setFiles((prev) => ({
    ...prev,
    [category]: [...prev[category], ...Array.from(newFiles)]
  }));
};

const handleRemoveFile = (category, index) => {
  setFiles((prev) => {
    const updated = [...prev[category]];
    updated.splice(index, 1);
    return { ...prev, [category]: updated };
});
};


  const handleSave = () => {
    onUpload({ category, files });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? "Edit Documents" : "Upload Documents"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ marginTop: "1rem" }}
        />

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <strong>Files selected:</strong>
            <ul>
              {Array.from(files).map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!category || files.length === 0}>
          {editData ? "Update" : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
