import axios from "axios";

(async () => {
  try {
    await axios.post(
      "http://127.0.0.1:3000/api/v1/auth/login",
      { email: "bad@example.com", password: "wrongpass" },
      { headers: { "Content-Type": "application/json" }, timeout: 5000 },
    );
  } catch {}
})();
