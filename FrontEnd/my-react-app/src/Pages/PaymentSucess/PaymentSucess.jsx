import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      try {
        const { data } = await api.get(
          `/api/v1/bookings/checkout-session/${sessionId}`,
        );

        setSession(data.session);
      } catch (err) {
        setError(err.message || "Payment verification failed");
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      verifyPayment();
    } else {
      setError("No checkout session was found.");
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return <div className="paymentState">Confirming your payment...</div>;
  }

  if (error) {
    return (
      <div className="paymentState paymentState--error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section className="paymentSuccessPage">
      <div className="paymentSuccessCard">
        <span className="material-symbols-outlined paymentSuccessIcon">
          check_circle
        </span>
        <h1>Booking confirmed</h1>
        <p>Your payment was successful.</p>

        <dl className="paymentSummary">
          <div>
            <dt>Amount paid</dt>
            <dd>£{(session.amount_total / 100).toFixed(2)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{session.payment_status}</dd>
          </div>
        </dl>

        <Link className="paymentHomeLink" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
