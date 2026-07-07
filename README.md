# Knowledge Grapher

![Project Banner](https://via.placeholder.com/1200x400.png?text=Knowledge+Grapher+Banner) <!-- Add your project banner screenshot here -->

**Knowledge Grapher** is an AI-powered NLP Text-to-Entity Knowledge Graph Visualizer. It takes raw text inputs, extracts key entities and relationships using NLP, and visualizes them interactively.

---

[![Knowledge Grapher Demo]()


## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Running locally or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd knowledge-grapher
   ```

2. **Install all dependencies:**
   From the root folder, run:
   ```bash
   npm run install-all
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `server` directory and add the necessary variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add any NLP API keys if applicable
   ```
   *Create a similar `.env` file in the `client` directory if frontend environment variables are needed.*

4. **Start the Development Servers:**
   Run the following command from the root directory to start both the client and server concurrently:
   ```bash
   npm run dev
   ```

---

## 🌍 Free Deployment Guide

This application is built with a separate Node.js server and a React (Vite) client. We recommend deploying the frontend to **Vercel** and the backend to **Render** for the best free tier performance.

### Part 1: Deploying the Backend on Render
1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository and select it.
4. Configure the service:
   - **Name:** `knowledge-grapher-server`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node server.js`)
5. **Environment Variables:**
   - Go to the **Environment** tab and add your `MONGO_URI`, `JWT_SECRET`, and any other variables from your `.env` file.
6. Click **Create Web Service**. 
   *(Note: Free instances spin down after inactivity and may take ~50 seconds to spin back up on the first request).*
7. **Copy the deployed backend URL** (e.g., `https://knowledge-grapher-server.onrender.com`).

### Part 2: Deploying the Frontend on Vercel
1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Project Name:** `knowledge-grapher-client`
   - **Framework Preset:** Vite
   - **Root Directory:** Edit this and select the `client` folder.
5. **Environment Variables:**
   - Add your backend URL as an environment variable so the frontend knows where to send API requests.
   - Example: `VITE_API_URL` = `https://knowledge-grapher-server.onrender.com/api` (Adjust based on your setup).
6. Click **Deploy**. Vercel will build and host your frontend globally on their CDN.

---

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (or your chosen CSS framework)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **NLP / Visualization:** [List your specific NLP / Graph libraries here]

---

## 📝 License
This project is licensed under the MIT License.
