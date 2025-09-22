import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../api/authService';
import Button from '../../components/common/Button';
import { User, Briefcase, FileText, Edit3, Save, X, AlertCircle, CheckCircle, Upload, MapPin, Globe, Calendar, Mail, Phone, ExternalLink, Loader } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const StyledAccordion = styled(Accordion)(() => ({
  borderRadius: "16px", // same as rounded-2xl
  marginBottom: "20px",
  border: "1px solid #f1f1f1",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // soft shadow
  overflow: "hidden",
  "&:before": {
    display: "none", // remove default divider line
  },
}));

const StyledSummary = styled(AccordionSummary)(() => ({
  backgroundColor: "#fff",
  padding: "16px 24px",
  "& .MuiTypography-root": {
    fontWeight: 700, // bold like SectionCard
    fontSize: "1.125rem", // ~text-xl
    color: "#1f2937", // text-secondary-800
  },
}));

const StyledDetails = styled(AccordionDetails)(() => ({
  backgroundColor: "#fff",
  padding: "24px",
  borderTop: "1px solid #f1f1f1",
}));

const ManageProfilePage = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [errors, setErrors] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await authService.getProfessionalProfile();
            const initializedData = {
                ...data,
                full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                personal_info: data.personal_info || {},
                experience: data.experience || {},
                documents: data.documents || {}
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

    useEffect(() => {
        if (user?.role === 'professional') {
            fetchProfile();
        } else {
            setIsLoading(false);
        }
    }, [fetchProfile, user]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    const handleFormChange = useCallback((section, field, value) => {
        setFormData(prev => {
            if (section) {
                return { ...prev, [section]: { ...prev[section], [field]: value } };
            }
            return { ...prev, [field]: value };
        });
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    }, [errors]);

    const handleCancel = () => {
        setFormData(originalData);
        setProfilePicture(null);
        setProfilePicturePreview(originalData.profile_picture || null);
        setCvFile(null);
        setLicenseFile(null);
        setIsEditing(false);
        setErrors({});
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrors({});
        
        const payload = {
            ...formData,
        };
        
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
                ...documentsUpdate
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
                const fieldErrorKeys = ['profile_picture', 'documents', 'full_name', 'personal_info'];
                const firstErrorKey = fieldErrorKeys.find(key => apiErrors[key]);
                if (firstErrorKey) {
                    errorMessage = `${firstErrorKey.replace('_', ' ')}: ${apiErrors[firstErrorKey][0]}`;
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
            if (fileType === 'profilePicture') {
                setProfilePicture(file);
                setProfilePicturePreview(URL.createObjectURL(file));
            } else if (fileType === 'cv') {
                setCvFile(file);
            } else if (fileType === 'license') {
                setLicenseFile(file);
            }
        }
    };

    const tabs = [
        { id: 'personal', name: 'Personal', icon: User },
        { id: 'professional', name: 'Professional', icon: Briefcase },
        { id: 'documents', name: 'Documents', icon: FileText },
    ];

    if (isLoading) return <div className="text-center py-20"><Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto"/></div>;
    if (!formData) return <div className="text-center py-20 text-red-600 font-semibold">Could not load profile. Please try refreshing the page.</div>;

    const renderContent = () => {
        return (
            <div className="space-y-8">
                {activeTab === 'personal' && <PersonalSection formData={formData} isEditing={isEditing} onFormChange={handleFormChange} profilePicturePreview={profilePicturePreview} onFileSelect={handleFileSelect} setProfilePicturePreview={setProfilePicturePreview} setProfilePicture={setProfilePicture} />}
                {activeTab === 'professional' && <ProfessionalSection formData={formData} isEditing={isEditing} onFormChange={handleFormChange} />}
                {activeTab === 'documents' && <DocumentsSection formData={formData} isEditing={isEditing} onFileSelect={handleFileSelect} cvFile={cvFile} licenseFile={licenseFile} />}
            </div>
        );
    };

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {notification.message && (
                    <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                        {notification.message}
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Manage Profile</h1>
                        <p className="mt-1 text-secondary-600">Keep your professional information up to date to attract the best opportunities.</p>
                    </div>
                    {!isEditing && <Button variant="primary" onClick={() => setIsEditing(true)} icon={<Edit3 className="w-4 h-4 mr-2"/>}>Edit Profile</Button>}
                </div>
                
                <div className="border-b border-secondary-200 mb-8">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center space-x-2 py-3 px-1 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-primary-600 text-primary-600' : 'text-secondary-500 hover:text-secondary-700 border-b-2 border-transparent'}`}>
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="space-y-6">
                    {renderContent()}
                </div>
                
                {isEditing && (
                    <div className="mt-8 flex justify-end space-x-2">
                        <Button variant="secondary" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
                        <Button onClick={handleSave} loading={isSaving}><Save className="w-4 h-4 mr-2" />Save All Changes</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-secondary-800 mb-6 pb-4 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

const InfoField = ({ icon: Icon, label, value }) => (
    <div>
        <label className="text-sm text-secondary-500 flex items-center"><Icon className="w-4 h-4 mr-2"/>{label}</label>
        <p className="font-semibold mt-1 text-secondary-800">{value || 'Not set'}</p>
    </div>
);

const PersonalSection = ({ formData, isEditing, onFormChange, profilePicturePreview, onFileSelect, setProfilePicture, setProfilePicturePreview }) => (
    <div className="space-y-8">
        <SectionCard title="Profile Photo">
            <div className="flex items-center space-x-6">
                <img src={profilePicturePreview || `https://placehold.co/100x100/F3F4F6/6B7280?text=${formData.full_name?.charAt(0)}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                <div>
                    <h4 className="font-semibold text-secondary-800">Update your photo</h4>
                    <p className="text-sm text-secondary-600 mt-1">A professional headshot helps employers recognize you.</p>
                    {isEditing && (
                        <div className="mt-3 flex space-x-2">
                            <input type="file" id="profile-picture-upload" className="hidden" onChange={(e) => onFileSelect(e, 'profilePicture')} accept="image/*" />
                            <Button size="sm" onClick={() => document.getElementById('profile-picture-upload').click()} icon={<Upload className="w-4 h-4"/>}>Upload New</Button>
                            {profilePicturePreview && <Button size="sm" variant="destructive" onClick={() => { setProfilePicture(null); setProfilePicturePreview(null); }}>Remove</Button>}
                        </div>
                    )}
                </div>
            </div>
        </SectionCard>
        <SectionCard title="Basic Information">
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
        </SectionCard>
        <SectionCard title="Professional Bio">
            {isEditing ? <textarea value={formData.personal_info.professional_bio || ''} onChange={e => onFormChange('personal_info', 'professional_bio', e.target.value)} rows="5" className="w-full p-2 border rounded-md" /> : <p className="text-secondary-700 whitespace-pre-line">{formData.personal_info.professional_bio || 'Not set'}</p>}
        </SectionCard>
    </div>
);

const ProfessionalSection = ({ formData, isEditing, onFormChange }) => (
    <div className="space-y-8">
        <SectionCard title="Current Position">
            {isEditing ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Job Title</label><input type="text" value={formData.experience.current_job_title || ''} onChange={e => onFormChange('experience', 'current_job_title', e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Years of Experience</label><input type="number" value={formData.experience.years_of_experience || ''} onChange={e => onFormChange('experience', 'years_of_experience', e.target.value)} className="w-full p-2 border rounded-md" /></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    <InfoField icon={Briefcase} label="Job Title" value={formData.experience.current_job_title} />
                    <InfoField icon={Calendar} label="Years of Experience" value={formData.experience.years_of_experience ? `${formData.experience.years_of_experience} years` : 'Not set'} />
                </div>
            )}
        </SectionCard>
        <SectionCard title="Specializations">
            {isEditing ? (
                <div><label className="text-sm font-semibold text-secondary-700 mb-1 block">Specializations (comma-separated)</label><input type="text" value={formData.specialization || ''} onChange={e => onFormChange(null, 'specialization', e.target.value)} placeholder="e.g., Commercial Aviation, International Routes" className="w-full p-2 border rounded-md" /></div>
            ) : (
                <div className="flex flex-wrap gap-2">{formData.specialization ? formData.specialization.split(',').map(spec => spec.trim()).filter(Boolean).map((spec, index) => (<span key={index} className="bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">{spec}</span>)) : <p className="text-secondary-700">Not set</p>}</div>
            )}
        </SectionCard>
    </div>
);

const DocumentsSection = ({ formData, isEditing, onFileSelect, cvFile, licenseFile }) => (
    <SectionCard title="Your Documents">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <FileText className="w-10 h-10 text-secondary-400 mb-2"/>
                <p className="font-semibold mb-2">Resume/CV</p>
                {formData.documents?.cv && !cvFile && (<a href={formData.documents.cv} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline flex items-center justify-center mb-2">View Current CV <ExternalLink className="w-3 h-3 ml-1"/></a>)}
                {cvFile && <p className="text-sm text-secondary-700 mb-2">{cvFile.name}</p>}
                {isEditing && (<><input id="cv-upload" type="file" className="hidden" onChange={(e) => onFileSelect(e, 'cv')} /><Button size="sm" variant="outline" onClick={() => document.getElementById('cv-upload').click()}>{formData.documents?.cv || cvFile ? 'Replace File' : 'Upload File'}</Button></>)}
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <FileText className="w-10 h-10 text-secondary-400 mb-2"/>
                <p className="font-semibold mb-2">Licenses & Certificates</p>
                {formData.documents?.aviation_licenses && !licenseFile && (<a href={formData.documents.aviation_licenses} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline flex items-center justify-center mb-2">View Current Licenses <ExternalLink className="w-3 h-3 ml-1"/></a>)}
                {licenseFile && <p className="text-sm text-secondary-700 mb-2">{licenseFile.name}</p>}
                {isEditing && (<><input id="license-upload" type="file" className="hidden" onChange={(e) => onFileSelect(e, 'license')} /><Button size="sm" variant="outline" onClick={() => document.getElementById('license-upload').click()}>{formData.documents?.aviation_licenses || licenseFile ? 'Replace File' : 'Upload File'}</Button></>)}
            </div>
        </div>
    </SectionCard>
);

export default ManageProfilePage;
