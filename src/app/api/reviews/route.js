import { auth } from '@/auth';
import { createReview, getReviewsByProductId, getAverageRating, hasUserPurchasedProduct, getAllProductRatings } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET reviews for a product (or all ratings)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const allRatings = searchParams.get('allRatings');

  // Return aggregated ratings for all products (used on product listing)
  if (allRatings === 'true') {
    const ratings = await getAllProductRatings();
    return NextResponse.json({ ratings });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }

  const [reviews, rating] = await Promise.all([
    getReviewsByProductId(productId),
    getAverageRating(productId),
  ]);

  // Check if current user has purchased this product
  let canReview = false;
  let userReview = null;
  const session = await auth();
  if (session?.user?.email) {
    canReview = await hasUserPurchasedProduct(session.user.email, productId);
    userReview = reviews.find(r => r.userEmail === session.user.email) || null;
  }

  return NextResponse.json({
    reviews: reviews.map(r => ({
      ...r,
      _id: r._id.toString(),
    })),
    avgRating: rating.avgRating,
    reviewCount: rating.count,
    canReview,
    userReview: userReview ? { ...userReview, _id: userReview._id.toString() } : null,
  });
}

// POST a new review
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Please login to leave a review' }, { status: 401 });
  }

  const { productId, rating, comment } = await req.json();

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
  }

  // Verify user has purchased this product
  const hasPurchased = await hasUserPurchasedProduct(session.user.email, productId);
  if (!hasPurchased) {
    return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 });
  }

  const review = await createReview({
    productId,
    userEmail: session.user.email,
    userName: session.user.name || 'Anonymous',
    userImage: session.user.image || null,
    rating: Number(rating),
    comment: comment?.trim() || '',
  });

  return NextResponse.json({
    review: { ...review, _id: review._id?.toString() },
    message: 'Review submitted successfully!',
  });
}
