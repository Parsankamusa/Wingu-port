import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, FileText, Users, Eye, ArrowLeft, ArrowRight, CheckCircle, Save, AlertCircle, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import jobPostingApi from '../../api/jobPosting';
import { useAuth } from '../../contexts/AuthContext';

const aviationDepartments = [
  "Flight Operations",
  "Aircraft Maintenance & Engineering",
  "Ground Operations",
  "Cabin Crew Services",
  "Air Traffic Control",
  "Airport Management",
  "Aviation Safety & Security",
  "Corporate & Administration",
  "Sales & Marketing",
  "Cargo & Logistics",
  "Training & Development",
  "Unmanned Aerial Systems (Drones)",
  "Other"
];

const PostJobWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [jobId, setJobId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeState = (data = {}) => {
    const initialState = {
        title: '', aircraft_type: '', location: '', is_remote: false, job_type: 'full-time',
        department: '', experience_level: 'entry', description: '', responsibilities: '',
        qualifications: '', license_requirements: '', total_flying_hours_required: '',
        specific_aircraft_hours_required: '', medical_certification_required: '',
        contact_email: user?.email || '', application_url: '', salary_min: '', salary_max: '',
        benefits: '', status: 'draft', visibility: 'public', is_urgent: false,
        expected_start_date: '', expiry_date: '',
    };
    
    const mergedData = { ...initialState, ...data };

    mergedData.expected_start_date = mergedData.expected_start_date ? mergedData.expected_start_date.split('T')[0] : '';
    mergedData.expiry_date = mergedData.expiry_date ? mergedData.expiry_date.split('T')[0] : '';

    return mergedData;
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setJobId(editId);
      const fetchJobData = async () => {
        try {
          const { data } = await jobPostingApi.getJobPostingById(editId);
          setFormData(initializeState(data));
        } catch (error) {
          showNotification('Failed to load job data for editing.', 'error');
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobData();
    } else {
      setFormData(initializeState());
      setIsLoading(false);
    }
  }, [location.search, user]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const steps = [
    { id: 1, title: 'Job Overview', icon: Briefcase }, 
    { id: 2, title: 'Description', icon: FileText },
    { id: 3, title: 'Qualifications', icon: Users }, 
    { id: 4, title: 'Application Details', icon: DollarSign },
    { id: 5, title: 'Review & Publish', icon: Eye },
  ];

  const handleNext = () => {
    if (validateStep(currentStep, false)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setErrors({});
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  
  const validateStep = (step, isPublishing) => {
    const newErrors = {};
    const check = (field, message) => {
        if (!formData[field] || String(formData[field]).trim() === '' || String(formData[field]).trim() === 'N/A') {
            newErrors[field] = message;
        }
    };

    if (isPublishing) {
        check('title', 'Job title is required.');
        check('location', 'Location is required.');
        check('department', 'Department is required.');
        check('description', 'Job description is required.');
        check('responsibilities', 'Responsibilities are required.');
        check('qualifications', 'Qualifications are required.');
        check('contact_email', 'Contact email is required.');
    } else if (step === 1) {
        check('title', 'Job title is required.');
    }

    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
        newErrors.contact_email = 'Email is invalid.';
    }
    if (formData.salary_min && formData.salary_max && parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
        newErrors.salary_min = 'Minimum salary cannot be greater than maximum.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPayload = (data, isDraft) => {
    const payload = { ...data };
    
    // Handle optional aircraft_type field for all submissions
    if (!payload.aircraft_type || payload.aircraft_type.trim() === '') {
        payload.aircraft_type = 'N/A';
    }

    if (isDraft) {
        const requiredForApi = ['description', 'responsibilities', 'qualifications', 'location', 'contact_email', 'department'];
        requiredForApi.forEach(field => {
            if (!payload[field] || payload[field].trim() === '') {
                payload[field] = 'N/A';
            }
        });
    }

    ['salary_min', 'salary_max', 'total_flying_hours_required', 'specific_aircraft_hours_required'].forEach(field => {
        if (payload[field] === '' || payload[field] === null) {
            delete payload[field];
        } else {
            payload[field] = Number(payload[field]);
        }
    });

    ['expected_start_date', 'expiry_date'].forEach(field => {
        if (!payload[field]) {
            payload[field] = null;
        }
    });
    return payload;
  };

  const handleSubmit = async (publishStatus) => {
    const isDraft = publishStatus === 'draft';
    if (!isDraft && !validateStep(null, true)) {
        showNotification('Please fill all required fields before publishing.', 'error');
        return;
    }

    setIsSubmitting(true);
    const jobData = formatPayload({ ...formData, status: publishStatus }, isDraft);
    
    try {
      if (jobId) {
        await jobPostingApi.updateJobPosting(jobId, jobData);
        showNotification(isDraft ? 'Draft updated successfully!' : 'Job updated successfully!', 'success');
      } else {
        const response = await jobPostingApi.createJobPosting(jobData);
        setJobId(response.data.id);
        showNotification('Draft saved successfully!', 'success');
      }
      if (!isDraft) {
        setTimeout(() => navigate('/manage-jobs'), 1500);
      }
    } catch (error) {
      showNotification('An error occurred. Please check the form.', 'error');
      const apiErrors = error.response?.data;
      if (apiErrors) setErrors(apiErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: 
        return <Step1 formData={formData} handleChange={handleChange} errors={errors} />;
      case 2: 
        return <Step2 formData={formData} handleChange={handleChange} errors={errors} />;
      case 3: 
        return <Step3 formData={formData} handleChange={handleChange} errors={errors} />;
      case 4: 
        return <Step4 formData={formData} handleChange={handleChange} errors={errors} />;
      case 5: 
        return <Step5 formData={formData} />;
      default: 
        return null;
    }
  };

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.message && (
          <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            {notification.message}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 lg:sticky top-24 self-start">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-secondary-800">
                {jobId ? 'Edit Job' : 'New Job Post'}
              </h2>
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-secondary-200 text-secondary-500'
                    }`}>
                      {currentStep > step.id ? (
                        <CheckCircle size={16} />
                      ) : (
                        <step.icon size={16} />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${
                        currentStep > step.id ? 'bg-primary-600' : 'bg-secondary-200'
                      }`}></div>
                    )}
                  </div>
                  <span className={`font-semibold ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-secondary-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
              {renderStepContent()}
              
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 pt-6 border-t">
                <Button 
                  variant="secondary" 
                  onClick={handlePrev} 
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                
                <div className="flex space-x-2 w-full sm:w-auto mb-4 sm:mb-0">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSubmit('draft')} 
                    loading={isSubmitting} 
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 mr-2" />Save Draft
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button onClick={handleNext} className="flex-1 sm:flex-none">
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSubmit('active')} 
                      className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none" 
                      loading={isSubmitting}
                    >
                      {jobId ? 'Update & Publish' : 'Publish Job'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ name, label, value, onChange, placeholder, error, required = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value || ''} 
      onChange={onChange} 
      placeholder={placeholder} 
      className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`} 
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ name, label, value, onChange, children, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="w-full p-2 border border-gray-300 rounded-md bg-white"
    >
      {children}
    </select>
  </div>
);

const TextareaField = ({ name, label, value, onChange, placeholder, error, required = false, rows = 4 }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea 
      name={name} 
      value={value} 
      onChange={onChange} 
      rows={rows} 
      className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`} 
      placeholder={placeholder} 
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Step1 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-secondary-800">Job Overview</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <InputField 
        name="title" 
        label="Job Title" 
        value={formData.title} 
        onChange={handleChange} 
        placeholder="e.g., B737 First Officer" 
        error={errors.title} 
        required 
      />
      <SelectField 
        name="department" 
        label="Department / Category" 
        value={formData.department} 
        onChange={handleChange} 
        required
      >
        <option value="">Select a department...</option>
        {aviationDepartments.map(dep => (
          <option key={dep} value={dep}>{dep}</option>
        ))}
      </SelectField>
      <InputField 
        name="location" 
        label="Location" 
        value={formData.location} 
        onChange={handleChange} 
        placeholder="e.g., Nairobi, Kenya" 
        error={errors.location} 
        required 
      />
      <SelectField 
        name="job_type" 
        label="Job Type" 
        value={formData.job_type} 
        onChange={handleChange}
      >
        <option value="full-time">Full Time</option>
        <option value="part-time">Part Time</option>
        <option value="contract">Contract</option>
        <option value="temporary">Temporary</option>
      </SelectField>
    </div>
    <div className="flex items-center space-x-3">
      <input 
        type="checkbox" 
        name="is_remote" 
        id="is_remote" 
        checked={formData.is_remote} 
        onChange={handleChange} 
        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
      />
      <label htmlFor="is_remote" className="text-sm font-medium text-gray-700">
        This is a remote position
      </label>
    </div>
  </div>
);

const Step2 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-secondary-800">Job Description</h3>
    <TextareaField 
      name="description" 
      label="Detailed Description" 
      value={formData.description} 
      onChange={handleChange} 
      placeholder="Provide a summary of the role, team, and company culture..." 
      error={errors.description} 
      required 
      rows={6} 
    />
    <TextareaField 
      name="responsibilities" 
      label="Key Responsibilities" 
      value={formData.responsibilities} 
      onChange={handleChange} 
      placeholder="List the key responsibilities of this role, one per line..." 
      error={errors.responsibilities} 
      required 
      rows={6} 
    />
  </div>
);

const Step3 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-secondary-800">Qualifications & Experience</h3>
    <TextareaField 
      name="qualifications" 
      label="Required Qualifications" 
      value={formData.qualifications} 
      onChange={handleChange} 
      placeholder="List the required qualifications, certifications, and skills, one per line..." 
      error={errors.qualifications} 
      required 
      rows={6} 
    />
    <SelectField 
      name="experience_level" 
      label="Experience Level" 
      value={formData.experience_level} 
      onChange={handleChange}
    >
      <option value="entry">Entry Level (0-2 years)</option>
      <option value="mid">Mid Level (3-5 years)</option>
      <option value="senior">Senior Level (6-10 years)</option>
      <option value="executive">Executive (10+ years)</option>
    </SelectField>
    <h4 className="text-lg font-semibold text-secondary-800 pt-4 border-t">
      Flight Crew Specifics (Optional)
    </h4>
    <div className="grid md:grid-cols-2 gap-6">
      <InputField 
        name="aircraft_type" 
        label="Aircraft Type" 
        value={formData.aircraft_type} 
        onChange={handleChange} 
        placeholder="e.g., Boeing 737" 
      />
      <InputField 
        name="total_flying_hours_required" 
        label="Total Flying Hours" 
        value={formData.total_flying_hours_required} 
        onChange={handleChange} 
        placeholder="e.g., 1500" 
        type="number" 
      />
    </div>
  </div>
);

const Step4 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-secondary-800">Application Details</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <InputField 
        name="contact_email" 
        label="Contact Email" 
        value={formData.contact_email} 
        onChange={handleChange} 
        placeholder="recruitment@example.com" 
        error={errors.contact_email} 
        required 
      />
      <InputField 
        name="application_url" 
        label="External Application URL" 
        value={formData.application_url} 
        onChange={handleChange} 
        placeholder="https://yourcompany.com/apply" 
      />
      <InputField 
        name="expected_start_date" 
        label="Expected Start Date" 
        value={formData.expected_start_date} 
        onChange={handleChange} 
        type="date"
      />
      <InputField 
        name="expiry_date" 
        label="Application Deadline (Expires In)" 
        value={formData.expiry_date} 
        onChange={handleChange} 
        type="date"
      />
    </div>
    <h4 className="text-lg font-semibold text-secondary-800 pt-4 border-t">
      Compensation (Optional)
    </h4>
    <div className="grid md:grid-cols-2 gap-6">
      <InputField 
        name="salary_min" 
        label="Minimum Salary ($)" 
        value={formData.salary_min} 
        onChange={handleChange} 
        placeholder="e.g., 80000" 
        error={errors.salary_min} 
        type="number" 
      />
      <InputField 
        name="salary_max" 
        label="Maximum Salary ($)" 
        value={formData.salary_max} 
        onChange={handleChange} 
        placeholder="e.g., 120000" 
        type="number" 
      />
    </div>
    <TextareaField 
      name="benefits" 
      label="Benefits" 
      value={formData.benefits} 
      onChange={handleChange} 
      placeholder="Health insurance, retirement plans, travel benefits, etc." 
      rows={3} 
    />
  </div>
);

const Step5 = ({ formData }) => (
  <div>
    <h3 className="text-xl font-bold text-center mb-6">Review Your Job Post</h3>
    <div className="bg-secondary-50 p-6 rounded-lg space-y-4 border">
      <div>
        <h4 className="text-lg font-semibold">{formData.title}</h4>
        <p className="text-gray-600">
          {formData.department} • {formData.location} {formData.is_remote && '(Remote)'}
        </p>
        <p className="text-gray-600 capitalize">
          {formData.job_type.replace('-', ' ')} • {formData.experience_level} level
        </p>
      </div>
      
      <div className="pt-2 border-t">
        <h5 className="font-medium text-sm text-gray-500">Description</h5>
        <p className="text-gray-700 whitespace-pre-line text-sm">{formData.description}</p>
      </div>
      
      {(formData.salary_min || formData.salary_max) && (
        <div className="pt-2 border-t">
          <h5 className="font-medium text-sm text-gray-500">Salary Range</h5>
          <p className="text-gray-700 font-semibold">
            ${formData.salary_min || 'N/A'} - ${formData.salary_max || 'N/A'}
          </p>
        </div>
      )}
      
      <div className="pt-2 border-t">
        <h5 className="font-medium text-sm text-gray-500">Contact Email</h5>
        <p className="text-gray-700">{formData.contact_email}</p>
      </div>
       {formData.expiry_date && (
        <div className="pt-2 border-t">
          <h5 className="font-medium text-sm text-gray-500">Application Deadline</h5>
          <p className="text-gray-700">{new Date(formData.expiry_date).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  </div>
);

export default PostJobWizard;

