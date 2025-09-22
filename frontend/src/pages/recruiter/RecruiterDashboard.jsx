import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Briefcase, Users, Eye, TrendingUp, Calendar, MapPin, DollarSign, ArrowLeft, ArrowRight, MoreVertical, Edit, Play, Pause, CheckCircle, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import jobPostingApi from '../../api/jobPosting';

const RecruiterDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 5;

  const [selectedJobs, setSelectedJobs] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const statsPromise = authService.getApplicationStats();
        
        let allJobPostings = [];
        let page = 1;
        let hasMorePages = true;
        while(hasMorePages) {
            const response = await jobPostingApi.getMyJobPostings(page);
            const jobsData = response.data.results || [];
            allJobPostings = [...allJobPostings, ...jobsData];
            if (response.data.next) {
                page++;
            } else {
                hasMorePages = false;
            }
        }

        const statsRes = await statsPromise;
        const statsData = statsRes.data;

        const jobsWithAppCounts = allJobPostings.map(job => ({
            ...job,
            applicants_count: statsData.job_breakdown?.[job.id]?.count || 0,
        }));
        
        setJobs(jobsWithAppCounts);
        setStats(statsData);

    } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const dashboardStats = useMemo(() => {
    if (loading || !stats) {
        return { totalJobs: 0, totalApplications: 0, newApplications: 0, avgConversion: '0.00' };
    }
    return {
        totalJobs: jobs.length,
        totalApplications: stats.total_applications || 0,
        newApplications: stats.new_applications || 0,
        avgConversion: 'N/A' // This data is not available from the backend
    };
  }, [jobs, stats, loading]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;
    if (activeTab !== 'all') {
      filtered = filtered.filter(job => job.status === activeTab);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term)
      );
    }
    return [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [jobs, activeTab, searchTerm]);

  const paginatedJobs = useMemo(() => {
      const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
      return filteredAndSortedJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [filteredAndSortedJobs, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / JOBS_PER_PAGE);

  const handleJobUpdate = (updatedJob) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? { ...job, ...updatedJob } : job));
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };
  
  const getWelcomeMessage = () => {
    if (!user) return "Welcome!";
    return `Welcome back, ${user.first_name || user.company_name || 'Recruiter'}!`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute inset-0"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-6 text-lg">{error}</p>
          <Button onClick={fetchData} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  const tabCounts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-secondary-900">{getWelcomeMessage()}</h1>
            </div>
            <p className="mt-2 text-secondary-600 text-lg">Here's a comprehensive overview of your job postings and recruitment metrics.</p>
          </div>
          <div className="mt-6 md:mt-0">
            <Button 
              variant="primary" 
              onClick={() => onNavigate('/post-job')} 
              icon={<Plus size={18} />}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Post New Job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Jobs" 
            value={dashboardStats.totalJobs} 
            change={`${jobs.filter(j => j.status === 'active').length} active`} 
            icon={<Briefcase className="w-7 h-7" />}
            bgColor="bg-blue-50"
            iconColor="bg-blue-600"
            textColor="text-blue-800"
            changeColor="text-blue-600"
            onClick={() => onNavigate('/manage-jobs')} 
          />
          <StatCard 
            title="Total Applications" 
            value={dashboardStats.totalApplications} 
            change={`+${dashboardStats.newApplications} new this week`} 
            icon={<Users className="w-7 h-7" />}
            bgColor="bg-green-50"
            iconColor="bg-green-600"
            textColor="text-green-800"
            changeColor="text-green-600"
            onClick={() => onNavigate('/view-applications/all')} 
          />
          <StatCard 
            title="Total Views" 
            value={"N/A"} 
            change={`Feature coming soon`}
            icon={<Eye className="w-7 h-7" />}
            bgColor="bg-purple-50"
            iconColor="bg-purple-600"
            textColor="text-purple-800"
            changeColor="text-purple-600"
          />
          <StatCard 
            title="Avg. Conversion" 
            value={`${dashboardStats.avgConversion}`} 
            change={`Feature coming soon`}
            icon={<TrendingUp className="w-7 h-7" />}
            bgColor="bg-indigo-50"
            iconColor="bg-indigo-600"
            textColor="text-indigo-800"
            changeColor="text-indigo-600"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
              <input 
                type="text" 
                placeholder="Search jobs by title, department, or location..." 
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-lg"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(tabCounts).map(([tab, count]) => (
                <button 
                  key={tab} 
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-primary-100 text-primary-700 shadow-md border-2 border-primary-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                  }`} 
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                >
                  {tab === 'all' ? 'All Jobs' : tab.charAt(0).toUpperCase() + tab.slice(1)} 
                  <span className="ml-2 bg-white px-2 py-1 rounded-full text-xs font-bold">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {paginatedJobs.length === 0 ? (
            <div className="bg-white text-center py-16 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Create your first job posting to get started with recruitment.</p>
            </div>
          ) : (
            paginatedJobs.map(job => 
              <JobPostingCard 
                key={job.id} 
                job={job} 
                onNavigate={onNavigate} 
                onUpdate={handleJobUpdate} 
                onSelect={handleSelectJob} 
                isSelected={selectedJobs.includes(job.id)} 
              />
            )
          )}
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <Button 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                disabled={currentPage === 1} 
                variant="secondary"
                icon={<ArrowLeft size={16}/>}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-secondary-600">Page</span>
                <span className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-lg">
                  {currentPage}
                </span>
                <span className="text-secondary-600">of {totalPages}</span>
              </div>
              <Button 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                disabled={currentPage === totalPages} 
                variant="secondary"
                icon={<ArrowRight size={16}/>}
                iconPosition="right"
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const JobPostingCard = ({ job, onNavigate, onUpdate, onSelect, isSelected }) => {
    const handleStatusToggle = async (e) => { 
      e.stopPropagation(); 
      const newStatus = job.status === 'active' ? 'draft' : 'active'; 
      try { 
        const response = await jobPostingApi.updateJobPosting(job.id, { status: newStatus }); 
        onUpdate(response.data); 
      } catch (error) { 
        console.error("Failed to toggle job status", error); 
      }
    };
    
    const handleCheckboxClick = (e) => { 
      e.stopPropagation(); 
      onSelect(job.id); 
    };
    
    const conversionRate = (job.views > 0 ? ((job.applicants_count || 0) / job.views) * 100 : 0).toFixed(2);

    return (
        <div 
          onClick={() => onNavigate(`/post-job?edit=${job.id}`)} 
          className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-6">
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={handleCheckboxClick} 
                  onClick={handleCheckboxClick} 
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all duration-300 scale-110" 
                />
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                      {job.title}
                    </h3>
                    {job.is_urgent && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : job.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-primary-500" />
                <span className="font-medium">{job.department || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" />
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary-500" />
                <span className="font-medium">{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-primary-500" />
                <span className="font-medium">{job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max}` : 'Not specified'}</span>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center hover:bg-blue-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-bold text-blue-800 mb-2">{job.applicants_count || 0}</p>
                <p className="text-blue-700 font-medium">Applicants</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center hover:bg-green-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-bold text-green-800 mb-2">{job.views || 0}</p>
                <p className="text-green-700 font-medium">Views</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl text-center hover:bg-purple-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-bold text-purple-800 mb-2">{conversionRate}%</p>
                <p className="text-purple-700 font-medium">Conversion</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center text-sm">
                {job.status === 'active' ? (
                  <>
                    <CheckCircle size={20} className="text-green-600 mr-3" />
                    <span className="text-green-700 font-semibold">Actively recruiting</span>
                  </>
                ) : (
                  <>
                    <Pause size={20} className="text-yellow-600 mr-3" />
                    <span className="text-yellow-700 font-semibold">Recruitment paused</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="primary"
                  size="sm" 
                  onClick={(e) => {e.stopPropagation(); onNavigate(`/view-applications/${job.id}`)}}
                >
                  View Applications ({job.applicants_count || 0})
                </Button>
                <Button 
                  variant="secondary"
                  size="sm" 
                  onClick={handleStatusToggle}
                >
                  {job.status === 'active' ? (
                    <>
                      <Pause size={16} className="mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-3 h-10 w-10" 
                  onClick={(e) => { e.stopPropagation(); onNavigate(`/post-job?edit=${job.id}`)}}
                >
                  <Edit size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, bgColor, iconColor, textColor, changeColor, onClick }) => (
  <div 
    className={`${bgColor} border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${onClick ? 'cursor-pointer hover:border-primary-300' : ''}`} 
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${iconColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon, { className: "text-white" })}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-secondary-600">{title}</p>
      </div>
    </div>
    <div className="space-y-2">
      <p className={`text-4xl font-bold ${textColor} group-hover:scale-105 transition-transform duration-300`}>
        {value}
      </p>
      <p className={`text-sm font-medium ${changeColor}`}>{change}</p>
    </div>
  </div>
);

export default RecruiterDashboard;
