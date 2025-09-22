import React, { useState } from 'react';
import Button from '../../components/common/Button';
import { Lock, Bell, Shield, User, Mail, Edit3, Save, X, AlertCircle, CheckCircle, CreditCard, Settings, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../api/authService';

const AccountSettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    
    const tabs = [
        { id: 'info', name: 'Account Info', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'billing', name: 'Billing', icon: CreditCard },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'preferences', name: 'Preferences', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'info': return <AccountInfo userRole={user?.role} />;
            case 'security': return <SecuritySettings />;
            case 'notifications': return <NotificationSettings />;
            case 'billing': return <Placeholder title="Billing & Subscriptions" message="Manage your subscription plans and view payment history here." />;
            case 'privacy': return <Placeholder title="Privacy Controls" message="Control how your data is used and seen by others on the platform." />;
            case 'preferences': return <Placeholder title="Language & Region" message="Set your preferred language and region for a tailored experience." />;
            default: return <AccountInfo userRole={user?.role} />;
        }
    };

    return (
        <div className="bg-secondary-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900">Account Settings</h1>
                    <p className="mt-1 text-secondary-600">Manage your account preferences, security settings, and privacy controls.</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <aside className="w-full lg:w-1/4 lg:sticky top-24">
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 hidden lg:block">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold text-sm transition-colors ${activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-100'}`}>
                                    <tab.icon className="w-5 h-5" />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="lg:hidden">
                            <div className="border-b border-secondary-200">
                                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center space-x-2 py-3 px-1 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-primary-600 text-primary-600' : 'text-secondary-500 hover:text-secondary-700 border-b-2 border-transparent'}`}>
                                            <tab.icon className="w-5 h-5" />
                                            <span>{tab.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    <main className="w-full lg:w-3/4">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-secondary-800 mb-6 pb-4 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

const AccountInfo = ({ userRole }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isRecruiter = userRole === 'recruiter';
    const editProfilePath = isRecruiter ? '/company-profile' : '/manage-profile';

    return (
        <div className="space-y-6">
            <SectionCard title="Account Overview">
                <div className="space-y-4">
                    <InfoRow label="Account Type" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} />
                    <InfoRow label="Email Address" value={user?.email} verified />
                    {isRecruiter && <InfoRow label="Company Name" value={user?.company_name || 'Not set'} />}
                </div>
            </SectionCard>
            <SectionCard title="Account Actions">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => navigate(editProfilePath)}>Edit Profile</Button>
                    <Button variant="outline" onClick={() => navigate('/subscription-management')}>Manage Subscription</Button>
                </div>
            </SectionCard>
        </div>
    );
};

const SecuritySettings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showNotification("New passwords do not match.", "error");
            return;
        }
        setIsLoading(true);
        try {
            await authService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            showNotification("Password changed successfully!", "success");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const errorMessage = error.response?.data?.current_password?.[0] || 'Failed to change password. Please check your current password.';
            showNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {notification.message && (
                <div className={`p-4 mb-2 rounded-lg border flex items-center ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                    {notification.message}
                </div>
            )}
            <SectionCard title="Change Password">
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={setShowCurrent} />
                    <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={setShowNew} />
                    <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={setShowConfirm} />
                    <div className="pt-2">
                        <Button type="submit" loading={isLoading} loadingText="Updating...">Update Password</Button>
                    </div>
                </form>
            </SectionCard>
             <SectionCard title="Two-Factor Authentication">
                <div className="flex justify-between items-center">
                    <p className="text-secondary-600 text-sm max-w-md">Add an extra layer of security to your account. This feature is coming soon.</p>
                    <div className="w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out cursor-not-allowed"><div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div></div>
                </div>
            </SectionCard>
        </div>
    );
};

const NotificationSettings = () => {
    const [prefs, setPrefs] = useState({
        jobAlerts: true,
        applicationUpdates: true,
        profileViews: false,
        marketingEmails: true,
        securityAlerts: true,
        weeklyDigest: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleToggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setNotification({ message: 'Notification preferences saved!', type: 'success' });
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }, 1000);
    };

    return (
        <SectionCard title="Email Notifications">
            <div className="space-y-5 divide-y divide-secondary-100">
                <NotificationToggle label="Job Alerts" description="Get notified about new job opportunities matching your profile" isEnabled={prefs.jobAlerts} onToggle={() => handleToggle('jobAlerts')} />
                <NotificationToggle label="Application Updates" description="Receive updates about your job applications" isEnabled={prefs.applicationUpdates} onToggle={() => handleToggle('applicationUpdates')} />
                <NotificationToggle label="Profile Views" description="Know when recruiters view your profile" isEnabled={prefs.profileViews} onToggle={() => handleToggle('profileViews')} />
                <NotificationToggle label="Marketing Emails" description="Receive tips, news, and product updates" isEnabled={prefs.marketingEmails} onToggle={() => handleToggle('marketingEmails')} />
                <NotificationToggle label="Security Alerts" description="Important security and account notifications" isEnabled={prefs.securityAlerts} onToggle={() => handleToggle('securityAlerts')} />
                <NotificationToggle label="Weekly Digest" description="Weekly summary of your account activity" isEnabled={prefs.weeklyDigest} onToggle={() => handleToggle('weeklyDigest')} />
            </div>
            <div className="mt-8 pt-6 border-t border-secondary-100 flex justify-end">
                <Button onClick={handleSave} loading={isSaving} icon={<Save className="w-4 h-4 mr-2"/>}>Save Preferences</Button>
            </div>
            {notification.message && <p className="text-green-600 text-sm mt-4 text-right">{notification.message}</p>}
        </SectionCard>
    );
};

const InfoRow = ({ label, value, verified = false }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2">
        <span className="text-sm font-medium text-secondary-600">{label}</span>
        <div className="flex items-center space-x-2">
            <span className="font-semibold text-secondary-800">{value}</span>
            {verified && <CheckCircle className="w-4 h-4 text-green-500" />}
        </div>
    </div>
);

const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <div>
        <label className="block text-sm font-medium text-secondary-600 mb-1">{label}</label>
        <div className="relative">
            <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2.5 border rounded-md pr-10" required />
            <button type="button" onClick={() => onToggle(!show)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600">
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    </div>
);

const NotificationToggle = ({ label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-start pt-5 first:pt-0">
        <div>
            <h4 className="font-semibold text-secondary-800">{label}</h4>
            <p className="text-sm text-secondary-600">{description}</p>
        </div>
        <button onClick={onToggle} className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${isEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isEnabled ? 'translate-x-6' : ''}`}></div>
        </button>
    </div>
);

const Placeholder = ({ title, message }) => (
    <SectionCard title={title}>
        <p className="text-secondary-500">{message} This feature is coming soon.</p>
    </SectionCard>
);

export default AccountSettingsPage;
