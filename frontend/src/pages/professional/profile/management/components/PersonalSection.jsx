import Button from "../../../../../components/common/Button";
import SectionCard from "./SectionCard";
import PhoneInput from "react-phone-number-input";
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
} from "lucide-react";
import InfoField from "./InfoField";

const PersonalSection = ({
  formData,
  isEditing,
  onFormChange,
  profilePicturePreview,
  onFileSelect,
  setProfilePicture,
  setProfilePicturePreview,
}) => {
    return(
  <div className="space-y-8">
    <SectionCard title="Profile Photo">
      <div className="flex items-center space-x-6">
        <img
          src={
            profilePicturePreview ||
            `https://placehold.co/100x100/F3F4F6/6B7280?text=${formData.full_name?.charAt(
              0
            )}`
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div>
          <h4 className="font-semibold text-secondary-800">
            Update your photo
          </h4>
          <p className="text-sm text-secondary-600 mt-1">
            A professional headshot helps employers recognize you.
          </p>
          {isEditing && (
            <div className="mt-3 flex space-x-2">
              <input
                type="file"
                id="profile-picture-upload"
                className="hidden"
                onChange={(e) => onFileSelect(e, "profilePicture")}
                accept="image/*"
              />
              <Button
                size="sm"
                onClick={() =>
                  document.getElementById("profile-picture-upload").click()
                }
                icon={<Upload className="w-4 h-4" />}
              >
                Upload New
              </Button>
              {profilePicturePreview && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setProfilePicture(null);
                    setProfilePicturePreview(null);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
    {/* <SectionCard title="Basic Information">
            {isEditing ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Full Name</label><input type="text" value={formData.full_name || ''} onChange={e => onFormChange(null, 'full_name', e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Email Address</label><p className="text-secondary-600 mt-3">{formData.email}</p></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Phone Number</label><PhoneInput international defaultCountry="KE" value={formData.personal_info.phone_number} onChange={val => onFormChange('personal_info', 'phone_number', val)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Date of Birth</label><input type="date" value={formData.personal_info.date_of_birth || ''} onChange={e => onFormChange('personal_info', 'date_of_birth', e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Nationality</label><input type="text" value={formData.personal_info.nationality || ''} onChange={e => onFormChange('personal_info', 'nationality', e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Current Location</label><input type="text" value={formData.personal_info.location || ''} onChange={e => onFormChange('personal_info', 'location', e.target.value)} placeholder="e.g., Miami, FL, USA" className="w-full p-2 border rounded-md" /></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    <InfoField icon={User} label="Full Name" value={formData.full_name} />
                    <InfoField icon={Mail} label="Email Address" value={formData.email} />
                    <InfoField icon={Phone} label="Phone Number" value={formData.personal_info.phone_number} />
                    <InfoField icon={Calendar} label="Date of Birth" value={formData.personal_info.date_of_birth} />
                    <InfoField icon={Globe} label="Nationality" value={formData.personal_info.nationality} />
                    <InfoField icon={MapPin} label="Current Location" value={formData.personal_info.location} />
                </div>
            )}
        </SectionCard> */}
    <SectionCard title="Basic Information">
      {isEditing ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name || ""}
              onChange={(e) => onFormChange(null, "full_name", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Email Address
            </label>
            <p className="text-secondary-600 mt-3">{formData.email}</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Phone Number
            </label>
            <PhoneInput
              international
              defaultCountry="KE"
              value={formData.personal_info.phone_number}
              onChange={(val) =>
                onFormChange("personal_info", "phone_number", val)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.personal_info.date_of_birth || ""}
              onChange={(e) =>
                onFormChange("personal_info", "date_of_birth", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Nationality
            </label>
            <input
              type="text"
              value={formData.personal_info.nationality || ""}
              onChange={(e) =>
                onFormChange("personal_info", "nationality", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* National ID */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              National ID
            </label>
            <input
              type="text"
              value={formData.personal_info.national_id || ""}
              onChange={(e) =>
                onFormChange("personal_info", "national_id", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              City
            </label>
            <input
              type="text"
              value={formData.personal_info.city || ""}
              onChange={(e) =>
                onFormChange("personal_info", "city", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Country
            </label>
            <input
              type="text"
              value={formData.personal_info.country || ""}
              onChange={(e) =>
                onFormChange("personal_info", "country", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Willing to Relocate */}
          <div className="flex items-center space-x-3 mt-3">
            <input
              type="checkbox"
              checked={formData.personal_info.willing_to_relocate || false}
              onChange={(e) =>
                onFormChange(
                  "personal_info",
                  "willing_to_relocate",
                  e.target.checked
                )
              }
            />
            <label className="text-sm font-semibold text-secondary-700">
              Willing to Relocate
            </label>
          </div>

          {/* Preferred Work Regions */}
          <div className="col-span-2">
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Preferred Work Regions
            </label>
            <input
              type="text"
              value={formData.personal_info.preferred_work_regions || ""}
              onChange={(e) =>
                onFormChange(
                  "personal_info",
                  "preferred_work_regions",
                  e.target.value
                )
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Language */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Language
            </label>
            <select
              value={formData.personal_info.language || ""}
              onChange={(e) =>
                onFormChange("personal_info", "language", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="english">English</option>
              <option value="swahili">Swahili</option>
              <option value="french">French</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm font-semibold text-secondary-700 mb-1 block">
              Availability
            </label>
            <select
              value={formData.personal_info.availability || ""}
              onChange={(e) =>
                onFormChange("personal_info", "availability", e.target.value)
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="immediately">Immediately</option>
              <option value="1_month">1 Month Notice</option>
              <option value="2_months">2 Months Notice</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <InfoField icon={User} label="Full Name" value={formData.full_name} />
          <InfoField icon={Mail} label="Email Address" value={formData.email} />
          <InfoField
            icon={Phone}
            label="Phone Number"
            value={formData.personal_info.phone_number}
          />
          <InfoField
            icon={Calendar}
            label="Date of Birth"
            value={formData.personal_info.date_of_birth}
          />
          <InfoField
            icon={Globe}
            label="Nationality"
            value={formData.personal_info.nationality}
          />
          <InfoField
            icon={MapPin}
            label="Current Location"
            value={formData.personal_info.location}
          />
          <InfoField
            icon={FileText}
            label="National ID"
            value={formData.personal_info.national_id}
          />
          <InfoField
            icon={MapPin}
            label="Country"
            value={formData.personal_info.country}
          />
          <InfoField
            icon={MapPin}
            label="City"
            value={formData.personal_info.city}
          />
          <InfoField
            icon={CheckCircle}
            label="Willing to Relocate"
            value={formData.personal_info.willing_to_relocate ? "Yes" : "No"}
          />
          <InfoField
            icon={Map}
            label="Preferred Work Regions"
            value={formData.personal_info.preferred_work_regions}
          />
          <InfoField
            icon={Globe}
            label="Language"
            value={formData.personal_info.language}
          />
          <InfoField
            icon={Clock}
            label="Availability"
            value={formData.personal_info.availability}
          />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Professional Bio">
      {isEditing ? (
        <textarea
          value={formData.personal_info.professional_bio || ""}
          onChange={(e) =>
            onFormChange("personal_info", "professional_bio", e.target.value)
          }
          rows="5"
          className="w-full p-2 border rounded-md"
        />
      ) : (
        <p className="text-secondary-700 whitespace-pre-line">
          {formData.personal_info.professional_bio || "Not set"}
        </p>
      )}
    </SectionCard>
  </div>
)};

export default PersonalSection;