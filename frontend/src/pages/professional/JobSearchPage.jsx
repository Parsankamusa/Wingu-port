import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Heart, Briefcase, DollarSign, Clock, ArrowRight, Building, Loader, ArrowLeft, X } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import SearchForm from './jobs/components/SearchForm';
import SideFilters from './jobs/components/SideFilters copy';
import jobSearchApi from '../../api/jobSearch';




const JobCard = ({ job, onNavigate, isSaved, onSaveToggle }) => {
    const timeSince = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        return "Today";
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Competitive Salary';
        const format = (num) => `$${(parseFloat(num) / 1000).toFixed(0)}K`;
        if (min && max) return `${format(min)} - ${format(max)}`;
        return `Up to ${format(min || max)}`;
    };

    return (
        <div 
            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer relative overflow-hidden" 
            onClick={() => onNavigate(`/job-details/${job.id}`)}
        >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-primary-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center font-bold text-primary-600 text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {job.recruiter_name ? job.recruiter_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-primary-600 mb-1">{job.recruiter_name || 'Aviation Company'}</p>
                            <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-700 line-clamp-2">{job.title}</h3>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onSaveToggle(); }} className={`p-2 rounded-full transition-all duration-200 ${isSaved ? 'text-red-500 bg-red-100' : 'text-secondary-400 opacity-0 group-hover:opacity-100 hover:bg-secondary-100'}`}>
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-secondary-600 gap-x-4 gap-y-1 mt-3">
                        <span className="flex items-center"><MapPin size={14} className="mr-1.5"/>{job.location}</span>
                        <span className="flex items-center"><Briefcase size={14} className="mr-1.5"/>{job.job_type}</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1.5"/>{timeSince(job.created_at)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-green-600 font-semibold text-sm flex items-center"><DollarSign size={14} className="mr-1.5"/>{formatSalary(job.salary_min, job.salary_max)}</span>
                <span className="text-primary-600 font-semibold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details <ArrowRight size={14} className="ml-1" />
                </span>
            </div>
        </div>
    );
};

const JobSearchPage = ({ onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [savedJobsMap, setSavedJobsMap] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        department: '',
        job_type: [],
        experience_level: [],
        is_remote: false,
        aircraft_type: ""
    });
    const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, currentPage: 1 });

    const fetchSavedJobs = useCallback(async () => {
        try {
            const response = await authService.getSavedSearches();
            const newMap = new Map();
            response.data.forEach(savedSearch => {
                const jobIdMatch = savedSearch.query.match(/job_id:(\d+)/);
                if (jobIdMatch) {
                    newMap.set(parseInt(jobIdMatch[1], 10), savedSearch.id);
                }
            });
            setSavedJobsMap(newMap);
        } catch (err) {
            console.error("Could not fetch saved jobs list.");
        }
    }, []);

    const fetchJobs = useCallback(async (searchParams) => {
        setError(null)
        try {
            setLoading(true);
            const response = await jobSearchApi.searchJobs(searchParams);
            setJobs(response.data.results || []);
            setPagination(prev => ({
                ...prev,
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
            }));
        } catch (err) {
            console.error(err)
            setError("Failed to load job listings. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedJobs();
    }, [fetchSavedJobs]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page') || '1', 10);

        const newFilters = {
            query: params.get('query') || '',
            location: params.get('location') || '',
            department: params.get('department') || '',
            job_type: params.get('job_type')?.split(',') || [],
            experience_level: params.get('experience_level')?.split(',') || [],
            is_remote: params.get('is_remote') === 'true',
            aircraft_type: params.get("aircraft_type") || "",
        };

        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: page }));

        const apiParams = {};
        for (const key in newFilters) {
            if (newFilters[key] && newFilters[key].length > 0) {
                apiParams[key] = Array.isArray(newFilters[key]) ? newFilters[key].join(',') : newFilters[key];
            }
        }
        apiParams.page = page;
        
        fetchJobs(apiParams);
    }, [location.search, fetchJobs]);
    
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field, value) => {
        setFilters(prev => {
            const newValues = prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value];
            return { ...prev, [field]: newValues };
        });
        // applyFilters();
    };

    console.log("filters", filters)

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value.length > 0) {
                 params.set(key, Array.isArray(value) ? value.join(',') : value);
            }
        });
        params.set('page', '1');
        navigate(`?${params.toString()}`);
    };

    const resetFilters = () => {
        navigate('?');
    };
    
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(location.search);
        params.set('page', newPage);
        navigate(`?${params.toString()}`);
    };
    
    const handleSaveToggle = async (job) => {
        const isSaved = savedJobsMap.has(job.id);
        const newMap = new Map(savedJobsMap);

        if (isSaved) {
            const savedSearchId = savedJobsMap.get(job.id);
            newMap.delete(job.id);
            setSavedJobsMap(newMap);
            try {
                await authService.unsaveJob(savedSearchId);
            } catch (err) {
                newMap.set(job.id, savedSearchId);
                setSavedJobsMap(newMap); // Revert on failure
            }
        } else {
            // Optimistically set a temporary value
            newMap.set(job.id, 'saving...');
            setSavedJobsMap(newMap);
            try {
                const response = await authService.saveJob(job);
                newMap.set(job.id, response.data.id);
                setSavedJobsMap(newMap);
            } catch (err) {
                newMap.delete(job.id);
                setSavedJobsMap(newMap); // Revert on failure
            }
        }
    };
    

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <SearchForm applyFilters={applyFilters} filters={filters} handleFilterChange={handleFilterChange} />

                <div className="grid lg:grid-cols-12 gap-8">
                    <SideFilters filters={filters} handleCheckboxChange={handleCheckboxChange} handleFilterChange={handleFilterChange} resetFilters={resetFilters} applyFilters={applyFilters} />
                    <main className="lg:col-span-8 xl:col-span-9">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Showing {pagination.count} Job Openings</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <Loader className="w-12 h-12 text-primary-500 animate-spin"/>
                                <p className="mt-4 text-secondary-600">Loading opportunities...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-red-50 rounded-2xl">
                                <p className="text-red-600 font-semibold">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {jobs.length > 0 ? jobs.map(job => (
                                    <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        onNavigate={onNavigate} 
                                        isSaved={savedJobsMap.has(job.id)}
                                        onSaveToggle={() => handleSaveToggle(job)}
                                    />
                                )) : (
                                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                                        <Building className="w-16 h-16 mx-auto text-secondary-300"/>
                                        <h3 className="mt-4 text-xl font-semibold">No Jobs Found</h3>
                                        <p className="mt-2 text-secondary-600">Try adjusting your search terms or check back later.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {pagination.count > 0 && jobs.length > 0 && (
                            <div className="mt-8 flex justify-between items-center">
                                <Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.previous} variant="secondary" icon={<ArrowLeft size={16}/>}>Previous</Button>
                                <span className="text-sm text-gray-600">Page {pagination.currentPage}</span>
                                <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.next} variant="secondary" icon={<ArrowRight size={16}/>} iconPosition="right">Next</Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};


export default JobSearchPage;

