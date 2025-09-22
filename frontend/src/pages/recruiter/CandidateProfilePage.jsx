import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, Mail, Phone, FileText, Download, MessageSquare, Video, Loader, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';

const CandidateProfilePage = () => {
    const { candidateId: applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                setLoading(true);
                const { data } = await authService.getApplicationDetails(applicationId);
                setApplication(data);
            } catch (err) {
                setError("Failed to load application details.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicationDetails();
    }, [applicationId]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const { data } = await authService.updateApplicationStatus(applicationId, { status: newStatus });
            setApplication(data);
        } catch (err) {
            setError("Failed to update status.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
                <Loader className="w-12 h-12 text-primary-500 animate-spin"/>
            </div>
        );
    }
    
    if (error || !application) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 text-center">
                 <div className="bg-white p-8 rounded-2xl shadow-lg border max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-secondary-800">Error Loading Profile</h2>
                    <p className="text-red-600 mt-2">{error || 'Could not find application data.'}</p>
                    <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
                </div>
            </div>
        );
    }

    const { applicant_details: applicant, job_details: job, cover_letter, documents } = application;

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <Button variant="link" onClick={() => navigate(-1)} className="flex items-center text-secondary-600 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Applications
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border">
                            <div className="flex items-start space-x-6">
                                <img src={applicant?.profile_picture || `https://placehold.co/100x100/E2E8F0/475569?text=${applicant?.full_name?.charAt(0)}`} alt={applicant?.full_name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold">{applicant?.full_name}</h1>
                                    <p className="text-xl text-primary-600 font-semibold">{applicant?.specialization || 'Aviation Professional'}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-secondary-600">
                                       <span className="flex items-center text-sm"><MapPin className="w-4 h-4 mr-1.5" /> {applicant?.location || 'Location not specified'}</span>
                                       <span className="flex items-center text-sm"><Briefcase className="w-4 h-4 mr-1.5" /> {applicant?.experience_years ? `${applicant.experience_years} years experience` : 'Experience not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Section title="Cover Letter">
                            <p className="text-secondary-700 leading-relaxed whitespace-pre-line">{cover_letter}</p>
                        </Section>
                        <Section title="Documents">
                            <div className="space-y-3">
                                {documents && documents.length > 0 ? documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-primary-600"/>
                                            <div>
                                                <p className="font-semibold text-sm">{doc.name}</p>
                                                <p className="text-xs text-gray-500">{doc.document_type.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200"><Download size={16}/></a>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No documents were submitted with this application.</p>}
                            </div>
                        </Section>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold mb-4">Contact</h3>
                            <div className="space-y-3">
                                <span className="flex items-center text-sm"><Mail className="w-4 h-4 mr-2" /> {applicant?.email}</span>
                                <span className="flex items-center text-sm"><Phone className="w-4 h-4 mr-2" /> {applicant?.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold mb-4">Application for</h3>
                            <p className="font-semibold text-primary-700">{job?.title}</p>
                            <p className="text-sm text-gray-600">{job?.recruiter_details?.company_name}</p>
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Button fullWidth variant="outline" icon={<MessageSquare size={16}/>}>Message Applicant</Button>
                                <Button fullWidth variant="outline" icon={<Video size={16}/>}>Schedule Interview</Button>
                                <select onChange={(e) => handleStatusUpdate(e.target.value)} value={application.status} className="w-full p-2.5 border rounded-lg bg-gray-50">
                                    <option value="submitted">Submitted</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="offer_extended">Offer</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
    </div>
);

export default CandidateProfilePage;

