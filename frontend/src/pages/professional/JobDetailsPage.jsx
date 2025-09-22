import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Heart, Share2, CheckCircle, Users, Clock, Building, Loader, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import jobSearchApi from '../../api/jobSearch';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savedId, setSavedId] = useState(null);

    const fetchJobDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await jobSearchApi.getJobDetails(jobId);
            setJob(response.data);
        } catch (err) {
            setError('Failed to load job details. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    const checkIsSaved = useCallback(async () => {
        try {
            const response = await authService.getSavedSearches();
            const savedItem = response.data.find(item => item.query === `job_id:${jobId}`);
            if (savedItem) {
                setIsSaved(true);
                setSavedId(savedItem.id);
            }
        } catch (error) {
            // Silently fail, as this is not critical functionality
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobDetails();
        checkIsSaved();
    }, [fetchJobDetails, checkIsSaved]);

    const handleSaveToggle = async () => {
        if (isSaved) {
            try {
                await authService.unsaveJob(savedId);
                setIsSaved(false);
                setSavedId(null);
            } catch (error) {
                // handle error silently for now
            }
        } else {
            try {
                const response = await authService.saveJob({ id: job.id, title: job.title });
                setIsSaved(true);
                setSavedId(response.data.id);
            } catch (error) {
                // handle error silently
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute inset-0"></div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 mb-6 text-lg">{error || 'Job not found.'}</p>
                    <Button onClick={() => navigate('/job-search')} variant="primary">Back to Jobs</Button>
                </div>
            </div>
        );
    }

    const { title, company_name, location, salary_range, job_type, experience_level, description, responsibilities, qualifications, created_at, days_ago, days_until_expiry } = job;
    
    return (
        <div className="bg-secondary-50">
            <div className="container mx-auto py-8 px-4">
                <Button variant="link" onClick={() => navigate('/job-search')} className="mb-6 text-secondary-600 hover:text-primary-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
                </Button>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <main className="lg:col-span-8 space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center font-bold text-primary-600 text-2xl flex-shrink-0">
                                    {company_name ? company_name.charAt(0) : 'C'}
                                </div>
                                <div>
                                    <p className="text-primary-600 font-semibold">{company_name || 'Aviation Company'}</p>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{title}</h1>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-secondary-600 text-sm mt-6 pt-6 border-t border-gray-100">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-primary-500" /> {location}</span>
                                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 text-primary-500" /> {job_type}</span>
                                <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-primary-500" /> {experience_level}</span>
                                <span className="flex items-center font-semibold text-green-600"><DollarSign className="w-4 h-4 mr-1.5 text-green-500" /> {salary_range}</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                            <Section title="Job Description">
                                <p className="text-secondary-700 leading-relaxed">{description}</p>
                            </Section>
                            <Section title="Key Responsibilities">
                                <ul className="space-y-3">
                                    {responsibilities?.split('\n').map((item, i) => item.trim() && <ListItem key={i}>{item}</ListItem>)}
                                </ul>
                            </Section>
                             <Section title="Qualifications">
                                <ul className="space-y-3">
                                    {qualifications?.split('\n').map((item, i) => item.trim() && <ListItem key={i}>{item}</ListItem>)}
                                </ul>
                            </Section>
                        </div>
                    </main>

                    <aside className="lg:col-span-4 space-y-6 sticky top-24">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Button size="lg" onClick={() => navigate(`/job-application/${job.id}`)} className="flex-1">Apply Now</Button>
                                <Button 
                                    variant={isSaved ? "primary" : "secondary"}
                                    size="lg" 
                                    className="p-3"
                                    onClick={handleSaveToggle}
                                >
                                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current text-white' : ''}`}/>
                                </Button>
                                <Button variant="secondary" size="lg" className="p-3"><Share2 className="w-5 h-5"/></Button>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold text-lg mb-4">Job Information</h3>
                            <ul className="space-y-3 text-sm">
                                <InfoRow label="Posted On" value={`${days_ago} days ago`} />
                                <InfoRow label="Expires In" value={days_until_expiry ? `${days_until_expiry} days` : 'N/A'} />
                                <InfoRow label="Job ID" value={`#${String(job.id).padStart(6, '0')}`} />
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-8 last:mb-0">
        <h3 className="text-xl font-bold text-secondary-800 mb-4 pb-2 border-b-2 border-primary-100">{title}</h3>
        {children}
    </div>
);

const ListItem = ({ children }) => (
    <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0"/>
        <span className="text-secondary-700">{children}</span>
    </li>
);

const InfoRow = ({ label, value }) => (
    <li className="flex justify-between items-center bg-secondary-50 p-2 rounded-md">
        <span className="text-secondary-600">{label}</span>
        <span className="font-semibold text-secondary-800">{value}</span>
    </li>
);

export default JobDetailsPage;

