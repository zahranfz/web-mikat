'use client';

import { useEffect } from 'react';

export default function ScrollEffects() {
  useEffect(() => {
    const progress = document.getElementById('scrollProgress');
    const revealTargets = document.querySelectorAll<HTMLElement>(
      'main > section, main > .stitch, .gallery-item, .loan-step, .doc-card, .misi-card'
    );

    revealTargets.forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--d', `${Math.min(index % 6, 5) * 55}ms`);
    });

    const updateProgress = () => {
      if (!progress) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );

    revealTargets.forEach((element) => observer.observe(element));
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return null;
}
