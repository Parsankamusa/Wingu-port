import React, { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authService.requestPasswordReset({ email });
            setIsSubmitted(true);
        } catch (err) {
            const errorMessage = err.response?.data?.email?.[0] || 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <AuthCard>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mt-5 text-2xl font-bold text-secondary-900">Check Your Email</h3>
                        <p className="text-secondary-600 mt-2">A password reset link has been sent to <br/> <span className="font-semibold">{email}</span>.</p>
                        <Button onClick={() => onNavigate('/signin')} className="mt-6" fullWidth size="lg">Back to Sign In</Button>
                    </div>
                </AuthCard>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <AuthCard>
                <div className="mb-8 text-center">
                    <h3 className="text-2xl font-bold text-secondary-900">Forgot Password?</h3>
                    <p className="text-secondary-600 mt-2">No problem. Enter your email and we'll send you a reset link.</p>
                </div>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-3"><AlertCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{error}</span></div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="Enter your email address" required />
                        </div>
                    </div>
                    <Button type="submit" loading={isLoading} fullWidth size="lg">Send Reset Link</Button>
                </form>
                <button onClick={() => onNavigate('/signin')} className="w-full flex justify-center items-center mt-6 text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </button>
            </AuthCard>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
