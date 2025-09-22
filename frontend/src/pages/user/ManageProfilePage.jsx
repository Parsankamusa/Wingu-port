import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../api/authService";
import Button from "../../components/common/Button";
import {
  User,
  Briefcase,
  FileText,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  MapPin,
  Globe,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Loader,
  Clock,
  Map,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Building2,
  FileBadge,
  Trash2,
  Plus,
  Info,
  Plane,
  Shield,
  Wrench,
  BookCheck,
  BriefcaseBusiness,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button as MuiButton,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  StyledAccordion,
  StyledDetails,
  StyledSummary,
} from "../professional/profile/components/Accordion";
import ProfessionalSection from "../professional/profile/management/components/ProfessionalSection";

import PersonalSection from "../professional/profile/management/components/PersonalSection";
import SectionCard from "../professional/profile/management/components/SectionCard";
import DocumentsSection from "../professional/profile/management/components/DocumentsSection";
import CurrentPositionCard from "../professional/profile/management/experience/CurrentPositionCard";
import CurrentPositionDialog from "../professional/profile/management/experience/CurrentPositionDialog";
import ProfessionalRoleTab from "../professional/profile/management/professionalRole/ProfessionalRoleTab";
import QualificationsTab from "../professional/profile/management/qualifications/QualificationsTab";
import LicenseTab from "../professional/profile/management/licenses/LicensesTab";
import EmploymentHistoryTab from "../professional/profile/management/employmentHistory/EmploymentHistoryTab";
import DocumentsTab from "../professional/profile/management/documents/DocumentsTab";
import PersonalInfoTab from "../professional/profile/management/personalInfo/PersonalInfoTab";
import professionalProfileApi from "../../api/professionalProfile";

