import axios from "axios";

(async () => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:3000/api/v1/auth/login",
      { email: "bad@example.com", password: "wrongpass" },
      { headers: { "Content-Type": "application/json" }, timeout: 5000 },
    );
    console.log("Response data:", res.data);
  } catch (err) {
    console.log("--- Caught error ---");
    console.log("error.message:", err.message);
    console.log("has response:", Boolean(err.response));
    if (err.response) {
      console.log("response.status:", err.response.status);
      console.log("response.data (raw):", err.response.data);
    }
  }
})();
