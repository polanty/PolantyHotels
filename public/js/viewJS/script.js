// import axios from "axios";

// axios
//   .get("http://127.0.0.1:3000/api/v1/hotels/696fff4d8665a2e316d9769f")
//   .then((res) => {
//     console.log("Data:", res.data);
//   })
//   .catch((err) => {
//     console.error("Error:", err.response?.data || err.message);
//   });

const form = document.getElementById("loginForm");

const loginBtn = document.getElementById("loginBtn");

// function testApiCall() {
//   axios
//     .get("http://127.0.0.1:3000/api/v1/hotels/696fff4d8665a2e316d9769f")
//     .then((res) => {
//       console.log("API response:", res.data);
//     })
//     .catch((err) => {
//       console.error("API error:", err.response?.data || err.message);
//     });
// }

// window.addEventListener("DOMContentLoaded", () => {
//   console.log("Page loaded — running test API call");
//   testApiCall();
// });

//submit functionality to access API for login in to test token
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("password").value;

  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/auth/login",
      data: {
        email: emailInput,
        password: passwordInput,
      },
      withCredentials: true,
    });

    console.log(res.data);
  } catch (error) {
    console.log(error.response?.data || error.message || error);
  }
});
