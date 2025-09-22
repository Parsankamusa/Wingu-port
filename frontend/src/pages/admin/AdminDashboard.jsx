import React from 'react';
import { Users, Briefcase, Shield, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Users', value: '52,847', icon: Users },
        { label: 'Active Jobs', value: '8,943', icon: Briefcase },
        { label: 'Pending Verifications', value: '127', icon: Shield },
        { label: 'Monthly Revenue', value: '$284.7K', icon: TrendingUp },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border">
                        <stat.icon className="w-8 h-8 text-primary-500 mb-3" />
                        <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                        <p className="text-secondary-600">{stat.label}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-xl mb-4">Platform Analytics</h3>
                <p className="text-secondary-500">Charts and detailed analytics will be displayed here.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
