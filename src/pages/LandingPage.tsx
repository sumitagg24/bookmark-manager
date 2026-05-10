import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Stats } from '../components/landing/Stats';
import { Results } from '../components/landing/Results';
import { TechStack } from '../components/landing/TechStack';
import { Documentation } from '../components/landing/Documentation';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Results />
      <TechStack />
      <Documentation />
      <CTASection />
      <Footer />
    </div>
  );
}
