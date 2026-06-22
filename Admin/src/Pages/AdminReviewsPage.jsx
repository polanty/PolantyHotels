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
          {reviews.map((review) => (
            <article className="bookingItem" key={review._id}>
              <div>
                <strong>{review.title || `${review.rating}/5 review`}</strong>
                <span>
                  {getUserName(review.user_id) || review.user_id?.email} for{" "}
                  {review.location_id?.name || "Unknown hotel"} ·{" "}
                  {formatDate(review.created_at)}
                </span>
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
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
