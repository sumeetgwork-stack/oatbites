'use client';

import { useState } from 'react';

export default function StarRating({ rating = 0, onRate = null, size = 24, readOnly = false }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className="star-rating" style={{ display: 'inline-flex', gap: '2px', cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= Math.floor(displayRating);
        const half = !filled && star - 0.5 <= displayRating;

        return (
          <span
            key={star}
            className={`star ${filled ? 'filled' : half ? 'half' : 'empty'}`}
            style={{ fontSize: `${size}px`, lineHeight: 1, transition: 'transform 0.15s, color 0.15s' }}
            onClick={() => !readOnly && onRate && onRate(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
          >
            {filled ? '★' : half ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
}

export function RatingDisplay({ avgRating, reviewCount, size = 16 }) {
  if (!reviewCount || reviewCount === 0) return null;

  return (
    <div className="rating-display" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span className="rating-badge" style={{
        background: avgRating >= 4 ? '#388e3c' : avgRating >= 3 ? '#f9a825' : '#d32f2f',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: `${size - 2}px`,
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
      }}>
        {avgRating} ★
      </span>
      <span style={{ color: '#878787', fontSize: `${size - 2}px` }}>
        ({reviewCount})
      </span>
    </div>
  );
}
