import React from 'react';

const TermsOfServicePage = () => {
    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <div className="prose max-w-none">
                    <p>Welcome to WinguPort. By accessing our website, you agree to these terms...</p>
                    <h2>1. Use of Service</h2>
                    <p>You agree to use our service responsibly and legally...</p>
                    <h2>2. Accounts</h2>
                    <p>You are responsible for maintaining the confidentiality of your account...</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
