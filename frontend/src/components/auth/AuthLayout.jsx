import React from 'react';

const AuthLayout = ({ children }) => {
    return (
        <div 
            className="min-h-[calc(100vh-88px)] w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-secondary-50"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
