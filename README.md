# Graphql
# Zone01 Personal Profile Page

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [GraphQL Endpoints & Data](#graphql-endpoints--data)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [GitHub Pages](#github-pages)
- [Learning Objectives](#learning-objectives)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## About the Project

This project is a personal profile page built as part of the Zone01 Kisumu curriculum. Its primary objective is to demonstrate proficiency in consuming a **GraphQL API** to fetch and display personalized user data, including statistics visualized through **SVG graphs**.

The application features a secure login mechanism to obtain a JSON Web Token (JWT) from the Zone01 authentication server, which is then used to authenticate subsequent GraphQL queries. This ensures that users can only access their own educational data.

## Features

* **User Authentication:**
    * Login page supporting both username/password and email/password combinations.
    * Basic authentication for obtaining a JWT from `https://learn.zone01kisumu.ke/api/auth/signin`.
    * Appropriate error messages for invalid credentials.
    * Secure storage of JWT in `localStorage`.
    * Logout functionality to clear the session.

* **Personal Profile Display:**
    * Displays basic user identification (Login, User ID, Email).
    * Shows total XP amount earned.
    * Calculates and displays the audit ratio (up/down audits).

* **Dynamic Statistic Graphs (SVG):**
    * **XP Progress Over Time:** A line chart visualizing cumulative XP earned over the user's journey, with interactive tooltips.
    * **Skills Radar:** A pie chart illustrating the percentage of skills obtained, with interactive tooltips.
    * Graphs are rendered using **D3.js** for powerful data-driven SVG generation, ensuring smooth animations and user-friendly interactions.

* **Data Fetching:**
    * Utilizes the `https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql` endpoint.
    * Demonstrates various GraphQL query types:
        * **Normal Queries:** Fetching basic user info.
        * **Argument-based Queries:** Filtering transactions by `userId` and `type`.
        * **Nested Queries:** Accessing `object` details (like project names) through `progress` and `result` tables.

* **Responsive UI:**
    * Styled with for a clean, modern, and responsive design that adapts to various screen sizes.

## Technologies Used

* **Frontend:**
    * HTML5
    * CSS3 
    * JavaScript (ES6+)
    * [D3.js](https://d3js.org/) (for SVG data visualization)
* **APIs:**
    * [Zone01 GraphQL API](https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql)
    * [Zone01 Authentication API](https://learn.zone01kisumu.ke/api/auth/signin)

## GraphQL Endpoints & Data

The project interacts with the following endpoints:

* **Authentication:** `POST` request to `https://learn.zone01kisumu.ke/api/auth/signin` with Basic authentication to receive a JWT.
* **GraphQL:** `POST` requests to `https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql` with Bearer token authentication for data retrieval.


## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You only need a modern web browser to run this project locally. No server-side setup is required as it's a pure frontend application.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://learn.zone01kisumu.ke/git/shaokoth/graphql](https://learn.zone01kisumu.ke/git/shaokoth/graphql)
    cd graphql
    ```

2.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser.

3.  **Login:**
    On the login page, enter your Zone01 Kisumu credentials (username/email and password) and click "Login".

4.  **View Profile:**
    Upon successful login, your personalized profile page with your data and graphs will be displayed.

## Deployment

This project is designed for easy deployment as a static site. **GitHub Pages** is the recommended hosting solution.

### GitHub Pages

1.  **Create a Public GitHub Repository:** If you haven't already, create a **public** repository on GitHub (e.g., `zone01-profile-page`).
2.  **Push Your Code:** Ensure your `index.html` file (and any other assets if you had them) is pushed to the `main` branch of your repository.
3.  **Configure GitHub Pages:**
    * Go to your repository on GitHub.
    * Click on the **`Settings`** tab.
    * In the left sidebar, click on **`Pages`** (under "Code and automation").
    * Under "Build and deployment," set "Source" to **`Deploy from a branch`**.
    * For "Branch," select **`main`** (or your primary branch) and choose the **`/(root)`** folder.
    * Click **`Save`**.
4.  **Access Your Site:** After a few minutes, your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.

## Learning Objectives

This project helped solidify understanding of:

* **GraphQL Query Language:** Constructing various types of queries (basic, argument-based, nested) to fetch specific data.
* **Client-Side Authentication:** Implementing Basic authentication to obtain a JWT and using Bearer authentication for subsequent API calls.
* **Data Visualization with SVG:** Leveraging SVG to parse raw data and generate dynamic, interactive SVG charts (line and pie charts).
* **Frontend Development:** Building a responsive user interface with HTML, CSS, and JavaScript.
* **API Integration:** Handling asynchronous data fetching, error states, and data processing from external APIs.

## Future Enhancements

* **More Graphs:** Add more statistical visualizations (e.g., project attempts, grades per project, skills progression).
* **Interactive Filters:** Allow users to filter XP data by time period (e.g., last month, last year).
* **User Settings:** Implement basic user settings or profile customization.
* **Improved Error Handling:** More granular error messages and user feedback.
* **Loading States:** Enhance loading indicators for data fetching.
* **Accessibility:** Improve accessibility features for users with disabilities.
* **Backend Proxy (for production):** For enhanced security, implement a small backend server to proxy authentication and GraphQL requests, keeping JWTs more secure from XSS.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
