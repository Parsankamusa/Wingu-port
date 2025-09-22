import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Clock, FileText, Loader, AlertCircle, ChevronDown, ChevronUp, Trash2, MapPin, Calendar, DollarSign, Star, TrendingUp, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';

const getStatusInfo = (status) => {
    switch (status) {
        case 'submitted': return { text: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Send };
        case 'under_review': return { text: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
        case 'shortlisted': return { text: 'Shortlisted', color: 'bg-purple-100 text-purple-800', icon: Star };
        case 'interview': return { text: 'Interview', color: 'bg-indigo-100 text-indigo-800', icon: Calendar };
        case 'offer_extended': return { text: 'Offer Extended', color: 'bg-green-100 text-green-800', icon: TrendingUp };
        case 'hired': return { text: 'Hired', color: 'bg-green-100 text-green-800 font-bold', icon: Star };
        case 'rejected': return { text: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle };
        case 'withdrawn': return { text: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: Clock };
        default: return { text: status, color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
};

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
    return "Today";
};

const ApplicationCard = ({ app, onExpand, expandedData, setAppToWithdraw, navigate }) => {
    const isExpanded = expandedData && expandedData.id === app.id;
    const currentAppData = isExpanded ? { ...app, ...expandedData } : app;
    const job = currentAppData.job;
    const jobExists = job && job.id;
    const statusInfo = getStatusInfo(app.status);

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Not Disclosed';
        const format = (num) => `$${(parseFloat(num) / 1000).toFixed(0)}K`;
        if (min && max) return `${format(min)} - ${format(max)}`;
        return `Up to ${format(min || max)}`;
    };

    return (
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary-200 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            
            <div className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-secondary-50/50 hover:to-primary-50/20 transition-all duration-300" onClick={() => onExpand(app.id)}>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    <div className={`w-6 h-6 rounded-full ${statusInfo.color} border-2 border-white flex items-center justify-center`}>
                                        <statusInfo.icon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl text-secondary-900 mb-2 group-hover:text-primary-700 transition-colors duration-300 line-clamp-1">
                                    {job?.title || 'Job posting unavailable'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2 text-primary-500" />
                                        <span className="font-medium">{job?.recruiter_name || 'Aviation Company'}</span>
                                    </div>
                                    {job?.location && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                                            <span>{job.location}</span>
                                        </div>
                                    )}
                                    {job?.job_type && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 capitalize">
                                            {job.job_type.replace('-', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="min-w-0">
                                <p className="text-xs text-secondary-500 mb-2 font-medium uppercase tracking-wider">Status</p>
                                <span className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold shadow-sm ${statusInfo.color} transition-all duration-300`}>
                                    <statusInfo.icon className="w-3 h-3 mr-1" />
                                    {statusInfo.text}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-secondary-500 mb-2 font-medium uppercase tracking-wider">Applied</p>
                                <div className="flex items-center justify-center font-semibold text-secondary-800">
                                    <Clock className="w-4 h-4 mr-2 text-primary-500" />
                                    <span className="text-sm">{timeSince(app.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-2 rounded-xl bg-secondary-100 group-hover:bg-primary-100 transition-colors duration-300">
                            {isExpanded ? 
                                <ChevronUp className="w-5 h-5 text-secondary-600 group-hover:text-primary-600" /> : 
                                <ChevronDown className="w-5 h-5 text-secondary-600 group-hover:text-primary-600" />
                            }
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t bg-gradient-to-br from-secondary-50/80 to-primary-50/20 animate-in fade-in-5 duration-300">
                    {expandedData.isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3"/>
                                <p className="text-sm text-secondary-600">Loading application details...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-secondary-800">Application Details</h4>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <h5 className="font-semibold text-secondary-800 mb-4 text-sm uppercase tracking-wider">Job Information</h5>
                                        <div className="space-y-4">
                                            <DetailItem icon={MapPin} label="Location" value={job?.location} />
                                            <DetailItem icon={Calendar} label="Job Type" value={job?.job_type} capitalize />
                                            <DetailItem icon={DollarSign} label="Salary Range" value={formatSalary(job?.salary_min, job?.salary_max)} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <h5 className="font-semibold text-secondary-800 mb-4 text-sm uppercase tracking-wider">Cover Letter</h5>
                                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-lg border border-primary-100">
                                        <p className="text-sm text-secondary-700 italic leading-relaxed line-clamp-6">
                                            "{expandedData.cover_letter || 'No cover letter submitted with this application.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button 
                                            size="sm" 
                                            onClick={() => navigate(`/job-details/${job.id}`)} 
                                            disabled={!jobExists}
                                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Job Posting
                                        </Button>
                                        
                                        {app.status !== 'withdrawn' && app.status !== 'rejected' && (
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => setAppToWithdraw(app)}
                                                className="shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2"/>
                                                Withdraw Application
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {!jobExists && (
                                        <div className="flex items-center text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                            <AlertCircle className="w-3 h-3 mr-2" />
                                            Original job posting may have been removed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, capitalize = false }) => (
    <div className="flex items-start group">
        <div className="p-2 bg-primary-100 rounded-lg mr-3 group-hover:bg-primary-200 transition-colors duration-300">
            <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className={`font-semibold text-secondary-800 ${capitalize ? 'capitalize' : ''} truncate`}>
                {value?.toString().replace(/-/g, ' ') || 'Not specified'}
            </p>
        </div>
    </div>
);

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedData, setExpandedData] = useState({ id: null, isLoading: false });
    const [appToWithdraw, setAppToWithdraw] = useState(null);
    const navigate = useNavigate();

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authService.getMyApplications();
            setApplications(response.data.results || []);
        } catch (err) {
            setError('Failed to load your applications. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleExpand = useCallback(async (appId) => {
        if (expandedData.id === appId) {
            setExpandedData({ id: null, isLoading: false });
            return;
        }

        setExpandedData({ id: appId, isLoading: true });
        try {
            const response = await authService.getApplicationDetails(appId);
            
            setApplications(prev => prev.map(app => 
                app.id === appId ? { ...app, job: response.data.job } : app
            ));

            setExpandedData({ ...response.data, id: appId, isLoading: false });
        } catch (err) {
            setError('Could not fetch application details.');
            setExpandedData({ id: appId, isLoading: false });
        }
    }, [expandedData.id]);

    const handleWithdraw = async () => {
        if (!appToWithdraw) return;
        try {
            await authService.withdrawApplication(appToWithdraw.id);
            setApplications(prev => prev.map(app => 
                app.id === appToWithdraw.id ? { ...app, status: 'withdrawn' } : app
            ));
            setExpandedData({ id: null, isLoading: false });
        } catch (err) {
            setError('Failed to withdraw application.');
        } finally {
            setAppToWithdraw(null);
        }
    };

    const getStats = () => {
        const total = applications.length;
        const active = applications.filter(app => 
            !['withdrawn', 'rejected', 'hired'].includes(app.status)
        ).length;
        const interviews = applications.filter(app => app.status === 'interview').length;
        
        return { total, active, interviews };
    };

    const stats = getStats();

    return (
        <div className="bg-gradient-to-br from-secondary-50 to-primary-50/20 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-secondary-900">My Applications</h1>
                            <p className="mt-2 text-lg text-secondary-600">Track your career journey and application progress</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {!loading && applications.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-600 mb-2">Total Applications</p>
                                        <p className="text-3xl font-bold text-secondary-900">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Send className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-600 mb-2">Active Applications</p>
                                        <p className="text-3xl font-bold text-secondary-900">{stats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-600 mb-2">Interviews</p>
                                        <p className="text-3xl font-bold text-secondary-900">{stats.interviews}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center shadow-sm">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="relative">
                            <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4"/>
                            <div className="text-lg font-medium text-secondary-600">Loading your applications...</div>
                            <div className="text-sm text-secondary-500 mt-2">Please wait while we fetch your data</div>
                        </div>
                    </div>
                ) : applications.length === 0 ? (
                    /* Empty State */
                    <div className="text-center bg-white p-16 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-800 mb-3">No Applications Found</h3>
                            <p className="text-secondary-600 mb-8 max-w-md mx-auto leading-relaxed">
                                You haven't applied for any jobs yet. Start exploring exciting opportunities in aviation and take the next step in your career!
                            </p>
                            <Button 
                                onClick={() => navigate('/job-search')}
                                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3"
                            >
                                <Briefcase className="w-5 h-5 mr-2" />
                                Explore Job Opportunities
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Applications List */
                    <div className="space-y-6">
                        {applications.map(app => (
                            <ApplicationCard
                                key={app.id}
                                app={app}
                                onExpand={handleExpand}
                                expandedData={expandedData}
                                setAppToWithdraw={setAppToWithdraw}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal Confirmation Modal */}
            {appToWithdraw && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary-900">Confirm Withdrawal</h3>
                            </div>
                            
                            <p className="text-secondary-700 mb-2 leading-relaxed">
                                Are you sure you want to withdraw your application for:
                            </p>
                            <p className="font-semibold text-secondary-900 bg-secondary-50 p-3 rounded-lg mb-6 border border-secondary-200">
                                "{appToWithdraw.job?.title}"
                            </p>
                            <p className="text-sm text-secondary-600 mb-8">
                                This action cannot be undone, and you'll need to reapply if you change your mind.
                            </p>
                            
                            <div className="flex gap-3">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => setAppToWithdraw(null)}
                                    className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleWithdraw}
                                    className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Yes, Withdraw
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;