# Netlify Deployment Guide

This guide will help you deploy your TravelGuru app to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your Supabase credentials ready

## Step 1: Prepare Your Repository

Make sure your code is pushed to your Git repository:
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push
```

## Step 2: Deploy via Netlify Dashboard

### Method A: Connect Git Repository (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign in or create an account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Netlify to access your repositories

3. **Select Your Repository**
   - Find and select your `TravelGuru` repository
   - Click "Connect"

4. **Configure Build Settings**
   Netlify should auto-detect these settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 (or latest)

5. **Set Environment Variables**
   Before deploying, click "Show advanced" → "New variable" and add:
   - `VITE_REACT_APP_SUPABASE_URL` - Your Supabase project URL
   - `VITE_REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key

   ⚠️ **Important:** These variables must start with `VITE_` to be accessible in your React app.

6. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)

### Method B: Drag & Drop Deployment

1. Build your app locally:
   ```bash
   npm run build
   ```

2. Go to Netlify Dashboard → "Sites" → "Add new site" → "Deploy manually"

3. Drag and drop the `dist` folder

4. **Note:** You'll need to set environment variables in the Netlify dashboard after deployment.

## Step 3: Configure Supabase Redirect URLs

After deployment, you need to update your Supabase authentication settings:

1. **Go to Supabase Dashboard**
   - Visit your Supabase project dashboard
   - Navigate to: Authentication → URL Configuration

2. **Add Redirect URLs**
   Add your Netlify URLs:
   - `https://your-site-name.netlify.app`
   - `https://your-site-name.netlify.app/*`
   - If you have a custom domain: `https://yourdomain.com` and `https://yourdomain.com/*`

3. **Save Changes**

## Step 4: Test Your Deployment

1. Visit your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. Test the following:
   - ✅ Homepage loads correctly
   - ✅ Navigation works
   - ✅ User can sign up/login
   - ✅ Booking flow works
   - ✅ Protected routes redirect properly

## Step 5: Custom Domain (Optional)

1. In Netlify Dashboard → Site settings → Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Troubleshooting

### Build Fails

- **Check build logs** in Netlify Dashboard → Deploys → Click on failed deploy
- **Common issues:**
  - Missing environment variables
  - Node version mismatch
  - TypeScript errors

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)

### Routing Issues (404 on refresh)

- Verify `public/_redirects` file exists
- Verify `netlify.toml` has redirect rules
- Clear Netlify cache and redeploy

### Supabase Authentication Not Working

- Verify redirect URLs are added in Supabase dashboard
- Check environment variables are set correctly
- Ensure Supabase project is active

## Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy when you push to the main branch
- Create preview deployments for pull requests
- Show build status in your Git repository

## Files Created for Deployment

- ✅ `netlify.toml` - Netlify configuration
- ✅ `public/_redirects` - SPA routing support

## Need Help?

- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
- Netlify Support: [support.netlify.com](https://support.netlify.com)

