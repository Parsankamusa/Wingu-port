import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
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

const DocumentsTab = ({
  documentFiles,
  onModification,
  onDocumentUpload,
  setNotification,
}) => {
  console.log("doc tab", documentFiles);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDeleteClick = (doc) => {
    setDeleteTarget(doc);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await professionalProfileApi.deleteDocument(deleteTarget.id);

      if (res.status === 200 || res.status === 204) {
        onDocumentUpload();
        setNotification("Document deleted successfully", "success");
      } else {
        setNotification("Failed to delete document", "error");
      }
    } catch (error) {
      console.error(error);
      setNotification("Error deleting document", "error");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSave = async (files) => {
    try {
      console.log("Saving files:", files);
      let payload = { ...files };
      let transformedPayload = {};
      let finalPayload = {};
      const transformedFiles = await Promise.all(
        payload.files.map(async (file) => {
          if (file instanceof File) {
            return await fileToBase64(file);
          }
          return file; // already a string / URL
        })
      );
      finalPayload = { ...payload, files: transformedFiles };
      console.log("final pl", finalPayload);

      const res = await professionalProfileApi.createDocuments(finalPayload);

      if (res.status === 200 || res.status === 201) {
        onDocumentUpload();
        setNotification("Documents updated successfully", "success");
      }
      handleClose();

      // // simulate success
      // onModification();
      // setNotification("Documents updated successfully", "success");
    } catch (error) {
      console.error(error);
      setNotification("Error while saving documents", "error");
    }
  };

  const handleCreateDocument = async (files) => {
    try {
      let cvPayload = files.cv;
      if (cvPayload) {
        if (cvPayload instanceof File) {
          cvPayload = await fileToBase64(cvPayload);
          const autofillRes = await professionalProfileApi.autoExtractCv({
            cv: cvPayload,
          });
          if (autofillRes.status === 200) {
            const { message } = autofillRes.data;
            setNotification(message, "success");
            onModification();
          }
        }
      }
    } catch (error) {
      console.error(error);
      setNotification(
        "Something went wrong while auto populating the fields",
        "error"
      );
    }

    try {
      let cvPayload = files.cv;
      if (cvPayload) {
        if (cvPayload instanceof File) {
          cvPayload = await fileToBase64(cvPayload);
        }
      }
      const res = await professionalProfileApi.createDocuments({
        category: "cv",
        files: [cvPayload],
      });

      if (res.status === 200) {
        onModification();
        setNotification("CV updated successfully", "success");
      }
      handleClose();
    } catch (error) {
      console.error(error);
      setNotification("Failed to save document", "error");
    }
    onDocumentUpload()
  };

  const documentList = [
    { key: "cv", label: "Resume / CV" },
    { key: "aviation_licenses", label: "Aviation Licenses" },
    { key: "passport", label: "Passport" },
    { key: "reference_letters", label: "Reference Letters" },
    { key: "other", label: "Other documents" },
  ];

  return (
    <div>
      {!documentFiles || documentFiles.length === 0 ? (
        <EmptyStateCard
          icon={<FileText size={48} color="#1976d2" />}
          title="No documents uploaded yet"
          description="Upload your CV, licenses, passport and reference letters so recruiters can verify your professional documents."
          buttonText="Upload Documents"
          handleOpen={() => setNewOpen(true)}
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
              Upload
            </Button>
          </Box>

          {/* Document cards */}
          <div className="space-y-6">
            {documentList.map((doc) => {
              // filter the flat list by category
              const categoryDocs = documentFiles.filter(
                (f) => f.category === doc.key
              );

              return (
                <Card key={doc.key} className="p-4">
                  <h3 className="font-semibold mb-3">{doc.label}</h3>

                  {categoryDocs.length > 0 ? (
                    <ul className="space-y-2">
                      {categoryDocs.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between bg-blue-50 rounded-md p-2"
                        >
                          <div className="flex items-center">
                            <FileText
                              className="text-blue-500 mr-2"
                              size={20}
                            />
                            <Typography
                              component="a"
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 font-medium hover:underline"
                            >
                              {file.file.split("/").pop()}
                            </Typography>
                          </div>

                          <div className="flex items-center gap-2">
                            <Typography variant="caption" color="textSecondary">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(file)}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No documents uploaded.
                    </Typography>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Dialog for upload */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {deleteTarget?.file?.split("/").pop() || "this document"}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <UploadModal
        handleClose={handleClose}
        open={open}
        onUpload={handleSave}
      />

      <Modal
        handleClose={() => setNewOpen(false)}
        open={newOpen}
        title="Upload Document"
      >
        <DocumentsForm
          onCancel={() => setNewOpen(false)}
          onSubmit={handleCreateDocument}
        />
      </Modal>
    </div>
  );
};

export default DocumentsTab;
