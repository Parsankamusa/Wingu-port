import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../api/authService";
import Button from "../../components/common/Button";
import {
  User,
  Building,
  Globe,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  MapPin,
  Phone,
  Users,
  Flag,
  Mail,
  Hash,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { RequiredAsterisk } from "../professional/profile/components/RequiredAsterisk";
import { organizationTypes } from "./components/dropDownData";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const CompanyProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const getLocalCompanyData = () => {
    try {
      const localData = localStorage.getItem(`companyProfile_${user?.id}`);
      return localData ? JSON.parse(localData) : {};
    } catch (error) {
      return {};
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await authService.getRecruiterProfile();
      const localData = getLocalCompanyData();

      //   const initializedData = {
      //     ...data,
      //     company_name: data.company_name || "",
      //     company_website: data.company_website || "",
      //     company_description: localData.company_description || "",
      //     company_type: localData.company_type || "",
      //     company_size: localData.company_size || "",
      //     company_address: localData.company_address || "",
      //     company_phone: localData.company_phone || "",
      //   };
      setFormData(data);
      setOriginalData(data);
      setProfilePicturePreview(data.profile_picture || null);
    } catch (error) {
      showNotification("Could not load company profile data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setProfilePicture(null);
    setProfilePicturePreview(originalData.profile_picture || null);
    setIsEditing(false);
  };

  const validateForm = () => {
    const errors = {};
    let valid = true;

    if (!formData.company_name?.trim()) {
      errors.company_name = "Organization name is required.";
      valid = false;
    }
    if (!formData.country?.trim()) {
      errors.country = "Country is required.";
      valid = false;
    }
    // if (!formData.company_address?.trim()) {
    //   errors.company_address = "Company address is required.";
    //   valid = false;
    // }
    if (!formData.company_email?.trim()) {
      errors.company_email = "Company email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.company_email)) {
      errors.company_email = "Invalid email format.";
      valid = false;
    }
    if (!formData.company_phone?.trim()) {
      errors.company_phone = "Company phone is required.";
      valid = false;
    }
    if (!formData.company_type?.trim()) {
      errors.company_type = "Company type is required.";
      valid = false;
    }
    //   if (!formData.organization_website?.trim()) {
    //     errors.organization_website = "Organization website is required.";
    //     valid = false
    //   } else if (
    //     !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.organization_website)
    //   ) {
    //     errors.organization_website = "Invalid website URL.";
    //     valid = false
    //   }
    setErrors(errors);
    return valid;
  };

  const handleSave = async () => {
    setIsSaving(true);

    const apiPayload = {
      company_name: formData.company_name,
      company_website: formData.company_website,
      company_description: formData.company_description,
      company_type: formData.company_type,
      company_address: formData.company_address,
      company_phone: formData.company_phone,
      company_email: formData.company_email,
    };

    const localPayload = {
      company_description: formData.company_description,
      company_industry: formData.company_industry,
      company_size: formData.company_size,
      company_address: formData.company_address,
      company_phone: formData.company_phone,
    };

    if (profilePicture) {
      apiPayload.profile_picture = profilePicture;
    }

    try {
      const { data } = await authService.updateRecruiterProfile(apiPayload);
      localStorage.setItem(
        `companyProfile_${user.id}`,
        JSON.stringify(localPayload)
      );

      const updatedData = { ...formData, ...data };
      setFormData(updatedData);
      setOriginalData(updatedData);

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("winguport_user", JSON.stringify(updatedUser));

      setProfilePicture(null);
      setProfilePicturePreview(data.profile_picture || null);
      setIsEditing(false);
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to save changes. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  console.log("select", formData?.company_type)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) handleSave();
  };
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50">
        <div className="text-center py-20 text-red-600 font-semibold">
          Could not load profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.message && (
          <div
            className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Organization Profile
            </h1>
            <p className="text-secondary-600 mt-1">
              Manage your organization information and details
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Profile Header Section */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <img
                    src={
                      profilePicturePreview ||
                      `https://placehold.co/128x128/E2E8F0/475569?text=${
                        formData.company_name?.charAt(0) || "O"
                      }`
                    }
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="profile-picture-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="absolute bottom-0 right-0 cursor-pointer bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </>
                )}
              </div>

              <div className="text-center sm:text-left flex-1">
                {isEditing ? (
                  <>
                    <input
                      value={formData.company_name || ""}
                      onChange={(e) =>
                        handleInputChange("company_name", e.target.value)
                      }
                      className={`text-2xl sm:text-3xl font-bold text-secondary-900 w-full p-3 border rounded-lg bg-white focus:ring-2 ${
                        errors.company_name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-secondary-300 focus:ring-primary-500"
                      } focus:border-transparent`}
                      placeholder="Company Name"
                    />
                    {errors.company_name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.company_name}
                      </p>
                    )}
                  </>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
                    {formData.company_name || "Company Name"}
                  </h2>
                )}

                <div className="mt-2">
                  {isEditing ? (
                    <input
                      value={formData.company_website || ""}
                      onChange={(e) =>
                        handleInputChange("company_website", e.target.value)
                      }
                      className="text-secondary-600 w-full p-2 border border-secondary-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <Globe className="w-4 h-4 text-primary-600" />
                      {formData.company_website ? (
                        <a
                          href={formData.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline font-medium"
                        >
                          {formData.company_website}
                        </a>
                      ) : (
                        <span className="text-secondary-500">
                          No website provided
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* About Company Section */}
            <Section title="About Company">
              {isEditing ? (
                <textarea
                  value={formData.company_description || ""}
                  onChange={(e) =>
                    handleInputChange("company_description", e.target.value)
                  }
                  rows="5"
                  className="w-full p-3 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your company, mission, vision, and what makes you unique..."
                />
              ) : (
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <p className="text-secondary-700 whitespace-pre-line leading-relaxed">
                    {formData.company_description ||
                      "No description provided. Add a compelling description to attract top talent!"}
                  </p>
                </div>
              )}
            </Section>

            {/* Company Details Section */}
            <Section title="Company Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={Mail}
                  label="Company Email"
                  type="email"
                  value={formData.company_email}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("company_email", v)}
                  required={true}
                  error={errors.company_email}
                />
                <DetailItem
                  icon={Phone}
                  label="Company Phone"
                  type="phone"
                  value={formData.company_phone}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("company_phone", v)}
                  required={true}
                  error={errors.company_phone}
                />
                <DetailItem
                  icon={Flag}
                  label="Country"
                  value={formData.country}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("country", v)}
                  placeholder="The Country your company is located at"
                  required={true}
                  error={errors.country}
                />
                <DetailItem
                  icon={Hash}
                  label="Registration Number"
                  //   type="email"
                  value={formData.company_registration_number}
                  isEditing={isEditing}
                  onChange={(v) =>
                    handleInputChange("company_registration_number", v)
                  }
                />
                {!isEditing ? (
                  <DetailItem
                    icon={Building}
                    label="Company type"
                    value={formData.company_type}
                    isEditing={isEditing}
                    onChange={(v) => handleInputChange("company_type", v)}
                    placeholder="e.g., NGO"
                  />
                ) : (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-semibold text-secondary-700 flex items-center"
                      htmlFor="company_type"
                    >
                      <Building className="w-4 h-4 mr-2 text-secondary-500" />
                      Company Type&nbsp;
                      <RequiredAsterisk />
                    </label>
                    <FormControl fullWidth error={!!errors[`company_type`]}>
                      <InputLabel id={`company_type-label`}>
                        Company Type *
                      </InputLabel>
                      <Select
                        id="company_type"
                        labelId={`company_type-label`}
                        name="company_type"
                        value={formData.company_type}
                        required
                        label="Company Type *"
                        onChange={(e) => handleInputChange("company_type", e.target.value)}
                      >
                        {organizationTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors[`company_type`] && (
                        <Typography variant="caption" color="error">
                          {errors[`company_type`]}
                        </Typography>
                      )}
                    </FormControl>
                  </div>
                )}
                <DetailItem
                  icon={MapPin}
                  label="Company Address"
                  value={formData.company_address}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("company_address", v)}
                  placeholder="PO BOX 342-01000 Thika"
                  error={errors.company_address}
                />
              </div>
            </Section>

            {/* Primary Contact Section */}
            {/* <Section title="Primary Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={User}
                  label="First Name"
                  value={formData.first_name}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("first_name", v)}
                  placeholder="Contact person first name"
                />
                <DetailItem
                  icon={User}
                  label="Last Name"
                  value={formData.last_name}
                  isEditing={isEditing}
                  onChange={(v) => handleInputChange("last_name", v)}
                  placeholder="Contact person last name"
                />
              </div>
            </Section> */}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-secondary-200">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={isSaving}
                  className="w-full sm:w-auto mb-2 sm:mb-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-secondary-800 flex items-center">
      {title}
    </h3>
    {children}
  </div>
);

const DetailItem = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  placeholder,
  error = null,
  required = false,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-secondary-700 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-secondary-500" />}
      {label}&nbsp;{required && <RequiredAsterisk />}
    </label>

    {isEditing ? (
      <div>
        {type === "phone" ? (
          <PhoneInput
            international
            defaultCountry="KE"
            value={value}
            onChange={onChange}
            className={`phone-input-custom w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm 
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-secondary-300 focus:ring-primary-500"
              }`}
          />
        ) : (
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-secondary-300 focus:ring-primary-500"
              }`}
            placeholder={placeholder}
          />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    ) : (
      <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-100">
        <p className="font-medium text-secondary-800 text-sm">
          {value || <span className="text-secondary-400 italic">Not set</span>}
        </p>
      </div>
    )}
  </div>
);

export default CompanyProfilePage;
