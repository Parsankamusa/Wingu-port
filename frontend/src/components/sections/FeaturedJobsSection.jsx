import React, { useState, useEffect } from 'react';
import JobCard from '../ui/JobCard';
import Button from '../common/Button';
import { Search, Loader, Briefcase } from 'lucide-react';
import authService from '../../api/authService';
import jobSearchApi from '../../api/jobSearch';

const FeaturedJobsSection = ({ onNavigate }) => {
    const [jobs, setJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                setLoading(true);
                const response = await jobSearchApi.searchJobs({ ordering: 'newest', page_size: 6 });
                const jobsData = response.data.results || [];
                setJobs(jobsData);
                setTotalJobs(response.data.count || jobsData.length);
            } catch (err) {
                setError('Could not load featured jobs at this time.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedJobs();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">{error}</div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        onNavigate={onNavigate} 
                    />
                ))}
            </div>
        );
    };

    return (
        <section id="jobs" className="py-20 bg-secondary-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">Featured Opportunities</h2>
                    <p className="text-lg text-secondary-600 max-w-2xl mx-auto">Hand-picked aviation positions from leading companies worldwide.</p>
                </div>

                {renderContent()}

                {!loading && !error && jobs.length > 0 && (
                    <div className="text-center mt-16">
                        <Button variant="primary" size="lg" onClick={() => onNavigate('/job-search')} icon={<Search />}>
                            Explore All {totalJobs > 0 ? totalJobs : ''} Jobs
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

const JobCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
        <div className="flex items-start space-x-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-full"></div>
            </div>
        </div>
        <div className="space-y-3 mt-6">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
        </div>
    </div>
);


export default FeaturedJobsSection;
