import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="prose max-w-none">
                    <p>Your privacy is important to us. This policy explains what data we collect...</p>
                    <h2>1. Information Collection</h2>
                    <p>We collect information you provide directly to us...</p>
                    <h2>2. Use of Information</h2>
                    <p>We use the information to provide and improve our services...</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
