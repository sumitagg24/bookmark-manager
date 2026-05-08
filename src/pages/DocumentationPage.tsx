import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Documentation } from '../components/landing/Documentation';
import { Footer } from '../components/landing/Footer';

export function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <LandingNavbar />
      <Documentation />
      <Footer />
    </div>
  );
}
