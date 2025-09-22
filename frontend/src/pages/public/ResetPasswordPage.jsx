import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { Lock, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({ password: '', password_confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        if (!tokenFromUrl) {
            setError("Invalid or missing password reset token.");
        }
        setToken(tokenFromUrl);
    }, [location]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (formData.password !== formData.password_confirm) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.confirmPasswordReset({ ...formData, token });
            setSuccess("Password reset successfully! Redirecting to sign in...");
            setTimeout(() => navigate('/signin'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.token?.[0] || err.response?.data?.detail || "Failed to reset password. The link may be expired or invalid.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard>
                <div className="mb-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                        <Key className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-secondary-900">Set New Password</h3>
                    <p className="text-secondary-600 mt-2">Create a new, strong password for your account.</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-3"><AlertCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{error}</span></div>}
                {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-3"><CheckCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{success}</span></div>}
                
                {!success && token && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                                <input name="password" type={showPassword ? 'text' : 'password'} onChange={handleInputChange} className="w-full pl-10 pr-12 py-2.5 border rounded-lg" placeholder="Enter new password" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                                <input name="password_confirm" type={showConfirmPassword ? 'text' : 'password'} onChange={handleInputChange} className="w-full pl-10 pr-12 py-2.5 border rounded-lg" placeholder="Confirm new password" required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" loading={isLoading} fullWidth size="lg">Reset Password</Button>
                    </form>
                )}
            </AuthCard>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
