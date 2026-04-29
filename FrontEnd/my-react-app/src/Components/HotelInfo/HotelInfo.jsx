import "./HotelInfo.css";
import { useState } from "react";

export default function HotelInfoCards({ hotel }) {
  const [showReviews, setShowReviews] = useState(false);

  const reviews = hotel?.reviews || [];

  return (
    <>
      <section className="hotelInfoCards">
        {/* Reviews */}
        <div className="hotelInfoCard">
          <h3>Guest Reviews</h3>

          <button
            type="button"
            className="reviewLink"
            onClick={() => setShowReviews(true)}
          >
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </button>

          <p>Read what guests are saying about this property.</p>
        </div>

        {/* House Rules */}
        <div className="hotelInfoCard">
          <h3>House Rules</h3>

          <ul>
            <li>Check-in from 3:00 PM</li>
            <li>Check-out before 11:00 AM</li>
            <li>No smoking inside the property</li>
            <li>Pets may not be allowed</li>
            <li>Valid ID may be required at check-in</li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="hotelInfoCard">
          <h3>Accepted Payments</h3>

          <ul>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>American Express</li>
            <li>Bank transfer</li>
            <li>Cash at property</li>
          </ul>
        </div>
      </section>

      {showReviews && (
        <div className="modalOverlay" onClick={() => setShowReviews(false)}>
          <div className="reviewsModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>All Reviews</h2>

              <button type="button" onClick={() => setShowReviews(false)}>
                ×
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="reviewsList">
                {reviews.map((review) => (
                  <div className="reviewItem" key={review._id}>
                    <h4>{review.user_id?.first_name || "Guest"}</h4>
                    <h3>{review.title}</h3>
                    <p>{review.comment}</p>
                    {review.rating && <span>{review.rating}/5</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews available for this hotel yet.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
