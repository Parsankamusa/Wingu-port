import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { FileText, Trash2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import EmptyStateCard from "../components/EmptyStateCard";
import Modal from "../components/Modal";
import DocumentsForm from "./DocumentsForm";
import professionalProfileApi from "../../../../../api/professionalProfile";
import { fileToBase64 } from "../../../../../api/authService";
import UploadModal from "./UploadModal";
import EditModal from "./EditModal";

const DocumentsTab = ({ documentFiles, onModification, setNotification }) => {
  console.log("doc tab",documentFiles)
  const [open, setOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null)

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async (files) => {
    try {
      console.log("Saving files:", files);
      let payload = { ...files };
      let transformedPayload = {}
      let finalPayload = {}
      const transformedFiles = await Promise.all(
      payload.files.map(async (file) => {
        if (file instanceof File) {
          return await fileToBase64(file);
        }
        return file; // already a string / URL
      })
    );

    const category = payload.category

    switch (category) {
      case "cv":
        transformedPayload = { cv: transformedFiles };
        break;
      case "licenses":
        transformedPayload = { aviation_licenses: transformedFiles };
        break;
      case "passport":
        transformedPayload = { passport: transformedFiles };
        break;
      case "referenceLetters":
        transformedPayload = { reference_letters: transformedFiles };
        break;
      default:
        transformedPayload = { other_documents: transformedFiles };
    }

    finalPayload = {documents: transformedPayload}
    console.log("final payload", finalPayload)

      // if (payload.aviation_licenses instanceof File) {
      //   payload.aviation_licenses = await fileToBase64(
      //     payload.aviation_licenses
      //   );
      // }

      // if (payload.passport instanceof File) {
      //   payload.passport = await fileToBase64(payload.passport);
      // }

      // if (payload.reference_letters instanceof File) {
      //   payload.reference_letters = await fileToBase64(
      //     payload.reference_letters
      //   );
      // }

      const res = await professionalProfileApi.updateProfessionalProfile(finalPayload);

      if (res.status === 200) {
        onModification();
        setNotification("Documents updated successfully", "success");
      }
      handleClose();

      // simulate success
        onModification();
        setNotification("Documents updated successfully", "success");
    } catch (error) {
      console.error(error);
      setNotification("Error while saving documents", "error");
    }

    // try {
    //   let cvPayload = files.cv;
    //   if (cvPayload) {
    //     if (cvPayload instanceof File) {
    //       cvPayload = await fileToBase64(cvPayload);
    //       const autofillRes = await professionalProfileApi.autoExtractCv({
    //         cv: cvPayload,
    //       });
    //       if (autofillRes.status === 200) {
    //         const { message } = autofillRes.data;
    //         console.log("meso", message);
    //         setNotification(message, "success");
    //         onModification();
    //         console.log("auto fill res", autofillRes.data);
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error(error);
    //   setNotification(
    //     "Something went wrong while auto populating the fields",
    //     "error"
    //   );
    // }
  };

  const handleUpdate = () => {}

  console.log("negate", !!editDoc)

  const handleDelete = (type) => {
    setNotification(`${type} deleted successfully`, "success");
  };

  const documentList = [
    { key: "cv", label: "Resume / CV" },
    { key: "aviation_licenses", label: "Aviation Licenses" },
    { key: "passport", label: "Passport" },
    { key: "reference_letters", label: "Reference Letters" },
  ];

  return (
    <div>
      {!documentFiles || Object.values(documentFiles).filter(Boolean).length === 0 ? (
        <EmptyStateCard
          icon={<FileText size={48} color="#1976d2" />}
          title="No documents uploaded yet"
          description="Upload your CV, licenses, passport and reference letters so recruiters can verify your professional documents."
          buttonText="Upload Documents"
          handleOpen={handleOpen}
        />
      ) : (
        <>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6">Documents</Typography>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              color="primary"
              onClick={handleOpen}
            >
              Upload / Update
            </Button>
          </Box>

          {/* Document cards */}
          <Grid container spacing={3}>
            {documentList.map((doc) => {
              const docItems = documentFiles[doc.key];

              if (!docItems || docItems.length === 0) return null;

              return docItems.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={`${doc.key}-${item.id}`}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <FileText size={20} style={{ marginRight: 8 }} />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {doc.label}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {item.file?.split("/").pop() || "File"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Uploaded:{" "}
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "space-between" }}>
                      <Button
                        size="small"
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Button>
                      <Box>
                        <IconButton color="primary" onClick={() => {
                          setEditDoc(item);
                          handleClose()
                          }}>
                          <Pencil size={18} />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(doc.key, item.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ));
            })}
          </Grid>
        </>
      )}

      {/* Dialog for upload */}
      {/* <Modal handleClose={handleClose} open={open} title="Upload Documents">
        <DocumentsForm
          documents={documents}
          onSubmit={handleSave}
          onCancel={handleClose}
        />
      </Modal> */}
      <EditModal open={!!editDoc} document={editDoc} handleClose={() => setEditDoc(null)} onUpdate={(id, updatedData) => {
    console.log("Update doc:", id, updatedData);
    // 🔥 call backend update endpoint here
  }} />
      <UploadModal handleClose={handleClose} open={open} onUpload={handleSave} />
    </div>
  );
};

export default DocumentsTab;
