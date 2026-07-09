import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { authApi } from "../../api/auth.api";
import { selectUser } from "../../store/auth/auth.selectors";
import "./accountPages.css";

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function ReviewsPage() {
  const user = useSelector(selectUser);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadReviews() {
      setStatus("loading");
      setMessage("");

      try {
        const response = await authApi.getMyReviews();
        setReviews(response.data?.data?.reviews || []);
        setStatus("succeeded");
      } catch (error) {
        setStatus("failed");
        setMessage(error.message || "Unable to load reviews.");
      }
    }

    loadReviews();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="accountPage">
      <div className="accountHero">
        <h1>Reviews</h1>
        <p>View all reviews you have submitted.</p>
      </div>

      <div className="accountPanel">
        {status === "loading" && <p>Loading reviews...</p>}
        {message && <p className="accountMessage error">{message}</p>}

        {status !== "loading" && reviews.length === 0 && (
          <p>You have not written any reviews yet.</p>
        )}

        <div className="accountList">
          {reviews.map((review) => (
            <article className="accountCard" key={review._id}>
              <h3>{review.location_id?.name || "Hotel unavailable"}</h3>
              <p className="accountMeta">
                {review.location_id?.city || "City unavailable"} ·{" "}
                {formatDate(review.created_at)}
              </p>
              <p>Rating: {review.rating}/5</p>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
