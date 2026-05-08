import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Privacy } from '../components/landing/Privacy';
import { Footer } from '../components/landing/Footer';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <LandingNavbar />
      <Privacy />
      <Footer />
    </div>
  );
}
