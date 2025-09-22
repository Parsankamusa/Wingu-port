import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const HelpFAQPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { q: 'How do I create an account?', a: 'Click "Sign Up" and follow the prompts.' },
        { q: 'How do I verify my profile?', a: 'Navigate to your profile and upload the required documents.' }
    ];

    return (
        <div className="bg-secondary-50 py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-center mb-8">Help & FAQ</h1>
                <div className="max-w-2xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-4 border-b">
                            <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center py-4 text-left">
                                <span className="font-semibold">{faq.q}</span>
                                <ChevronDown className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === index && <div className="pb-4 text-secondary-600">{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpFAQPage;
