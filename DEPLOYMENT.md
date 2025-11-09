# SmoothSky SSG Deployment Guide

This document outlines the steps to deploy SmoothSky with Static Site Generation (SSG) enabled.

## Prerequisites

- Node.js and npm installed
- All dependencies installed (`npm install`)
- `tsx` package installed as dev dependency ✅

## Step 1: Add build:ssg Script to package.json

**⚠️ MANUAL STEP REQUIRED** 

Add the following script to the `"scripts"` section in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:ssg": "vite build && tsx scripts/prerender.tsx",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Step 2: Build with SSG

Run the SSG build pipeline:

```bash
npm run build:ssg
```

This will:
1. Run `vite build` to create the production bundle in `dist/`
2. Execute `scripts/prerender.tsx` to generate static HTML for all routes in `scripts/routes-to-prerender.json`

## Step 3: Verify Generated Files

Check that all static HTML files were created:

```bash
node -e "const fs=require('fs');function t(p,i=0){for(const f of fs.readdirSync(p)){const s=p+'/'+f;const d=fs.statSync(s);console.log('  '.repeat(i)+(d.isDirectory()?f+'/':f));if(d.isDirectory())t(s,i+1)}};t('dist')"
```

Expected structure:
```
dist/
  index.html                              (/ - home page)
  search/
    index.html                            (/search)
  results/
    JFK-LAX/
      2026-01-10/
        index.html                        (/results/JFK-LAX/2026-01-10)
    MIA-BOG/
      2026-01-10/
        index.html                        (/results/MIA-BOG/2026-01-10)
  assets/
    [bundled JS/CSS files]
```

## Step 4: Deploy to Lovable

### Option A: Update Lovable Deploy Settings (Recommended)

If your Lovable project has CI/CD settings accessible:
1. Navigate to your project deployment settings
2. Change the build command from `npm run build` to `npm run build:ssg`
3. Click "Update" to deploy

### Option B: Manual Deployment

1. Run `npm run build:ssg` locally
2. Upload the `dist/` folder contents to your hosting provider
3. Ensure the hosting provider serves `index.html` files from subdirectories

### Option C: Lovable Default Deploy (Fallback)

If you cannot change the build command:
1. The regular `npm run build` will still work
2. The site will function as an SPA (Single Page Application)
3. SSG benefits won't apply, but the app will still work correctly

## Step 5: Verify Deployment

Test these URLs with JavaScript **disabled** in your browser:

1. **Home**: `https://your-domain.com/` 
   - Should show hero content and test links
   
2. **Search**: `https://your-domain.com/search`
   - Should show search form
   
3. **Results (JFK-LAX)**: `https://your-domain.com/results/JFK-LAX/2026-01-10`
   - Should show flight results table
   
4. **Results (MIA-BOG)**: `https://your-domain.com/results/MIA-BOG/2026-01-10`
   - Should show flight results table

## Acceptance Criteria

✅ All routes render full HTML content with JavaScript disabled  
✅ With JavaScript enabled, React hydrates and SPA navigation works  
✅ No changes to application functionality or UI  
✅ Search engines can crawl all pre-rendered content  

## Troubleshooting

### Issue: Subpath routes return 404

If `/search` or `/results/...` routes return 404 errors, the hosting provider may not be configured to serve `index.html` from subdirectories.

**Solutions:**
1. Configure the hosting provider to enable "directory indexes" or "clean URLs"
2. Add redirect rules (e.g., Netlify `_redirects`, Vercel `vercel.json`)
3. Use the fallback public/snapshots approach (see below)

### Fallback: Public Snapshots

As a last resort, copy generated HTML files to `/public/snapshots/`:

```bash
# After running npm run build:ssg
mkdir -p public/snapshots/search
mkdir -p public/snapshots/results/JFK-LAX/2026-01-10
mkdir -p public/snapshots/results/MIA-BOG/2026-01-10

cp dist/search/index.html public/snapshots/search/
cp dist/results/JFK-LAX/2026-01-10/index.html public/snapshots/results/JFK-LAX/2026-01-10/
cp dist/results/MIA-BOG/2026-01-10/index.html public/snapshots/results/MIA-BOG/2026-01-10/
```

These will be accessible at:
- `https://your-domain.com/snapshots/search/`
- `https://your-domain.com/snapshots/results/JFK-LAX/2026-01-10/`
- `https://your-domain.com/snapshots/results/MIA-BOG/2026-01-10/`

## Additional Resources

- [React Server-Side Rendering Docs](https://react.dev/reference/react-dom/server/renderToString)
- [React Router SSR Guide](https://reactrouter.com/en/main/guides/ssr)
- [Vite SSR Documentation](https://vitejs.dev/guide/ssr.html)

## Support

For issues specific to Lovable deployment, contact Lovable support or check the documentation at https://docs.lovable.dev/
