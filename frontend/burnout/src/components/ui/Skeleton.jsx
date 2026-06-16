// src/components/ui/Skeleton.jsx
// Skeleton loading placeholders — prevents layout shift during async operations

import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-text ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`} aria-hidden="true">
    <Skeleton height="20px" width="40%" />
    <SkeletonText lines={2} className="skeleton-card__body" />
  </div>
);

export const SliderSkeleton = () => (
  <div className="slider-skeleton" aria-hidden="true">
    {Array.from({ length: 14 }).map((_, i) => (
      <div key={i} className="slider-skeleton__item">
        <Skeleton height="14px" width="55%" />
        <Skeleton height="6px" width="100%" borderRadius="99px" />
      </div>
    ))}
  </div>
);
