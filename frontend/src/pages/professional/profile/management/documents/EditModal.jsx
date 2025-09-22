import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { FileText } from "lucide-react";

export default function EditModal({ open, handleClose, document, onUpdate }) {
  console.log("document", document);

  const [category, setCategory] = useState(document?.category || "");
  const [file, setFile] = useState(document?.file || null);

  useEffect(() => {
    if (document) {
      setCategory(document.category || "");
      setFile(document.file || null); // ✅ keep existing file if present
    }
  }, [document]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    if (!file) return;

    // Convert to Base64 or FormData depending on backend
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64File = reader.result;

      onUpdate(document.id, {
        category,
        file: base64File,
      });

      handleClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Document</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              disabled // keep category fixed; remove this if you want it editable
            >
              <MenuItem value="cv">CV</MenuItem>
              <MenuItem value="aviation_licenses">Aviation Licenses</MenuItem>
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="referenceLetters">Reference Letters</MenuItem>
              <MenuItem value="otherDocuments">Other Documents</MenuItem>
            </Select>
          </FormControl>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
          />

          {file && (
            <div className="flex items-center justify-between bg-blue-50 rounded-md p-3 mt-2">
              <div className="flex items-center">
                <FileText className="text-blue-500 mr-2" size={20} />
                <Typography
                  component="a"
                  href={
                    typeof file === "string"
                      ? file // backend gives a URL
                      : URL.createObjectURL(file) // preview for new file
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-medium hover:underline"
                >
                  {typeof file === "string"
                    ? file.split("/").pop() // extract filename from URL
                    : file.name || "Not named"}{" "}
                  {/* fallback if no name */}
                </Typography>
              </div>
            </div>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!file}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
