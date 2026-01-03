import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TechStack from '@/components/home/TechStack';
import NotableProjects from '@/components/home/NotableProjects';
import GithubSection from '@/components/home/GithubSection';
import LatestBlogs from '@/components/home/LatestBlogs';
import { metadata as siteMetadata } from '@/data/metadata';

export const metadata = {
  title: siteMetadata.home.title,
  description: siteMetadata.home.description,
};

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <HeroSection />
      <TechStack />
      <NotableProjects />
      <Suspense fallback={<div className="py-12 text-center">Loading GitHub stats...</div>}>
        <GithubSection />
      </Suspense>
      <Suspense fallback={<div className="py-16 text-center">Loading latest blogs...</div>}>
        <LatestBlogs />
      </Suspense>
    </>
  );
}
