# Railway.app Deployment Guide (Best for 54MB Files)

## Why Railway?
- ✅ **No file size limits** - Your 54MB zip file will work perfectly
- ✅ **Free tier available** - $5 free credit monthly
- ✅ **Easy setup** - Similar to Render but better
- ✅ **Supports Flask** - Perfect for your API

## Step-by-Step Deployment

### Step 1: Prepare Your Code
1. Make sure all files are committed:
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push
   ```

### Step 2: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### Step 3: Deploy from GitHub
1. Select "Deploy from GitHub repo"
2. Choose your repository
3. Railway will auto-detect Python

### Step 4: Configure Settings
1. **Root Directory:** Set to `backend`
2. **Start Command:** `python app.py`
3. **Environment Variables:** None needed

### Step 5: Deploy
1. Railway will automatically:
   - Install dependencies from `requirements.txt`
   - Start your Flask app
   - Generate a public URL

### Step 6: Get Your URL
- After deployment, Railway gives you a URL like:
  - `https://recipe-api-production.up.railway.app`

### Step 7: Update Frontend
Update `frontend/config.js`:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://your-app-name.up.railway.app';
```

## Important Notes

- **Port:** Railway sets PORT automatically, update app.py:
  ```python
  port = int(os.environ.get('PORT', 5001))
  app.run(host='0.0.0.0', port=port)
  ```

- **Model File:** Your 54MB zip file will be included automatically
- **Free Tier:** $5 credit/month, usually enough for small projects

## Troubleshooting

- **Build fails:** Check Root Directory is `backend`
- **Model not found:** Verify `recipe_model.pkl.zip` is in `backend/` folder
- **Port error:** Make sure app uses `PORT` environment variable

