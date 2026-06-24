import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PaginationControls from "../Components/PaginationControls.jsx";
import { fetchReviewsByAdminThunk } from "../Redux/auth/auth.thunk";
import {
  selectAdminReviews,
  selectAdminReviewsError,
  selectAdminReviewsPagination,
  selectAdminReviewsStatus,
} from "../Redux/auth/auth.selectors";
import { formatDate, getUserName } from "../utils/adminFormatters";

function getRatingTone(rating) {
  if (rating >= 4) return "good";
  if (rating >= 3) return "neutral";
  return "bad";
}

function getRatingLabel(rating) {
  if (rating >= 4) return "Good review";
  if (rating >= 3) return "Neutral review";
  return "Bad review";
}

export default function AdminReviewsPage() {
  const dispatch = useDispatch();
  const reviews = useSelector(selectAdminReviews);
  const reviewsStatus = useSelector(selectAdminReviewsStatus);
  const reviewsError = useSelector(selectAdminReviewsError);
  const reviewsPagination = useSelector(selectAdminReviewsPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = reviewsStatus === "loading";

  useEffect(() => {
    dispatch(fetchReviewsByAdminThunk({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchReviewsByAdminThunk({ page: currentPage, limit: 10 }));
  };

  return (
    <main className="adminShell adminDashboard">
      <section className="usersPanel fullPanel">
        <div className="panelHeader">
          <div>
            <p className="adminEyebrow">Review management</p>
            <h1>All reviews</h1>
          </div>
          <button
            type="button"
            className="secondaryButton"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {reviewsError && <p className="authMessage error">{reviewsError}</p>}

        <div className="reviewList">
          {reviews.map((review) => {
            const ratingTone = getRatingTone(review.rating);

            return (
              <article className="bookingItem reviewItem" key={review._id}>
                <div className="reviewHeader">
                  <div>
                    <strong>{review.title || `${review.rating}/5 review`}</strong>
                    <span>
                      {getUserName(review.user_id) || review.user_id?.email} for{" "}
                      {review.location_id?.name || "Unknown hotel"} ·{" "}
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <div className={`ratingBadge ${ratingTone}`}>
                    <strong>{review.rating}/5</strong>
                    <span>{getRatingLabel(review.rating)}</span>
                  </div>
                </div>
                <p>{review.comment}</p>
              </article>
            );
          })}
          {!isLoading && reviews.length === 0 && <p>No reviews found.</p>}
        </div>

        <PaginationControls
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          pagination={reviewsPagination}
        />
      </section>
    </main>
  );
}
