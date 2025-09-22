import React, { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import Button from '../../components/common/Button';

const PricingPage = ({ onNavigate }) => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        { name: 'Trial', price: { monthly: 0 }, features: ['Profile creation', 'Public job access'], icon: Star },
        { name: 'Professional', price: { monthly: 29, yearly: 290 }, features: ['Verified badge', 'Priority visibility'], icon: Zap, popular: true },
        { name: 'Executive', price: { monthly: 99, yearly: 990 }, features: ['Direct recruiter messaging', 'Career advisor'], icon: Crown }
    ];

    return (
        <div className="bg-secondary-50 py-12">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
                <p className="text-lg text-secondary-600 mb-8">Choose the plan that fits your career goals.</p>
                <div className="grid lg:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <div key={plan.name} className={`bg-white p-8 rounded-xl shadow-md ${plan.popular ? 'border-2 border-primary-500' : ''}`}>
                            <plan.icon className="w-10 h-10 text-primary-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
                            <p className="text-4xl font-bold mb-4">${plan.price.monthly}<span className="text-lg font-normal">/mo</span></p>
                            <ul className="space-y-3 text-left mb-6">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />{feature}</li>
                                ))}
                            </ul>
                            <Button variant={plan.popular ? 'primary' : 'secondary'} fullWidth onClick={() => onNavigate('/signup')}>
                                Get Started
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
