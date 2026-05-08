import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Terms } from '../components/landing/Terms';
import { Footer } from '../components/landing/Footer';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <LandingNavbar />
      <Terms />
      <Footer />
    </div>
  );
}
