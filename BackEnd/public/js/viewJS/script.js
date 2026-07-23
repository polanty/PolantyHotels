// import axios from "axios";

const form = document.getElementById("loginForm");

const loginBtn = document.getElementById("loginBtn");

function testApiCall() {
  axios
    .get("http://127.0.0.1:3000/api/v1/hotels/696fff4d8665a2e316d9769f")
    .catch((err) => {
      console.error("API error:", err.response?.data || err.message);
    });
}

window.addEventListener("DOMContentLoaded", () => {
  testApiCall();
});

//submit functionality to access API for login in to test token
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("password").value;

  try {
    await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/auth/login",
      data: {
        email: emailInput,
        password: passwordInput,
      },
      withCredentials: true,
    });

    // window.setTimeout(() => {
    //   location.assign('/')
    // }, 1500)

  } catch {}
});
