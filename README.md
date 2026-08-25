
# DevNest Frontend

DevNest is a modern, developer-focused portfolio and community platform. It allows engineers to showcase their projects, publish code details, manage their professional profiles, and interact with the peer community.

This repository is the React frontend application built with Vite, Tailwind CSS, and React Router.

---

## ✨ Features & User Flows

*   **Authentication & Session Guarding:** Secure sign-in and registration workflows connected to the DevNest backend with credential persistence.
*   **Dynamic Landing Page:** Unauthenticated visitors can view platform details and a live public feed of projects pulled directly from the database.
*   **Developer Profiles:** Automatically fetches and renders user data, follower counts, contribution stats, and published projects.
*   **Project Management & Creation:** Fully interactive form to publish new public or private projects instantly to your portfolio.
*   **Project Details & Discussions:** Dedicated views for individual projects featuring tabs for Readmes and community comment discussions with clean empty states.
*   **Settings & Skill Management:** Unified settings panel allowing users to update their bio, website links, and add/delete professional skills with real-time state updates.
*   **Dark / Light Mode:** Built-in theme toggling for a comfortable developer experience.

---

## 🛠️ Tech Stack

*   **Core:** React 19, Vite
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS
*   **Network / API:** Native `fetch` with credential inclusion (`credentials: 'include'`)

---

## 📁 Project Structure

```text
src/
├── components/       # Reusable UI blocks (Navbar, Footer, ProjectCard, Sidebar, etc.)
├── context/          # Global state management (AuthContext with smart payload unwrapping)
├── hooks/            # Custom hooks (useTheme)
├── pages/            # Full page views (HomePage, ProfilePage, SignInPage, RegisterPage, NewProjectPage, ProjectDetailsPage, SettingsPage)
├── App.jsx           # Application routes and session verification
└── main.jsx          # Application entry point

🚀 Getting Started
Prerequisites
Make sure you have Node.js installed and your Express backend running locally (typically on http://localhost:3000).

Installation & Run
Clone the repository and install dependencies:

Bash
git clone <repository-url>
cd devnest-web
npm install
Configure your environment variables:
Create a .env.local file in the root directory if your backend runs on a custom port:

Code snippet
VITE_API_URL=http://localhost:3000
Start the development server:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173.

📄 License
Distributed under the MIT License. See LICENSE for more information.