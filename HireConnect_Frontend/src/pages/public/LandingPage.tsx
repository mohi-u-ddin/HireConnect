import { PublicLayout } from '../../components/layout/PublicLayout';
import { Hero, CategoriesSection, HowItWorksSection, StatsSection, CtaSection } from './LandingSections';
import { FeaturedJobsSection } from './FeaturedJobsSection';

export function LandingPage() {
  return (
    <PublicLayout>
      <Hero />
      <FeaturedJobsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <StatsSection />
      <CtaSection />
    </PublicLayout>
  );
}
