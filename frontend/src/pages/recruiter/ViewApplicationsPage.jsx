import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertCircle, Loader, Search, Inbox, Star, FileText, Check, MoreVertical } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import jobPostingApi from '../../api/jobPosting';

const ViewApplicationsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (jobId && jobId !== 'all') {
                params.job = jobId;
                const jobRes = await jobPostingApi.getJobPostingById(jobId);
                setJobTitle(jobRes.data.title);
            } else {
                setJobTitle('All Jobs');
            }

            const appRes = await authService.getRecruiterApplications(params);
            setApplications(appRes.data.results || []);

        } catch (err) {
            setError('Could not load applications. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = useCallback(async (appId, newStatus) => {
        const originalApps = [...applications];
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        try {
            await authService.updateApplicationStatus(appId, { status: newStatus });
        } catch (error) {
            setApplications(originalApps);
            setError("Failed to update status. Please try again.");
        }
    }, [applications]);

    const filteredApplications = useMemo(() => {
        return applications
            .filter(app => {
                if (statusFilter !== 'all' && app.status !== statusFilter) return false;
                if (!searchTerm) return true;
                return app.applicant_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [applications, searchTerm, statusFilter]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-160px)]"><Loader className="w-12 h-12 text-primary-500 animate-spin"/></div>;
    }

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <Button variant="link" onClick={() => navigate('/manage-jobs')} className="mb-6 text-secondary-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Management
                </Button>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900">Applications for "{jobTitle}"</h1>
                    <p className="mt-1 text-secondary-600">Review and manage candidates who have applied for this role.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <input
                                type="text"
                                placeholder="Search by applicant name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <StatusFilter selected={statusFilter} onChange={setStatusFilter} applications={applications}/>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 mr-3"/>{error}</div>}
                
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                        <p className="text-gray-600">There are no applications matching your current filters.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {filteredApplications.map(app => (
                                <ApplicationRow key={app.id} app={app} navigate={navigate} onStatusUpdate={handleStatusUpdate} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusFilter = ({ selected, onChange, applications }) => {
    const statuses = ['all', 'submitted', 'under_review', 'shortlisted', 'interview'];
    const counts = useMemo(() => {
        const initialCounts = { all: applications.length };
        statuses.slice(1).forEach(s => {
            initialCounts[s] = applications.filter(app => app.status === s).length;
        });
        return initialCounts;
    }, [applications]);

    return (
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
            {statuses.map(status => (
                <button
                    key={status}
                    onClick={() => onChange(status)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${selected === status ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    <span className="ml-2 text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded-full">{counts[status]}</span>
                </button>
            ))}
        </div>
    );
};

const ApplicationRow = ({ app, navigate, onStatusUpdate }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const statusOptions = ['submitted', 'under_review', 'shortlisted', 'interview', 'rejected'];

    const getStatusInfo = (status) => {
        switch (status) {
            case 'submitted': return { text: 'Submitted', color: 'bg-blue-100 text-blue-800' };
            case 'under_review': return { text: 'Under Review', color: 'bg-yellow-100 text-yellow-800' };
            case 'shortlisted': return { text: 'Shortlisted', color: 'bg-purple-100 text-purple-800' };
            case 'interview': return { text: 'Interview', color: 'bg-indigo-100 text-indigo-800' };
            case 'rejected': return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
            default: return { text: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
                        {app.applicant_details?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <button onClick={() => navigate(`/candidate-profile/${app.id}`)} className="font-bold text-secondary-800 text-left hover:underline">{app.applicant_details?.full_name || 'Unnamed Applicant'}</button>
                        <p className="text-sm text-secondary-500">{app.applicant_details?.specialization || 'No specialization provided'}</p>
                    </div>
                </div>
                <div className="col-span-2 text-sm text-secondary-600">
                    {new Date(app.created_at).toLocaleDateString()}
                </div>
                <div className="col-span-3">
                     <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusInfo(app.status).color}`}>
                        {getStatusInfo(app.status).text}
                    </span>
                </div>
                <div className="col-span-2 text-right relative">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/candidate-profile/${app.id}`)}>View</Button>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 ml-2 rounded-md hover:bg-gray-200"><MoreVertical size={16}/></button>
                    {menuOpen && (
                        <div className="absolute right-0 top-10 z-10 bg-white shadow-lg rounded-md border w-40">
                            <p className="px-3 py-2 text-xs text-gray-500">Change Status</p>
                            {statusOptions.map(status => (
                                <button 
                                    key={status} 
                                    onClick={() => { onStatusUpdate(app.id, status); setMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                                >
                                    {app.status === status && <Check size={14} className="mr-2"/>}
                                    <span className={app.status !== status ? 'ml-6' : ''}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewApplicationsPage;

