import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      try {
        const res = await fetch(
          `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${sessionId}`,
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to verify payment");
        }

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

  if (loading) return <p>Confirming your payment...</p>;

  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1>Booking confirmed</h1>
      <p>Your payment was successful.</p>

      <p>
        Amount paid: <strong>£{(session.amount_total / 100).toFixed(2)}</strong>
      </p>

      <p>Status: {session.payment_status}</p>

      <Link to="/">Back to home</Link>
    </main>
  );
}
