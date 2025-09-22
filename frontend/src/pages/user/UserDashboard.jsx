import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Briefcase, FileText, Heart, ArrowRight, BarChart2, Send, Loader, CheckCircle, X, Star, Calendar, MapPin, Building, TrendingUp, Eye, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';
import jobPostingApi from '../../api/jobPosting';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [profileLoading, setProfileLoading] = useState(true);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isCompletionDismissed, setIsCompletionDismissed] = useState(false);

    useEffect(() => {
        const dismissedUntil = localStorage.getItem('completionMessageDismissedUntil');
        if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil, 10)) {
            setIsCompletionDismissed(true);
        }

        if (user?.role === 'professional') {
            const fetchProfile = async () => {
                setProfileLoading(true);
                try {
                    const { data } = await authService.getProfessionalProfile();
                    calculateProfileCompletion(data);
                } catch (error) {
                    // On failure, we'll just show 0% completion, which is a stable state
                    calculateProfileCompletion(null);
                } finally {
                    setProfileLoading(false);
                }
            };
            const fetchStats = async () => {
                setStatsLoading(true);
                try {
                    const { data } = await authService.getApplicationStats();
                    setStats(data);
                } catch (error) {
                     // Set empty stats on failure to prevent crash and avoid logging error to console
                     setStats({ total_applications: 0, active_applications: 0, status_breakdown: {}, recent_activity: [] });
                } finally {
                    setStatsLoading(false);
                }
            };
            fetchProfile();
            fetchStats();
        } else {
            setProfileCompletion(100);
            setProfileLoading(false);
            setStatsLoading(false);
        }
        fetchJobs();
    }, [user]);

    const fetchJobs = async () => {
        try {
            setJobsLoading(true);
            const response = await jobPostingApi.getRecommendedJobs();
            const jobsData = response.data.matches || response.data || [];
            setRecommendedJobs(jobsData.slice(0, 3));
        } catch (error) {
            // Avoid logging error to console and set an empty array on failure
            setRecommendedJobs([]);
        } finally {
            setJobsLoading(false);
        }
    };

    const calculateProfileCompletion = (profileData) => {
        if (!profileData) {
            setProfileCompletion(0);
            return;
        }
        
        const fields = [
            { value: profileData.full_name, weight: 10 },
            // Safely access nested properties
            { value: profileData.personal_info?.phone_number, weight: 15 },
            { value: profileData.personal_info?.professional_bio, weight: 20 },
            { value: profileData.experience?.current_job_title, weight: 15 },
            { value: profileData.experience?.years_of_experience, weight: 10 },
            { value: profileData.documents?.cv, weight: 15 },
            { value: profileData.documents?.aviation_licenses, weight: 15 },
        ];
        
        const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
        const completedWeight = fields
            .filter(field => field.value && String(field.value).trim() !== '')
            .reduce((sum, field) => sum + field.weight, 0);

        const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
        setProfileCompletion(percentage);
    };
    
    const handleDismissCompletion = () => {
        const oneWeekFromNow = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('completionMessageDismissedUntil', oneWeekFromNow.toString());
        setIsCompletionDismissed(true);
    };

    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        return `Good ${timeOfDay}, ${user?.first_name || user?.full_name?.split(' ')[0] || 'there'}!`;
    };

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mr-3">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-secondary-900">{getWelcomeMessage()}</h1>
                            </div>
                            <p className="text-secondary-600 text-lg">Ready to take the next step in your career journey?</p>
                        </div>
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-secondary-500">Member since</p>
                                <p className="font-semibold text-secondary-700">{new Date(user?.date_joined || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{(user?.first_name?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        {profileLoading ? (
                            <ProfileCompletionSkeleton />
                        ) : profileCompletion < 100 ? (
                            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                                <div className="relative z-10">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg">Complete Your Profile</h3>
                                            <p className="text-primary-100 text-sm mt-1">Unlock better job matches and increase your visibility</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                                            <div 
                                                className="bg-gradient-to-r from-white to-primary-100 h-3 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${profileCompletion}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-3">
                                            <span className="text-primary-100">Profile Completion</span>
                                            <span className="font-bold text-white text-lg">{profileCompletion}%</span>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => navigate('/manage-profile')} 
                                        className="bg-white !text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all duration-300 w-full mt-6 font-semibold"
                                    >
                                        {/* <div className='flex flex-row gap-2 text-primary-600 hover:text-gray-50'> */}
                                        <Zap className="w-4 h-4 mr-2" />
                                        <span>Update Profile</span>

                                        {/* </div> */}
                                    </Button>

                                    
                                </div>
                            </div>
                        ) : !isCompletionDismissed && (
                            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <button 
                                    onClick={handleDismissCompletion} 
                                    className="absolute top-3 right-3 p-1 text-white/70 hover:text-white rounded-full transition-colors hover:bg-white/20"
                                >
                                    <X size={18} />
                                </button>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="relative z-10">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Profile Complete!</h3>
                                            <p className="text-green-100 text-sm mt-1">Your profile is optimized and ready for employers to discover.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b">
                                <h3 className="font-bold text-lg text-primary-900 mb-1">Quick Actions</h3>
                                <p className="text-primary-600 text-sm">Navigate your career journey</p>
                            </div>
                            <div className="p-4 space-y-2">
                                <QuickActionButton 
                                    onClick={() => navigate('/job-search')} 
                                    icon={Briefcase} 
                                    label="Find Jobs" 
                                    description="Discover new opportunities"
                                    color="blue"
                                />
                                <QuickActionButton 
                                    onClick={() => navigate('/my-applications')} 
                                    icon={FileText} 
                                    label="My Applications" 
                                    description="Track your progress"
                                    color="green"
                                />
                                <QuickActionButton 
                                    onClick={() => navigate('/saved-jobs')} 
                                    icon={Heart} 
                                    label="Saved Jobs" 
                                    description="Review your favorites"
                                    color="purple"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="font-bold text-lg text-secondary-900 mb-4">Career Insights</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-blue-800">Market Trend</span>
                                    </div>
                                    <span className="text-blue-600 font-semibold">+12%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-green-800">Profile Score</span>
                                    </div>
                                    <span className="text-green-600 font-semibold">Excellent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {statsLoading ? <> <StatCardSkeleton /> <StatCardSkeleton /> </> : <>
                                <StatCard 
                                    icon={Eye} 
                                    value={stats?.status_breakdown?.interview || 0} 
                                    label="Interviews" 
                                    change="View your schedule"
                                    color="blue"
                                    onClick={() => navigate('/my-applications')}
                                />
                                <StatCard 
                                    icon={Send} 
                                    value={stats?.total_applications || 0}
                                    label="Applications Sent" 
                                    change={`${stats?.active_applications || 0} are active`}
                                    color="green"
                                    onClick={() => navigate('/my-applications')}
                                />
                            </>}
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-primary-900">Recommended For You</h2>
                                        <p className="text-primary-600 text-sm mt-1">Curated opportunities matching your profile</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate('/job-search')}
                                        className="border-primary-200 text-primary-700 hover:bg-primary-200"
                                    >
                                        View All
                                    </Button>
                                </div>
                            </div>
                            {jobsLoading ? (
                                <div className="p-12 text-center">
                                    <div className="relative">
                                        <Loader className="w-10 h-10 text-primary-500 animate-spin mx-auto"/>
                                        <div className="mt-4 text-secondary-600">Finding perfect matches...</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {recommendedJobs.map((job, index) => (
                                        <JobCard key={job.job.id} job={job.job} navigate={navigate} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-green-900">Recent Applications</h2>
                                        <p className="text-green-600 text-sm mt-1">Track your application status</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate('/my-applications')}
                                        className="border-green-200 text-green-700 hover:bg-green-200"
                                    >
                                        View All
                                    </Button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {statsLoading ? <div className="p-6 text-center text-sm text-secondary-500">Loading activities...</div> :
                                 stats?.recent_activity?.length > 0 ? (
                                    stats.recent_activity.map((app, index) => (
                                        <ApplicationCard key={`${app.application_id}-${app.timestamp}-${index}`} application={app} navigate={navigate}/>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-sm text-secondary-500">No recent application activity.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileCompletionSkeleton = () => (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-pulse">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
            <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl w-12 h-12"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-white/30 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                </div>
            </div>
            <div className="mt-6">
                <div className="w-full bg-white/20 rounded-full h-3"></div>
                <div className="flex items-center justify-between mt-3">
                    <div className="h-4 bg-white/20 rounded w-1/3"></div>
                    <div className="h-5 bg-white/30 rounded w-1/4"></div>
                </div>
            </div>
            <div className="bg-white/30 h-12 rounded-lg w-full mt-6"></div>
        </div>
    </div>
);

const JobCard = ({ job, navigate, index }) => (
    <div className="group p-6 hover:bg-gray-50 transition-all duration-300 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
            <div className="flex-1">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg text-secondary-800 group-hover:text-primary-700 transition-colors duration-300">
                            {job.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-secondary-600">
                            <div className="flex items-center">
                                <Building className="w-4 h-4 mr-1" />
                                {job.recruiter_name}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location}
                            </div>
                            {job.job_type && (
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {job.job_type}
                                </div>
                            )}
                        </div>
                        {job.salary_min && job.salary_max && (
                            <div className="mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    ${job.salary_min} - ${job.salary_max}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right text-sm text-secondary-500">
                    <div>Posted {new Date(job.created_at).toLocaleDateString()}</div>
                    {job.applicants_count && (
                        <div className="font-medium">{job.applicants_count} applicants</div>
                    )}
                </div>
                <Button 
                    size="sm" 
                    onClick={() => navigate(`/job-details/${job.id}`)}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Apply Now
                </Button>
            </div>
        </div>
    </div>
);

const ApplicationCard = ({ application, navigate }) => (
    <div className="p-6 hover:bg-gray-50 transition-colors duration-300 group cursor-pointer" onClick={() => navigate('/my-applications')}>
        <div className="flex justify-between items-center">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary-800 group-hover:text-primary-700 transition-colors duration-300">
                            {application.job_title}
                        </h4>
                        <p className="text-sm text-secondary-600 mt-1">{application.description}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <span className="text-xs text-gray-500">{new Date(application.timestamp).toLocaleDateString()}</span>
                <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-secondary-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>
        </div>
    </div>
);

const StatCard = ({ icon: Icon, value, label, change, color, onClick }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-600',
            text: 'text-blue-800',
            change: 'text-blue-600'
        },
        green: {
            bg: 'bg-green-50',
            iconBg: 'bg-green-600',
            text: 'text-green-800',
            change: 'text-green-600'
        }
    };

    const colors = colorClasses[color];
    const isClickable = !!onClick;

    return (
        <div 
            onClick={onClick}
            className={`${colors.bg} border-2 border-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${isClickable ? 'cursor-pointer hover:border-primary-200' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white"/>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-secondary-600">{label}</p>
                </div>
            </div>
            <div className="space-y-2">
                <p className={`text-4xl font-bold ${colors.text} group-hover:scale-105 transition-transform duration-300`}>
                    {value}
                </p>
                <p className={`text-sm font-medium ${colors.change}`}>
                    {change}
                </p>
            </div>
        </div>
    );
};
const StatCardSkeleton = () => (
    <div className="bg-gray-100 border-2 border-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-300 rounded-xl w-12 h-12"></div>
        </div>
        <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
    </div>
);

const QuickActionButton = ({ onClick, icon: Icon, label, description, color }) => {
    const colorClasses = {
        blue: 'group-hover:bg-blue-50 group-hover:text-blue-700',
        green: 'group-hover:bg-green-50 group-hover:text-green-700',
        purple: 'group-hover:bg-purple-50 group-hover:text-purple-700'
    };

    return (
        <button 
            onClick={onClick} 
            className={`group w-full flex justify-between items-center p-4 rounded-xl text-left transition-all duration-300 hover:shadow-md ${colorClasses[color]}`}
        >
            <div className="flex items-center flex-1">
                <div className="p-2 bg-secondary-100 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-secondary-600 group-hover:text-primary-600 transition-colors duration-300" />
                </div>
                <div>
                    <div className="font-semibold text-secondary-800 group-hover:text-primary-700 transition-colors duration-300">
                        {label}
                    </div>
                    <div className="text-xs text-secondary-500 mt-1">
                        {description}
                    </div>
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-secondary-600 transition-all duration-300 group-hover:translate-x-1" />
        </button>
    );
};

export default UserDashboard;