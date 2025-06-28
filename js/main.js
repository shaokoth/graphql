let currentToken = null;
let userData = null;

// Login functionality
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("errorMessage");
  const submitBtn = e.target.querySelector(".login-btn");

  // Add loading state
  submitBtn.innerHTML = "<span>Signing In...</span>";
  submitBtn.disabled = true;

  try {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetch(
      "https://learn.zone01kisumu.ke/api/auth/signin",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseText = await response.text();
      let token;

      try {
        const jsonResponse = JSON.parse(responseText);
        token = jsonResponse.token || jsonResponse.access_token || jsonResponse;
      } catch {
        token = responseText;
      }

      token = token.replace(/^["']|["']$/g, "").trim();

      currentToken = token;
      localStorage.setItem("zone01_token", token);

      document.getElementById("loginSection").style.display = "none";
      document.getElementById("loadingSection").style.display = "flex";

      await loadUserData();
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    errorDiv.textContent =
      "Invalid username/email or password. Please try again.";
    errorDiv.style.display = "block";
  } finally {
    submitBtn.innerHTML = "<span>Sign In</span>";
    submitBtn.disabled = false;
  }
});
