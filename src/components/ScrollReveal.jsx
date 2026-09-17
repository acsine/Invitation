'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ 
  children, 
  variant = 'up', // 'up' | 'left' | 'right' | 'scale'
  delay = 0,
  className = '',
  threshold = 0.15
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'left':
        return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12';
      case 'right':
        return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12';
      case 'scale':
        return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90';
      case 'up':
      default:
        return isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}
