import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FileText, Download, X } from "lucide-react";

const CertificatePreview = ({ certificateUrl, filePath }) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(filePath);
  const fullUrl = certificateUrl + filePath;
  const fileName = filePath.split("/").pop();

  // Force download logic
  const handleDownload = async () => {
    try {
      const response = await fetch(fullUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "certificate");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <FileText size={16} style={{ marginRight: 8 }} />

        {isImage ? (
          <img
            src={fullUrl}
            alt="Certificate"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => setPreviewOpen(true)}
          />
        ) : (
          <Typography
            variant="body2"
            color="primary"
            component="a"
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: "none", mr: 1 }}
          >
            {fileName}
          </Typography>
        )}

        {/* Download button (outside) */}
        <Tooltip title="Download Certificate">
          <IconButton size="small" color="primary" onClick={handleDownload}>
            <Download size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Lightbox Dialog for images */}
      {isImage && (
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
          <DialogContent sx={{ p: 0, position: "relative" }}>
            {/* Action buttons in the dialog */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 1,
              }}
            >
              <Tooltip title="Download">
                <IconButton onClick={handleDownload} color="primary" size="small">
                  <Download size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={() => setPreviewOpen(false)} size="small">
                  <X size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* File name at the top */}
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {fileName}
              </Typography>
            </Box>

            <img
              src={fullUrl}
              alt="Certificate Preview"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CertificatePreview;
