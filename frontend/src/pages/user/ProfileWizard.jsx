import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Briefcase, Upload, CheckCircle, ArrowRight, ArrowLeft, Shield, FileText, Trash2, PlusCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const ProfileWizard = ({ onNavigate }) => {
    const { user, setUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const saveDraft = useCallback(async (dataToSave) => {
        if (!dataToSave) return;
        setIsSavingDraft(true);
        
        const payload = {
            full_name: dataToSave.full_name,
            specialization: dataToSave.specialization,
            personal_info: dataToSave.personal_info,
            experience: dataToSave.experience,
        };

        try {
            await authService.updateProfessionalProfile(payload);
        } catch (error) {
            console.log("Auto-save failed, will retry on next change.", error.response?.data);
        } finally {
            if (isMounted.current) setIsSavingDraft(false);
        }
    }, []);

    const debouncedSave = useCallback(debounce(saveDraft, 2000), [saveDraft]);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data } = await authService.getProfessionalProfile();
                if (isMounted.current) {
                    setFormData({
                        full_name: data.full_name || '',
                        specialization: data.specialization || '',
                        personal_info: data.personal_info || { phone_number: '', date_of_birth: '', nationality: '', city: '', country: '', professional_bio: '' },
                        experience: data.experience || { current_job_title: '', years_of_experience: '', aviation_specialization: '' },
                        documents: data.documents || {},
                    });
                }
            } catch (error) {
                console.error("Could not load profile data for wizard.", error);
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleDataChange = (updatedData) => {
        setFormData(updatedData);
        debouncedSave(updatedData);
    };

    const handleNestedChange = (section, field, value) => {
        const updatedFormData = {
            ...formData,
            [section]: { ...formData[section], [field]: value }
        };
        handleDataChange(updatedFormData);
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };
    
    const handleInputChange = (field, value) => {
        const updatedFormData = { ...formData, [field]: value };
        handleDataChange(updatedFormData);
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };
    
    const handleFileSelect = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            if (fileType === 'cv') setCvFile(file);
            else if (fileType === 'license') setLicenseFile(file);
            else if (fileType === 'additional') {
                setAdditionalFiles(prev => [...prev, file]);
            }
        }
    };

    const removeFile = (fileType, index) => {
        if (fileType === 'cv') setCvFile(null);
        else if (fileType === 'license') setLicenseFile(null);
        else if (fileType === 'additional') {
            setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    const validateStep = () => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!formData.full_name?.trim()) newErrors.full_name = "Full name is required.";
            const phone = formData.personal_info.phone_number;
            if (phone && !isPossiblePhoneNumber(phone)) {
                newErrors.phone_number = "Please enter a valid phone number.";
            }
        }
        if (currentStep === 2) {
            if (!formData.experience.current_job_title?.trim()) newErrors.current_job_title = "Current job title is required.";
            const years = formData.experience.years_of_experience;
            if (years === null || years === undefined || years === '') {
                 newErrors.years_of_experience = "Years of experience are required.";
            } else if (parseInt(years, 10) < 0) {
                 newErrors.years_of_experience = "Years of experience cannot be negative.";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) setCurrentStep(prev => prev + 1);
    };
    const handlePrev = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setIsSubmitting(true);

        const payload = { ...formData };
        
        payload.documents = { ...payload.documents };
        if (cvFile) payload.documents.cv = cvFile;
        if (licenseFile) payload.documents.aviation_licenses = licenseFile;
        if (additionalFiles.length > 0) payload.documents.additional_documents = additionalFiles;

        try {
            const { data } = await authService.updateProfessionalProfile(payload);
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('winguport_user', JSON.stringify(updatedUser));
            setCurrentStep(5);
        } catch (error) {
            console.error("Submission failed:", error.response?.data || error.message);
            setErrors({ submit: "An error occurred during submission. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [ { id: 1, title: 'Personal Info', icon: User }, { id: 2, title: 'Experience', icon: Briefcase }, { id: 3, title: 'Documents', icon: Upload }, { id: 4, title: 'Submit', icon: CheckCircle }];

    const renderStepContent = () => {
        if (isLoading) return <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></div>;
        if (!formData) return <div className="text-center py-10 text-red-500">Could not load your profile data. Please try again later.</div>;

        switch (currentStep) {
            case 1: return (
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} className={`w-full p-3 border rounded-lg ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <PhoneInput
                            international
                            defaultCountry="KE"
                            value={formData.personal_info.phone_number}
                            onChange={(value) => handleNestedChange('personal_info', 'phone_number', value)}
                            className={`w-full p-3 border rounded-lg ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                     </div>
                     <div><label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label><input type="date" value={formData.personal_info.date_of_birth || ''} onChange={(e) => handleNestedChange('personal_info', 'date_of_birth', e.target.value)} className="w-full p-3 border rounded-lg" /></div>
                     <div><label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio</label><textarea value={formData.personal_info.professional_bio || ''} onChange={(e) => handleNestedChange('personal_info', 'professional_bio', e.target.value)} rows="4" className="w-full p-3 border rounded-lg"></textarea></div>
                </div>
            );
            case 2: return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Job Title *</label>
                        <input value={formData.experience.current_job_title || ''} onChange={(e) => handleNestedChange('experience', 'current_job_title', e.target.value)} className={`w-full p-3 border rounded-lg ${errors.current_job_title ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.current_job_title && <p className="text-red-500 text-xs mt-1">{errors.current_job_title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience *</label>
                        <input type="number" value={formData.experience.years_of_experience || ''} onChange={(e) => handleNestedChange('experience', 'years_of_experience', e.target.value)} className={`w-full p-3 border rounded-lg ${errors.years_of_experience ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.years_of_experience && <p className="text-red-500 text-xs mt-1">{errors.years_of_experience}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Aviation Specialization</label><input value={formData.specialization || ''} onChange={(e) => handleInputChange('specialization', e.target.value)} className="w-full p-3 border rounded-lg" /></div>
                </div>
            );
            case 3: return (
                <div className="space-y-6">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start space-x-3"><Shield className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" /><div><h4 className="font-semibold text-primary-800">Document Verification</h4><p className="text-sm text-primary-700 mt-1">Upload your licenses and certificates to get verified. This increases your visibility to employers.</p></div></div>
                    
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">Resume/CV</label>
                        {!cvFile && !formData.documents.cv ? (
                             <label htmlFor="cv-upload" className="block w-full border-2 border-dashed rounded-lg p-10 text-center hover:border-primary-500 cursor-pointer"><Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p>Click to upload or drag and drop</p><input id="cv-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'cv')} /></label>
                        ) : (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-primary-600" /><span className="font-medium text-sm">{cvFile?.name || 'Current CV Uploaded'}</span></div>
                                <button onClick={() => removeFile('cv')} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">Licenses & Certificates</label>
                        {!licenseFile && !formData.documents.aviation_licenses ? (
                             <label htmlFor="license-upload" className="block w-full border-2 border-dashed rounded-lg p-10 text-center hover:border-primary-500 cursor-pointer"><Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p>Click to upload or drag and drop</p><input id="license-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'license')} /></label>
                        ) : (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-primary-600" /><span className="font-medium text-sm">{licenseFile?.name || 'Current Licenses Uploaded'}</span></div>
                                <button onClick={() => removeFile('license')} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">Additional Documents</label>
                        {additionalFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-primary-600" /><span className="font-medium text-sm">{file.name}</span></div>
                                <button onClick={() => removeFile('additional', index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                        <label htmlFor="additional-upload" className="cursor-pointer inline-flex items-center text-primary-600 hover:text-primary-800 font-semibold">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add another document
                            <input id="additional-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'additional')} />
                        </label>
                    </div>
                </div>
            );
            case 4: return <div className="text-center py-8"><h3 className="text-2xl font-bold">Review and Submit</h3><p className="text-gray-600 mt-2">Please review your information before submitting.</p>{errors.submit && <p className="text-red-500 text-sm mt-4">{errors.submit}</p>}</div>;
            case 5: return <div className="text-center py-8"><CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" /><h3 className="text-2xl font-bold">Profile Saved!</h3><p className="text-gray-600 mt-2">Your profile has been successfully updated.</p></div>;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-xl shadow-lg border p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{steps.find(s => s.id === currentStep)?.title || 'Profile Complete'}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {isSavingDraft && <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div><span>Saving draft...</span></>}
                    </div>
                </div>
                {renderStepContent()}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button variant="secondary" onClick={handlePrev} disabled={currentStep === 1 || currentStep === 5}><ArrowLeft className="w-4 h-4 mr-2" /> Previous</Button>
                    {currentStep < 4 ? (
                        <Button onClick={handleNext}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    ) : currentStep === 4 ? (
                        <Button onClick={handleSubmit} loading={isSubmitting}>Submit Profile</Button>
                    ) : (
                        <Button onClick={() => onNavigate('/dashboard')} className="bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileWizard;
