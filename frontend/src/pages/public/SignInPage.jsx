import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';

const SignInPage = ({ onNavigate }) => {
    const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await login(formData);
            if (data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.non_field_errors?.[0] || 'Invalid credentials. Please check your email and password.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard>
                <div className="mb-8 text-center">
                    <img src="/logo.png" alt="WinguPort Logo" className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-secondary-900">Welcome Back!</h3>
                    <p className="text-secondary-600 mt-2 text-sm">Sign in to access your dashboard.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-red-700 text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-secondary-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                            <input name="email" type="email" onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="john.doe@aviation.com" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-secondary-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                            <input name="password" type={showPassword ? 'text' : 'password'} onChange={handleInputChange} className="w-full pl-10 pr-12 py-2.5 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="Enter your password" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded" />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-secondary-700">Remember me</label>
                        </div>
                        <button type="button" onClick={() => onNavigate('/forgot-password')} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Forgot password?
                        </button>
                    </div>
                    <Button type="submit" loading={isLoading} fullWidth size="lg">Sign In</Button>
                </form>

                <p className="mt-8 text-center text-sm text-secondary-600">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('/signup')} className="font-semibold text-primary-600 hover:underline">
                        Create one now
                    </button>
                </p>
            </AuthCard>
        </AuthLayout>
    );
};

export default SignInPage;
