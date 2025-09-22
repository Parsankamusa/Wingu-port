import React from 'react';

const AuthCard = ({ children }) => {
    return (
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-secondary-200 w-full">
            {children}
        </div>
    );
};

export default AuthCard;
