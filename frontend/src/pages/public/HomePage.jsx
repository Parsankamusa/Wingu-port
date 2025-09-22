import React from 'react';
import HeroSection from '../../components/sections/HeroSection';
import AboutWinguPortSection from '../../components/sections/AboutWinguPortSection';
import ValuePropositionSection from '../../components/sections/ValuePropositionSection';
import FeaturedJobsSection from '../../components/sections/FeaturedJobsSection';
import WhyChooseUsSection from '../../components/sections/WhyChooseUsSection';
import CTASection from '../../components/sections/CTASection';

const HomePage = ({ onNavigate }) => {
    return (
        <>
            <HeroSection onNavigate={onNavigate} />
            <AboutWinguPortSection onNavigate={onNavigate} />
            <FeaturedJobsSection onNavigate={onNavigate} />
            <ValuePropositionSection onNavigate={onNavigate} />
            <WhyChooseUsSection onNavigate={onNavigate} />
            <CTASection onNavigate={onNavigate} />
        </>
    );
};

export default HomePage;