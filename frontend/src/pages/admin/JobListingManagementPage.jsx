import React from 'react';
import Button from '../../components/common/Button';
import { Plus } from 'lucide-react';

const JobListingManagementPage = ({ onNavigate }) => {
    // Hardcoded job data for demonstration
    const jobs = [
        { id: 1, title: "Commercial Pilot - B737", status: "Active", applicants: 23, views: 156 },
        { id: 2, title: "Aircraft Maintenance Engineer", status: "Paused", applicants: 41, views: 289 },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-secondary-900">Job Listing Management</h1>
                <Button onClick={() => onNavigate('/post-job')} icon={<Plus className="w-4 h-4 mr-2" />}>
                    Post New Job
                </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border">
                <table className="w-full text-left">
                    <thead className="border-b">
                        <tr>
                            <th className="p-4">Job Title</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Applicants</th>
                            <th className="p-4">Views</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id} className="border-b last:border-0">
                                <td className="p-4 font-semibold">{job.title}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{job.status}</span></td>
                                <td className="p-4">{job.applicants}</td>
                                <td className="p-4">{job.views}</td>
                                <td className="p-4"><Button variant="outline" size="sm">Manage</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobListingManagementPage;
