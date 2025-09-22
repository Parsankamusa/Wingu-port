import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';

const SavedJobsPage = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchSavedJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authService.getSavedSearches();
            setSavedJobs(response.data);
        } catch (err) {
            setError('Could not load your saved jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedJobs();
    }, [fetchSavedJobs]);

    const handleUnsave = async (savedSearchId) => {
        const originalJobs = [...savedJobs];
        setSavedJobs(prev => prev.filter(job => job.id !== savedSearchId));
        try {
            await authService.unsaveJob(savedSearchId);
        } catch (err) {
            setError('Failed to unsave job. Please try again.');
            setSavedJobs(originalJobs);
        }
    };

    const getJobIdFromQuery = (query) => {
        if (!query || !query.includes('job_id:')) return null;
        return query.split('job_id:')[1];
    };

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-secondary-900">Saved Jobs</h1>
                <p className="mt-2 text-secondary-600 mb-8">Review and manage your favorite job opportunities.</p>

                {loading ? (
                    <div className="text-center py-20"><Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto"/></div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 mr-3"/>{error}</div>
                ) : savedJobs.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-lg border">
                        <Heart className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
                        <h3 className="text-xl font-semibold text-secondary-800 mb-2">No Saved Jobs Yet</h3>
                        <p className="text-secondary-600 mb-6">Click the heart icon on a job listing to save it for later.</p>
                        <Button onClick={() => navigate('/job-search')}>Find Jobs</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedJobs.map(job => {
                            const jobId = getJobIdFromQuery(job.query);
                            return (
                                <div key={job.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-1">
                                        <button 
                                            onClick={() => jobId && navigate(`/job-details/${jobId}`)}
                                            disabled={!jobId}
                                            className="font-bold text-lg text-secondary-800 text-left hover:text-primary-600 disabled:hover:text-secondary-800 disabled:cursor-not-allowed"
                                        >
                                            {job.name}
                                        </button>
                                        <p className="text-sm text-secondary-500 mt-1">Saved on {new Date(job.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 self-end sm:self-center">
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => jobId && navigate(`/job-details/${jobId}`)}
                                            disabled={!jobId}
                                            icon={<ArrowRight className="w-4 h-4" />}
                                        >
                                            View Job
                                        </Button>
                                        <Button 
                                            variant="destructive"
                                            size="sm"
                                            className="p-2.5"
                                            onClick={() => handleUnsave(job.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobsPage;
