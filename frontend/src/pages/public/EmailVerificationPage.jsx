import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const EmailVerificationPage = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || 'your-email@example.com';
    const inputRefs = useRef([]);

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const digits = pasteData.match(/\d/g);

        if (digits && digits.length === 6) {
            const newOtp = digits.slice(0, 6);
            setOtp(newOtp);
            if (inputRefs.current[5]) {
                inputRefs.current[5].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            setError("Please enter the complete 6-digit code.");
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.verifyEmail({ email, otp: otpCode });
            setSuccess('Verification successful! Redirecting to sign in...');
            setTimeout(() => navigate('/signin'), 2000);
        } catch (err) {
            setError(err.response?.data?.otp?.[0] || err.response?.data?.detail || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResend = async () => {
        if (countdown > 0) return;
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await authService.resendOtp({ email });
            setSuccess('A new verification code has been sent.');
            setCountdown(60);
        } catch (err) {
            setError('Failed to resend code. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                        <Mail className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-secondary-900">Check Your Email</h3>
                    <p className="text-secondary-600 mt-2">We've sent a 6-digit verification code to <br/> <span className="font-semibold text-secondary-800">{email}</span>.</p>
                </div>
                
                {error && <div className="mt-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-3"><AlertCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{error}</span></div>}
                {success && <div className="mt-6 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-3"><CheckCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{success}</span></div>}
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="1"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onFocus={e => e.target.select()}
                                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            />
                        ))}
                    </div>
                    <Button type="submit" loading={isLoading} loadingText="Verifying..." fullWidth size="lg">Verify Account</Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-secondary-600">
                        Didn't receive the code?{' '}
                        <button onClick={handleResend} disabled={countdown > 0 || isLoading} className="font-semibold text-primary-600 hover:underline disabled:text-secondary-400 disabled:cursor-not-allowed disabled:no-underline">
                            Resend {countdown > 0 ? `in ${countdown}s` : ''}
                        </button>
                    </p>
                </div>
            </AuthCard>
        </AuthLayout>
    );
};

export default EmailVerificationPage;
