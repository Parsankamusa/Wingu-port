import React from 'react';
import { MapPin, Clock, Briefcase, DollarSign, ArrowRight, Heart } from 'lucide-react';

const JobCard = ({ job, onNavigate, isSaved, onSaveToggle }) => {
    
    const timeSince = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} years ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} months ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} hours ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutes ago`;
        return `${Math.floor(seconds)} seconds ago`;
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Competitive';
        const format = (num) => `$${(num / 1000).toFixed(0)}K`;
        if (min && max) return `${format(min)} - ${format(max)}`;
        return `Up to ${format(min || max)}`;
    };
    
    const handleNavigation = () => onNavigate(`/job-details/${job.id}`);
    
    const handleSaveToggle = (e) => {
        e.stopPropagation();
        if (onSaveToggle) {
            onSaveToggle(job.id);
        }
    };

    const companyName = job.company_name || job.recruiter_details?.company_name || job.recruiter_name || 'Aviation Company';

    return (
        <div 
            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer relative overflow-hidden" 
            onClick={handleNavigation}
        >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-primary-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center font-bold text-primary-600 text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-primary-600 mb-1">{companyName}</p>
                            <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-700 line-clamp-2">{job.title}</h3>
                        </div>
                        {onSaveToggle && (
                            <button onClick={handleSaveToggle} className={`p-2 rounded-full transition-all duration-200 ${isSaved ? 'text-red-500 bg-red-100' : 'text-secondary-400 opacity-0 group-hover:opacity-100 hover:bg-secondary-100'}`}>
                                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-secondary-600 gap-x-4 gap-y-1 mt-3">
                        <span className="flex items-center"><MapPin size={14} className="mr-1.5"/>{job.location}</span>
                        <span className="flex items-center"><Briefcase size={14} className="mr-1.5"/>{job.job_type}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-secondary-500">
                    <Clock size={12} className="mr-1.5"/>
                    Posted {timeSince(job.created_at)}
                </div>
                <span className="text-primary-600 font-semibold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details <ArrowRight size={14} className="ml-1" />
                </span>
            </div>
        </div>
    );
};

export default JobCard;
