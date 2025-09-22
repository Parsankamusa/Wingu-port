import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import authService from '../../api/authService';
import { User, Mail, Lock, Building, Globe, Briefcase, Plane, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { organizationTypes } from '../recruiter/components/dropDownData';
import { RequiredAsterisk } from '../professional/profile/components/RequiredAsterisk';

const SignUpPage = ({ onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [userType, setUserType] = useState('professional');
    const [formData, setFormData] = useState({
        fullName: '',
        firstName: '',
        lastName: '',
        companyName: '',
        companyWebsite: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        companyType: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('type') === 'recruiter') {
            setUserType('recruiter');
        }
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');

        if (!formData.agreeToTerms) {
            setErrors({ general: "You must agree to the terms and conditions." });
            return;
        }

        setIsLoading(true);

        const isProfessional = userType === 'professional';
        
        let payload;
        if (isProfessional) {
            payload = { 
                full_name: formData.fullName, 
                email: formData.email, 
                password: formData.password, 
                password_confirm: formData.confirmPassword 
            };
        } else {
            payload = { 
                // first_name: formData.firstName, 
                // last_name: formData.lastName, 
                company_name: formData.companyName, 
                email: formData.email, 
                password: formData.password, 
                password_confirm: formData.confirmPassword,
                company_type: formData.companyType
            };
            if (formData.companyWebsite) {
                payload.company_website = formData.companyWebsite;
            }
        }
        
        try {
            const registerFunction = isProfessional ? authService.registerProfessional : authService.registerRecruiter;
            await registerFunction(payload);
            setSuccess('Registration successful! Please check your email to verify your account.');
            setTimeout(() => navigate('/email-verification', { state: { email: payload.email } }), 3000);
        } catch (err) {
            const apiErrors = err.response?.data;
            if (apiErrors) {
                const formattedErrors = {};
                for (const key in apiErrors) {
                    formattedErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
                }
                setErrors(formattedErrors);
            } else {
                setErrors({ general: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <AuthLayout>
            <AuthCard>
                <div className="mb-8 text-center">
                    <img src="/logo.png" alt="WinguPort Logo" className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-secondary-900">Create Your WinguPort Account</h3>
                    <p className="text-secondary-600 mt-2 text-sm">Join a community of aviation experts and top employers.</p>
                </div>

                {errors.general && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-3"><AlertCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{errors.general}</span></div>}
                {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-3"><CheckCircle className="w-5 h-5 flex-shrink-0"/><span className="text-sm font-medium">{success}</span></div>}
                
                <div className="relative p-1 bg-secondary-100 rounded-lg mb-8">
                    <div className="absolute inset-0 bg-primary-600 rounded-md transition-transform duration-300 ease-in-out" style={{ width: '50%', transform: userType === 'recruiter' ? 'translateX(100%)' : 'translateX(0%)' }}></div>
                    <div className="relative grid grid-cols-2">
                        <button onClick={() => setUserType('professional')} className={`relative z-10 flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 ${userType === 'professional' ? 'text-white' : 'text-secondary-600 hover:bg-secondary-200/50'}`}>
                            <Plane className="w-4 h-4 mr-2" /> Professional
                        </button>
                        <button onClick={() => setUserType('recruiter')} className={`relative z-10 flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 ${userType === 'recruiter' ? 'text-white' : 'text-secondary-600 hover:bg-secondary-200/50'}`}>
                            <Briefcase className="w-4 h-4 mr-2" /> Recruiter
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {userType === 'professional' ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Full Name</label>
                                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="fullName" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.full_name ? 'border-red-500' : 'border-secondary-300'}`} placeholder="John Doe" required /></div>
                                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Email</label>
                                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="email" type="email" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.email ? 'border-red-500' : 'border-secondary-300'}`} placeholder="john.doe@aviation.com" required /></div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </>
                    ) : (
                         <>
                            {/* <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">First Name</label>
                                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="firstName" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.first_name ? 'border-red-500' : 'border-secondary-300'}`} placeholder="Jane" required /></div>
                                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Last Name</label>
                                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="lastName" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.last_name ? 'border-red-500' : 'border-secondary-300'}`} placeholder="Smith" required /></div>
                                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                </div>
                            </div> */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Company Name <RequiredAsterisk /></label>
                                <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="companyName" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.company_name ? 'border-red-500' : 'border-secondary-300'}`} placeholder="Aviation Corp" required /></div>
                                {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" htmlFor='company_type'>Company Type <RequiredAsterisk /></label>
                            <FormControl fullWidth error={!!errors[`company_type`]}>
                                            <InputLabel id={`company_type-label`}>
                                              Company Type *
                                            </InputLabel>
                                            <Select
                                              id="company_type"
                                              labelId={`company_type-label`}
                                              name='companyType'
                                              value={formData.companyType}
                                              required
                                              label="Company Type *"
                                              onChange={handleInputChange}
                                            >
                                              {organizationTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                  {type.label}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                            {errors[`company_type`] && (
                                              <Typography variant="caption" color="error">
                                                {errors[`company_type`]}
                                              </Typography>
                                            )}
                                          </FormControl>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold mb-2">Company Email <RequiredAsterisk /></label>
                                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="email" type="email" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.email ? 'border-red-500' : 'border-secondary-300'}`} placeholder="hr@aviationcorp.com" required /></div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Company Website (Optional)</label>
                                <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" /><input name="companyWebsite" onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.company_website ? 'border-red-500' : 'border-secondary-300'}`} placeholder="https://example.com" /></div>
                                {errors.company_website && <p className="text-red-500 text-xs mt-1">{errors.company_website}</p>}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold mb-2">Password <RequiredAsterisk /></label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                            <input name="password" type={showPassword ? 'text' : 'password'} onChange={handleInputChange} className={`w-full pl-10 pr-10 py-2.5 border rounded-lg ${errors.password ? 'border-red-500' : 'border-secondary-300'}`} placeholder="Create a strong password" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Confirm Password <RequiredAsterisk /></label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} onChange={handleInputChange} className={`w-full pl-10 pr-10 py-2.5 border rounded-lg ${errors.password_confirm ? 'border-red-500' : 'border-secondary-300'}`} placeholder="Confirm your password" required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">{showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                        </div>
                        {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
                    </div>

                    <div className="flex items-start pt-2">
                        <input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleInputChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-0.5" />
                        <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-secondary-700">I agree to the <button type="button" onClick={() => onNavigate('/terms')} className="font-medium text-primary-600 hover:underline">Terms</button> and <button type="button" onClick={() => onNavigate('/privacy')} className="font-medium text-primary-600 hover:underline">Privacy Policy</button>.</label>
                    </div>
                    <Button type="submit" loading={isLoading} disabled={!formData.agreeToTerms || isLoading} loadingText="Creating Account..." fullWidth size="lg">Create Account</Button>
                </form>
                
                <p className="mt-8 text-center text-sm text-secondary-600">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('/signin')} className="font-semibold text-primary-600 hover:underline">
                        Sign in
                    </button>
                </p>
            </AuthCard>
        </AuthLayout>
    );
};

export default SignUpPage;
