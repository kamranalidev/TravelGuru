import React, { ReactNode } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './index.css';

interface ScrollAnimationProps {
  children: ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animationType = 'fadeIn',
  delay = 0,
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
}) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`scroll-animation scroll-animation-${animationType} ${
        isVisible ? 'scroll-animation-visible' : ''
      } ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};


