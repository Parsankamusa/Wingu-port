import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Play, Pause, FileText, AlertCircle, CheckCircle, Search, ArrowLeft, ArrowRight, MoreVertical, Users, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { useNavigate } from 'react-router-dom';
import jobPostingApi from '../../api/jobPosting';

const JobManagementCard = ({ job, onNavigate, onStatusToggle, onDelete }) => {
    const getStatusBadge = (status) => {
        const styles = { active: 'bg-green-100 text-green-700', draft: 'bg-yellow-100 text-yellow-700', closed: 'bg-red-100 text-red-800' };
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-secondary-900">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-secondary-600 mt-1">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{getStatusBadge(job.status)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onStatusToggle(job.id, job.status)} icon={job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}>
                        {job.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onNavigate(`/post-job?edit=${job.id}`)} icon={<Edit className="w-4 h-4" />} />
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onDelete(job)} icon={<Trash2 className="w-4 h-4" />} />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 text-center">
                <div>
                    <p className="font-bold text-secondary-800">{job.applicants_count || 0}</p>
                    <p className="text-xs text-secondary-600">Applicants</p>
                </div>
                <div>
                    <p className="font-bold text-secondary-800">{job.views || 0}</p>
                    <p className="text-xs text-secondary-600">Views</p>
                </div>
                <div>
                    <p className="font-bold text-secondary-800">{new Date(job.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-secondary-600">Posted On</p>
                </div>
                 <div>
                    <Button size="sm" onClick={() => onNavigate(`/view-applications/${job.id}`)}>View Applicants</Button>
                </div>
            </div>
        </div>
    )
};


const ManageJobListingsPage = () => {
    const navigate = useNavigate();
    const [allJobs, setAllJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const JOBS_PER_PAGE = 5;

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
            
            setAllJobs(jobsWithAppCounts);
            setStats(statsData);
    
        } catch (err) {
            setError('Failed to fetch job listings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredJobs = useMemo(() => {
        return allJobs
            .filter(job => {
                if (statusFilter !== 'all' && job.status !== statusFilter) return false;
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return job.title?.toLowerCase().includes(term) || job.location?.toLowerCase().includes(term);
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [allJobs, searchTerm, statusFilter]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    const handleStatusToggle = async (jobId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'draft' : 'active';
            await jobPostingApi.updateJobPosting(jobId, { status: newStatus });
            setAllJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
            showNotification(`Job has been set to ${newStatus}.`, 'success');
        } catch (err) {
            showNotification('Failed to update job status.', 'error');
        }
    };

    const confirmDelete = (job) => {
        setJobToDelete(job);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!jobToDelete) return;
        try {
            await jobPostingApi.deleteJobPosting(jobToDelete.id);
            setAllJobs(prev => prev.filter(job => job.id !== jobToDelete.id));
            showNotification(`Job "${jobToDelete.title}" has been deleted.`, 'success');
        } catch (err) {
            showNotification('Failed to delete job posting.', 'error');
        } finally {
            setShowDeleteModal(false);
            setJobToDelete(null);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-160px)]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    if (error) {
        return <div className="max-w-7xl mx-auto py-8 px-4 text-center"><p className="text-red-600">{error}</p><Button onClick={fetchData} className="mt-4">Try Again</Button></div>;
    }
    
    const statusTabs = ['all', 'active', 'draft', 'closed'];

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-8 px-4">
                {notification.message && (<div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}><CheckCircle className="w-5 h-5 mr-3" />{notification.message}</div>)}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Manage Jobs</h1>
                        <p className="mt-1 text-secondary-600">Edit, pause, or delete your job postings.</p>
                    </div>
                    <Button onClick={() => navigate('/post-job')} icon={<Plus className="w-4 h-4 mr-2" />}>Post New Job</Button>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                            <input type="text" placeholder="Search by title or location..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                        </div>
                        <div className="md:col-span-4">
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2.5 border rounded-lg bg-white">
                                {statusTabs.map(tab => <option key={tab} value={tab}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {paginatedJobs.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Matching Jobs Found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        paginatedJobs.map(job => (
                            <JobManagementCard 
                                key={job.id} 
                                job={job} 
                                onNavigate={navigate} 
                                onStatusToggle={handleStatusToggle} 
                                onDelete={confirmDelete}
                            />
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center">
                        <Button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} variant="secondary" icon={<ArrowLeft size={16}/>}>Previous</Button>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} variant="secondary" icon={<ArrowRight size={16}/>} iconPosition="right">Next</Button>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
                            <h3 className="text-lg font-bold">Confirm Deletion</h3>
                            <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete the job posting for "{jobToDelete?.title}"? This action cannot be undone.</p>
                            <div className="mt-6 flex justify-end space-x-2">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJobListingsPage;
