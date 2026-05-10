'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function ReviewSection({ productId }) {
  const { user, isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setReviewCount(data.reviewCount || 0);
      setCanReview(data.canReview || false);
      setUserReview(data.userReview || null);
      if (data.userReview) {
        setRating(data.userReview.rating);
        setComment(data.userReview.comment);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      addToast('Please select a rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Review submitted!', 'success');
        setShowForm(false);
        fetchReviews();
      } else {
        addToast(data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      addToast('Failed to submit review', 'error');
    }
    setSubmitting(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading reviews...</div>;

  return (
    <div className="review-section">
      {/* Header */}
      <div className="review-header">
        <div className="review-summary">
          <h2>Ratings & Reviews</h2>
          {reviewCount > 0 && (
            <div className="review-overview">
              <div className="review-avg-big">
                <span className="review-avg-number">{avgRating}</span>
                <StarRating rating={avgRating} readOnly size={20} />
                <span className="review-count-text">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
              </div>
            </div>
          )}
        </div>
        {canReview && (
          <button
            className="btn-primary review-write-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {userReview ? '✏️ Edit Review' : '✍️ Write a Review'}
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-rating">
            <label>Your Rating:</label>
            <StarRating rating={rating} onRate={setRating} size={32} />
          </div>
          <textarea
            placeholder="Share your experience with this product... (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="review-textarea"
          />
          <div className="review-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </button>
            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Not logged in or hasn't purchased */}
      {!isLoggedIn && (
        <p className="review-login-prompt">
          <a href="/login">Sign in</a> to write a review after purchasing this product.
        </p>
      )}
      {isLoggedIn && !canReview && !userReview && (
        <p className="review-purchase-prompt">
          ℹ️ Purchase this product to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="review-empty">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div className="review-user-info">
                  {review.userImage ? (
                    <img src={review.userImage} alt="" className="review-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="review-avatar-placeholder">
                      {review.userName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <strong className="review-user-name">{review.userName}</strong>
                    {review.userEmail === user?.email && <span className="review-you-badge">You</span>}
                    <span className="review-date">{timeAgo(review.createdAt)}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} readOnly size={16} />
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
