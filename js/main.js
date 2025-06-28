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

// Display user data
function displayUserData() {
  const user = userData;

  document.getElementById(
    "userName"
  ).textContent = `${user.firstName} ${user.lastName} (@${user.login})`;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("campus").textContent = user.campus || "N/A";
  document.getElementById("level").textContent = user.events[0]?.level || 0;
  document.getElementById("totalXP").textContent =
    (user.xpTotal.aggregate.sum.amount || 0).toLocaleString() + " XP";
  document.getElementById("auditRatio").textContent =
    user.auditRatio?.toFixed(2) || "0.00";
  document.getElementById("totalUp").textContent = user.totalUp || 0;
  document.getElementById("totalDown").textContent = user.totalDown || 0;
  document.getElementById("finishedProjects").textContent =
    user.finished_projects.length;
  document.getElementById("currentProjects").textContent =
    user.current_projects.length;
  document.getElementById("setupProjects").textContent =
    user.setup_project.length;
}

// Create SVG charts
function createCharts() {
  createXPChart();
  createSkillsChart();
}

// XP Progress Chart
function createXPChart() {
  const svg = document.getElementById("xpChart");
  const xpData = userData.xp;

  if (!xpData || xpData.length === 0) {
    svg.innerHTML =
      '<text x="50%" y="50%" text-anchor="middle" fill="#6c7293" font-size="16">No XP data available</text>';
    return;
  }

  const width = 500;
  const height = 350;
  const margin = { top: 30, right: 40, bottom: 50, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  let cumulativeXP = 0;
  const processedData = xpData.map((d) => {
    cumulativeXP += d.amount;
    return {
      date: new Date(d.createdAt),
      xp: cumulativeXP,
      amount: d.amount,
      path: d.path,
    };
  });

  const maxXP = Math.max(...processedData.map((d) => d.xp));
  const minDate = Math.min(...processedData.map((d) => d.date));
  const maxDate = Math.max(...processedData.map((d) => d.date));

  svg.innerHTML = `
                <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#ff006e;stop-opacity:0.1" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#00d4ff" />
                        <stop offset="100%" style="stop-color:#ff006e" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <g transform="translate(${margin.left},${margin.top})">
                    <!-- Grid lines -->
                    ${[0.25, 0.5, 0.75, 1.0]
                      .map(
                        (ratio) => `
                        <line x1="0" y1="${
                          chartHeight * (1 - ratio)
                        }" x2="${chartWidth}" y2="${chartHeight * (1 - ratio)}" 
                              stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                        <text x="-10" y="${
                          chartHeight * (1 - ratio) + 5
                        }" text-anchor="end" 
                              font-size="12" fill="#6c7293">${(
                                maxXP * ratio
                              ).toLocaleString()}</text>
                    `
                      )
                      .join("")}
                    
                    <!-- Axes -->
                    <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" 
                          stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                    <line x1="0" y1="0" x2="0" y2="${chartHeight}" 
                          stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                    
                    <!-- Area fill -->
                    <path d="M 0 ${chartHeight} ${processedData
    .map((d, i) => {
      const x = (i / (processedData.length - 1)) * chartWidth;
      const y = chartHeight - (d.xp / maxXP) * chartHeight;
      return `L ${x} ${y}`;
    })
    .join(" ")} L ${chartWidth} ${chartHeight} Z" 
                    fill="url(#xpGradient)" opacity="0.3"/>
                    
                    <!-- Line path -->
                    <path d="M ${processedData
                      .map((d, i) => {
                        const x = (i / (processedData.length - 1)) * chartWidth;
                        const y = chartHeight - (d.xp / maxXP) * chartHeight;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}" 
                    fill="none" stroke="url(#lineGradient)" stroke-width="3" filter="url(#glow)"/>
                    
                    <!-- Data points -->
                    ${processedData
                      .map((d, i) => {
                        const x = (i / (processedData.length - 1)) * chartWidth;
                        const y = chartHeight - (d.xp / maxXP) * chartHeight;
                        return `
                            <circle cx="${x}" cy="${y}" r="6" fill="#00d4ff" stroke="white" stroke-width="2"
                                    class="data-point" style="cursor: pointer;"
                                    data-xp="${d.xp}" data-amount="${
                          d.amount
                        }" data-path="${d.path}" 
                                    data-date="${d.date.toLocaleDateString()}"/>
                        `;
                      })
                      .join("")}
                    
                    <!-- X-axis labels -->
                    <text x="0" y="${
                      chartHeight + 30
                    }" text-anchor="middle" font-size="12" fill="#6c7293">
                        ${new Date(minDate).toLocaleDateString()}
                    </text>
                    <text x="${chartWidth}" y="${
    chartHeight + 30
  }" text-anchor="middle" font-size="12" fill="#6c7293">
                        ${new Date(maxDate).toLocaleDateString()}
                    </text>
                </g>
            `;

  addTooltips(svg, ".data-point", (d) => {
    return `<strong>Date:</strong> ${
      d.dataset.date
    }<br><strong>Total XP:</strong> ${parseInt(
      d.dataset.xp
    ).toLocaleString()}<br><strong>Gained:</strong> +${parseInt(
      d.dataset.amount
    ).toLocaleString()}<br><strong>Project:</strong> ${d.dataset.path
      .split("/")
      .pop()}`;
  });
}

