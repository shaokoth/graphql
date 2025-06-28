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

// Load user data from GraphQL
async function loadUserData() {
  const query = `
                query users {
                    user {
                        id
                        login
                        firstName
                        lastName
                        email
                        campus
                        auditRatio
                        totalUp
                        totalDown
                        xpTotal: transactions_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 75}}) {
                            aggregate {
                                sum {
                                    amount
                                }
                            }
                        }
                        events(where:{eventId:{_eq:75}}) {
                            level
                        }
                        xp: transactions(order_by: {createdAt: asc}
                            where: {type: {_eq: "xp"}, eventId: {_eq: 75}}) {
                            createdAt
                            amount
                            path
                        }
                        finished_projects: groups(where:{group:{status:{_eq:finished}}}) {
                            group {
                                path
                                status
                            }
                        }
                        current_projects: groups(where:{group:{status:{_eq:working}}}) {
                            group {
                                path
                                status
                                members {
                                    userLogin
                                }
                            }
                        }
                        setup_project: groups(where:{group:{status:{_eq:setup}}}) {
                            group {
                                path
                                status
                                members {
                                    userLogin
                                }
                            }
                        }
                        skills: transactions(
                            order_by: {type: asc, amount: desc}
                            distinct_on: [type]
                            where: {eventId: {_eq: 75}, _and: {type: {_like: "skill_%"}}}
                        ) {
                            type
                            amount
                        }
                    }
                }
            `;

  try {
    const response = await fetch(
      "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    if (!data.data || !data.data.user || data.data.user.length === 0) {
      throw new Error("No user data returned");
    }

    userData = data.data.user[0];
    displayUserData();
    createCharts();

    document.getElementById("loadingSection").style.display = "none";
    document.getElementById("profileSection").style.display = "block";
  } catch (error) {
    console.error("Error loading user data:", error);
    alert("Error loading profile data. Please login again.");
    logout();
  }
}
