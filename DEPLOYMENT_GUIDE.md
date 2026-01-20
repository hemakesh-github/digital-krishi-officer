# Deployment Guide for Farmer Assist Frontend on Render

This guide outlines the steps to deploy your React + Vite "Farmer Assist" frontend application to **Render** as a Static Site.

## 1. Prerequisites
- Your code is pushed to a GitHub repository.
- You have a Render account (https://render.com).

## 2. Create a New Static Site on Render
1.  Log in to your Render dashboard.
2.  Click **"New +"** and select **"Static Site"**.
3.  Connect your GitHub repository.

## 3. Configure Build Settings
Fill in the following details:

*   **Name**: `farmer-assist-frontend` (or your preferred name)
*   **Branch**: `main` (or your working branch)
*   **Root Directory**: `frontend` (Important: since your package.json is inside the frontend folder)
*   **Build Command**: `npm install && npm run build`
*   **Publish Directory**: `dist` (Vite builds to the 'dist' folder by default)

## 4. CRITICAL: Configure Rewrite Rules (Fixing 404s)
React is a Single Page Application (SPA). When you navigate to a route like `/login` or `/home`, the browser asks the server for that specific file. Since those files don't exist (only `index.html` exists), the server returns a 404 error.

To fix this, you **MUST** add a Rewrite Rule:

1.  In your Render service dashboard, go to **"Settings"**.
2.  Scroll down to the **"Redirects / Rewrites"** section.
3.  Click **"Add Rule"**.
4.  Enter the following:
    *   **Source**: `/*`
    *   **Destination**: `/index.html`
    *   **Action**: `Rewrite`
5.  Click **"Save Changes"**.

This rule tells Render: "For any path the user requests (that isn't a real file), serve `index.html` instead." React Router will then take over and show the correct page.

## 5. Verify Deployment
1.  Wait for the build to complete.
2.  Click the URL provided by Render (e.g., `https://farmer-assist-frontend.onrender.com`).
3.  Test navigation:
    *   Go to `/login`.
    *   Log in (User: `farmer`, Pass: `password`).
    *   Refresh the page on `/home` or `/history`. It should **not** show a 404 error.

## Troubleshooting
- **White screen / 404 on load**: Check the Rewrite Rule (Step 4).
- **Build fails**: Ensure "Root Directory" is set to `frontend`.