// Skills Chart
function createSkillsChart() {
  const svg = document.getElementById("skillsChart");
  const skillsData = userData.skills;

  if (!skillsData || skillsData.length === 0) {
    svg.innerHTML =
      '<text x="50%" y="50%" text-anchor="middle" fill="#6c7293" font-size="16">No skills data available</text>';
    return;
  }

  const width = 500;
  const height = 350;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 80;
  const maxAmount = Math.max(...skillsData.map((d) => d.amount));
  const numSkills = skillsData.length;

  const colors = [
    "#00d4ff",
    "#ff006e",
    "#8338ec",
    "#00f5a0",
    "#ffbe0b",
    "#fb5607",
  ];

  const skillPoints = skillsData.map((skill, i) => {
    const angle = (i * 2 * Math.PI) / numSkills - Math.PI / 2;
    const distance = (skill.amount / maxAmount) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const labelX = centerX + Math.cos(angle) * (radius + 40);
    const labelY = centerY + Math.sin(angle) * (radius + 40);

    return {
      x,
      y,
      labelX,
      labelY,
      angle,
      skill: skill.type.replace("skill_", "").replace(/_/g, " "),
      amount: skill.amount,
      maxX: centerX + Math.cos(angle) * radius,
      maxY: centerY + Math.sin(angle) * radius,
    };
  });

  svg.innerHTML = `
                <defs>
                    <filter id="skillGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="skillFill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.2" />
                        <stop offset="50%" style="stop-color:#ff006e;stop-opacity:0.1" />
                        <stop offset="100%" style="stop-color:#8338ec;stop-opacity:0.2" />
                    </linearGradient>
                </defs>
                
                <!-- Background circles -->
                ${[0.2, 0.4, 0.6, 0.8, 1.0]
                  .map(
                    (scale, i) => `
                    <circle cx="${centerX}" cy="${centerY}" r="${
                      radius * scale
                    }" 
                            fill="none" stroke="rgba(255,255,255,${
                              0.1 - i * 0.015
                            })" stroke-width="1"/>
                    <text x="${centerX + 10}" y="${
                      centerY - radius * scale + 5
                    }" 
                          font-size="10" fill="#6c7293">${Math.round(
                            maxAmount * scale
                          )}</text>
                `
                  )
                  .join("")}
                
                <!-- Axis lines -->
                ${skillPoints
                  .map(
                    (point) => `
                    <line x1="${centerX}" y1="${centerY}" x2="${point.maxX}" y2="${point.maxY}" 
                          stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                `
                  )
                  .join("")}
                
                <!-- Skill polygon -->
                <polygon points="${skillPoints
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}" 
                         fill="url(#skillFill)" stroke="#00d4ff" stroke-width="2" 
                         filter="url(#skillGlow)" opacity="0.8"/>
                
                <!-- Data points -->
                ${skillPoints
                  .map(
                    (point, i) => `
                    <circle cx="${point.x}" cy="${point.y}" r="8" 
                            fill="${
                              colors[i % colors.length]
                            }" stroke="white" stroke-width="3"
                            class="skill-point" style="cursor: pointer;" filter="url(#skillGlow)"
                            data-skill="${point.skill}" data-amount="${
                      point.amount
                    }"/>
                `
                  )
                  .join("")}
                
                <!-- Skill labels -->
                ${skillPoints
                  .map((point, i) => {
                    const textAnchor =
                      point.labelX > centerX
                        ? "start"
                        : point.labelX < centerX
                        ? "end"
                        : "middle";
                    return `
                        <text x="${point.labelX}" y="${point.labelY}" 
                              text-anchor="${textAnchor}" alignment-baseline="middle"
                              font-size="12" font-weight="500" fill="#b8bcc8"
                              class="skill-label">${point.skill}</text>
                `;
                  })
                  .join("")}
                
                <!-- Center point -->
                <circle cx="${centerX}" cy="${centerY}" r="6" fill="#00d4ff" opacity="0.8" filter="url(#skillGlow)"/>
            `;

  addTooltips(svg, ".skill-point", (d) => {
    return `<strong>Skill:</strong> ${d.dataset.skill}<br><strong>Level:</strong> ${d.dataset.amount}`;
  });

  // Add hover effects
  svg.querySelectorAll(".skill-point").forEach((point) => {
    point.addEventListener("mouseenter", () => {
      point.setAttribute("r", "10");
    });

    point.addEventListener("mouseleave", () => {
      point.setAttribute("r", "8");
    });
  });
}