const ManageProfilePage = () => {
  const { user, setUser } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [errors, setErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [documents, setDocuments] = useState([])

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await authService.getProfessionalProfile();
      // const res = await professionalProfileApi.getDocuments()
      // console.log(res)

      const initializedData = {
        ...data,
        full_name:
          data.full_name ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        personal_info: data.personal_info || {},
        experience: data.experience || {},
        documents: data.documents || {},
        professional_roles: data.professional_roles || [],
        qualifications: data.qualifications || [],
        licenses: data.licenses || [],
        employment_history: data.employment_history || [],
      };
      setFormData(initializedData);
      setOriginalData(initializedData);
      setProfilePicturePreview(data.profile_picture || null);
    } catch (error) {
      showNotification("Could not load profile data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try{

      const res = await professionalProfileApi.getDocuments()
      setDocuments(res.data)
    } catch (error) {
      showNotification("Could not load documents", "error")
    }
  }, [])

  useEffect(() => {
    if (user?.role === "professional") {
      fetchProfile();
      fetchDocuments()
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile, user, fetchDocuments]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };
  const handleFormChange = useCallback(
    (section, field, value, index = null) => {
      setFormData((prev) => {
        // ---- arrays: update an item by index ----
        if (index !== null && Array.isArray(prev[section])) {
          const updatedArray = [...prev[section]];
          updatedArray[index] = { ...updatedArray[index], [field]: value };
          return { ...prev, [section]: updatedArray };
        }

        // ---- arrays: add new object ----
        if (field === "add" && Array.isArray(prev[section])) {
          return { ...prev, [section]: [...prev[section], value] };
        }

        // ---- arrays: remove by index (value is index) ----
        if (field === "remove" && Array.isArray(prev[section])) {
          const updatedArray = [...prev[section]];
          const removeIndex = Number(value);
          if (
            !Number.isNaN(removeIndex) &&
            removeIndex >= 0 &&
            removeIndex < updatedArray.length
          ) {
            updatedArray.splice(removeIndex, 1);
          }
          return { ...prev, [section]: updatedArray };
        }

        // ---- nested object (e.g., experience) ----
        if (section) {
          return { ...prev, [section]: { ...prev[section], [field]: value } };
        }

        // ---- top-level field (e.g., specialization) ----
        return { ...prev, [field]: value };
      });

      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    },
    [errors]
  );

  const handleCancel = () => {
    setFormData(originalData);
    setProfilePicture(null);
    setProfilePicturePreview(originalData.profile_picture || null);
    setCvFile(null);
    setLicenseFile(null);
    setIsEditing(false);
    setErrors({});
  };

  console.log("docs", documents)

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    const payload = {
      ...formData,
    };

    console.log("payload", payload);

    if (profilePicture) {
      payload.profile_picture = profilePicture;
    }

    const documentsUpdate = {};
    if (cvFile) {
      documentsUpdate.cv = cvFile;
    }
    if (licenseFile) {
      documentsUpdate.aviation_licenses = licenseFile;
    }

    if (Object.keys(documentsUpdate).length > 0) {
      payload.documents = {
        ...formData.documents,
        ...documentsUpdate,
      };
    }

    try {
      await authService.updateProfessionalProfile(payload);

      showNotification("Profile updated successfully!", "success");

      await fetchProfile();

      setProfilePicture(null);
      setCvFile(null);
      setLicenseFile(null);
      setIsEditing(false);
    } catch (error) {
      const apiErrors = error.response?.data;
      let errorMessage = "Failed to save changes. Please try again.";
      if (apiErrors) {
        const fieldErrorKeys = [
          "profile_picture",
          "documents",
          "full_name",
          "personal_info",
        ];
        const firstErrorKey = fieldErrorKeys.find((key) => apiErrors[key]);
        if (firstErrorKey) {
          errorMessage = `${firstErrorKey.replace("_", " ")}: ${
            apiErrors[firstErrorKey][0]
          }`;
        } else if (apiErrors.detail) {
          errorMessage = apiErrors.detail;
        }
      }
      showNotification(errorMessage, "error");
      setErrors(apiErrors || {});
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "profilePicture") {
        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file));
      } else if (fileType === "cv") {
        setCvFile(file);
      } else if (fileType === "license") {
        setLicenseFile(file);
      }
    }
  };

  const tabs = [
    { id: "documents", name: "Documents", icon: FileText },
    { id: "personal", name: "Personal", icon: User },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "professional", name: "Professional", icon: Wrench },
    { id: "qualifications", name: "Qualifications", icon: GraduationCap },
    { id: "licenses", name: "Licenses", icon: BookCheck },
    {
      id: "employment_history",
      name: "Employment History",
      icon: BriefcaseBusiness,
    },
  ];

  if (isLoading)
    return (
      <div className="text-center py-20">
        <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
      </div>
    );
  if (!formData)
    return (
      <div className="text-center py-20 text-red-600 font-semibold">
        Could not load profile. Please try refreshing the page.
      </div>
    );

  const renderContent = () => {
    return (
      <div className="space-y-8">
        {activeTab === "personal" && (
          // <PersonalSection
          //   formData={formData}
          //   isEditing={isEditing}
          //   onFormChange={handleFormChange}
          //   profilePicturePreview={profilePicturePreview}
          //   onFileSelect={handleFileSelect}
          //   setProfilePicturePreview={setProfilePicturePreview}
          //   setProfilePicture={setProfilePicture}
          // />
          <PersonalInfoTab
            onModification={fetchProfile}
            personalInfo={formData.personal_info}
            additionalData={{
              profile_picture: formData.profile_picture,
              full_name: formData.full_name,
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email
            }
            }
            setNotification={showNotification}
          />
        )}
        {activeTab === "experience" && (
          // <ProfessionalSection
          //   formData={formData}
          //   isEditing={isEditing}
          //   onFormChange={handleFormChange}
          // />
          <>
            <CurrentPositionCard
              data={formData.experience}
              onEdit={() => setOpenDialog(true)}
            />

            <CurrentPositionDialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              data={formData.experience}
              onSave={fetchProfile} // implement save logic
              setNotification={showNotification}
            />
          </>
        )}
        {activeTab === "documents" && (
          // <DocumentsSection
          //   formData={formData}
          //   isEditing={isEditing}
          //   onFileSelect={handleFileSelect}
          //   cvFile={cvFile}
          //   licenseFile={licenseFile}
          // />
          <DocumentsTab
            documentFiles={documents}
            onModification={fetchProfile}
            onDocumentUpload={fetchDocuments}
            setNotification={showNotification}
          />
        )}

        {activeTab === "professional" && (
          <ProfessionalRoleTab
            onModification={fetchProfile}
            roles={formData.professional_roles}
            setNotification={showNotification}
          />
        )}

        {activeTab === "qualifications" && (
          <QualificationsTab
            onModification={fetchProfile}
            qualifications={formData.qualifications}
            setNotification={showNotification}
          />
        )}

        {activeTab === "licenses" && (
          <LicenseTab
            onModification={fetchProfile}
            licenses={formData.licenses}
            setNotification={showNotification}
          />
        )}

        {activeTab === "employment_history" && (
          <EmploymentHistoryTab
            employmentHistories={formData.employment_history}
            onModification={fetchProfile}
            setNotification={showNotification}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.message && (
          <div
            className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            {notification.message}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Manage Profile
            </h1>
            <p className="mt-1 text-secondary-600">
              Keep your professional information up to date to attract the best
              opportunities.
            </p>
          </div>
          {/* {!isEditing && (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              icon={<Edit3 className="w-4 h-4 mr-2" />}
            >
              Edit Profile
            </Button>
          )} */}
        </div>

        <div className="border-b border-secondary-200 mb-8">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 py-3 px-1 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-secondary-500 hover:text-secondary-700 border-b-2 border-transparent"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">{renderContent()}</div>

        {/* {isEditing && (
          <div className="mt-8 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};

// 🔹 Professional Section

export default ManageProfilePage;
