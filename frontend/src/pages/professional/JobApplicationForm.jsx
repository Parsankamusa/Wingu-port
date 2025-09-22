import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building, FileText, Upload, CheckCircle, AlertCircle, Loader, Paperclip, X, PlusCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import jobSearchApi from '../../api/jobSearch';

const documentTypes = [
    { value: 'cv', label: 'Resume / CV' },
    { value: 'cover_letter', label: 'Cover Letter' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'license', label: 'License' },
    { value: 'reference', label: 'Reference Letter' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'other', label: 'Other Document' },
];

const JobApplicationForm = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);


    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await jobSearchApi.getJobDetails(jobId);
                setJob(response.data);
            } catch (err) {
                setError('Failed to load job details. The job may no longer be available.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobDetails();
    }, [jobId]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newDocs = files.map(file => ({ file, type: 'cv' })); // Default to CV
            setDocuments(prev => [...prev, ...newDocs]);
        }
    };
    
    const handleDocTypeChange = (index, type) => {
        setDocuments(prev => prev.map((doc, i) => i === index ? { ...doc, type } : doc));
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        if (coverLetter.length < 100) {
            setError('Your cover letter must be at least 100 characters long.');
            setIsSubmitting(false);
            return;
        }

        try {
            const applicationData = {
                jobId: job.id,
                coverLetter,
                documents,
                answers: { additional_information: additionalInfo },
            };
            await authService.applyForJob(applicationData);
            setSuccess('Application submitted successfully! Redirecting...');
            setTimeout(() => navigate('/my-applications'), 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'An unexpected error occurred during application.';
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-160px)]"><Loader className="w-12 h-12 text-primary-500 animate-spin"/></div>;
    }

    if (error && !job) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                 <div className="bg-white p-8 rounded-2xl shadow-lg border max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-secondary-800">Application Error</h2>
                    <p className="text-red-600 mt-2">{error}</p>
                    <Button onClick={() => navigate('/job-search')} className="mt-6">Back to Jobs</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary-50">
            <div className="container mx-auto py-8 px-4">
                <Button variant="link" onClick={() => navigate(-1)} className="mb-6 text-secondary-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Details
                </Button>
                
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-start gap-6 mb-8 pb-8 border-b">
                        <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-primary-600 font-semibold mb-1">Applying for</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{job.title}</h1>
                            <div className="flex items-center text-secondary-600 mt-2">
                                <Building className="w-4 h-4 mr-2" /> {job.company_name || 'Aviation Company'}
                            </div>
                        </div>
                    </div>
                    
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-3 border border-green-200">
                            <CheckCircle className="w-5 h-5 flex-shrink-0"/>
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}
                    {error && (
                         <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="text-lg font-semibold text-secondary-800 mb-2 block">Cover Letter</label>
                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows="8"
                                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Write a compelling cover letter explaining why you are the best fit for this role..."
                                required
                            />
                            <p className="text-xs text-secondary-500 mt-2">Minimum 100 characters. Current: {coverLetter.length}</p>
                        </div>

                        <div>
                            <label className="text-lg font-semibold text-secondary-800 mb-2 block">Supporting Documents</label>
                            <div className="space-y-3">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-secondary-50 rounded-lg border">
                                        <Paperclip className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                                        <p className="text-sm font-medium text-secondary-800 flex-1 truncate">{doc.file.name}</p>
                                        <select value={doc.type} onChange={(e) => handleDocTypeChange(index, e.target.value)} className="p-2 border border-secondary-300 rounded-md bg-white text-sm">
                                            {documentTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        <Button type="button" variant="destructive" size="sm" className="p-2 h-9 w-9" onClick={() => removeDocument(index)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()} className="mt-4">
                                <PlusCircle className="w-4 h-4 mr-2"/> Add Documents
                            </Button>
                        </div>
                        
                        <div>
                            <label className="text-lg font-semibold text-secondary-800 mb-2 block">Additional Information (Optional)</label>
                            <textarea
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                rows="4"
                                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Is there anything else you'd like the hiring manager to know?"
                            />
                        </div>

                        <div className="pt-6 border-t flex justify-end">
                            <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting}>
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobApplicationForm;

