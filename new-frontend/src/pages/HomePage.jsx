import React from 'react';
import Navbar from '../components/marketing/Navbar';
import HeroSection from '../components/marketing/HeroSection';
import HowItWorks from '../components/marketing/HowItWorks';
import CoreCapabilities from '../components/marketing/CoreCapabilities';
import Integrations from '../components/marketing/Integrations';
import SocialProof from '../components/marketing/SocialProof';
import Pricing from '../components/marketing/Pricing';
import FAQ from '../components/marketing/FAQ';
import Footer from '../components/marketing/Footer';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Inter Variable, sans-serif', color: '#05020F', overflowX: 'hidden' }}>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <CoreCapabilities />
      <Integrations />
      <SocialProof />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}