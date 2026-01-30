# Financial Aid File Upload/Download Configuration

## How It Works

This project supports **two different file handling strategies** based on the environment:

### 1. **Development Environment** (Local Backend + Frontend)
- Files are uploaded via **FormData** to your backend API
- Backend stores files locally and returns **filenames**
- To view files, frontend calls the download API endpoint
- Uses: `/api/financial-aid/files/{fileName}` endpoint

### 2. **Production Environment** (Deployed - Firebase)
- Files are uploaded directly to **Firebase Storage**
- Firebase returns **full URLs** (https://...)
- Backend receives and stores these URLs
- To view files, frontend opens URLs directly (no download API needed)

---

## Configuration

### Development Setup (.env)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_FIREBASE=false
```

### Production Setup (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_USE_FIREBASE=true
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## When to Use Each Approach

### Scenario 1: Both Frontend + Backend are Local (Development)
✅ Set `VITE_USE_FIREBASE=false`
- Files sent to backend via FormData
- Backend stores locally
- Use download API to view files

### Scenario 2: Frontend Deployed, Backend Local (Not Recommended)
⚠️ Set `VITE_USE_FIREBASE=false`
- Won't work well due to CORS and network issues
- Better to deploy both or keep both local

### Scenario 3: Both Frontend + Backend Deployed (Production)
✅ Set `VITE_USE_FIREBASE=true`
- Files uploaded to Firebase
- URLs stored in backend
- Direct file access via URLs

### Scenario 4: Frontend Local, Backend Deployed
✅ Set `VITE_USE_FIREBASE=false` OR `true` depending on backend configuration
- If backend expects files: use `false`
- If backend expects Firebase URLs: use `true` (configure Firebase keys)

---

## Code Flow

### Upload Process

**Development (`VITE_USE_FIREBASE=false`):**
```
User selects files → FormData created → POST to /api/financial-aid/request
→ Backend saves files → Returns filenames in response
```

**Production (`VITE_USE_FIREBASE=true`):**
```
User selects files → Upload to Firebase → Get URLs → POST URLs to /api/financial-aid/request
→ Backend saves URLs → Returns URLs in response
```

### View/Download Process

**Development:**
```
User clicks document → Check if URL or filename → Call downloadFile() API
→ Get Blob → Create Object URL → Open in new tab
```

**Production:**
```
User clicks document → Check if URL → Open URL directly in new tab
```

---

## Backend Requirements

### For Development (Local Files)
Your backend should have:
```java
@PostMapping("/request")
ResponseEntity<FinancialAidResponse> requestFinancialAid(
    @RequestParam MultipartFile idCard,
    @RequestParam MultipartFile universityFees,
    @RequestParam MultipartFile gradeProof,
    // ... other params
)

@GetMapping("/files/{fileName}")
ResponseEntity<Resource> downloadFile(@PathVariable String fileName)
```

### For Production (Firebase URLs)
Your backend should accept:
```java
@PostMapping("/request")
ResponseEntity<FinancialAidResponse> requestFinancialAid(
    @RequestBody FinancialAidApplyRequest request // contains URL strings
)
// No download endpoint needed - files accessed via Firebase URLs
```

---

## How to Switch Environments

### For Development:
1. Ensure backend is running locally
2. Set `VITE_USE_FIREBASE=false` in `.env`
3. Run: `npm run dev`

### For Production Deployment:
1. Configure Firebase credentials in `.env.production`
2. Set `VITE_USE_FIREBASE=true`
3. Build: `npm run build`
4. Deploy the `dist` folder

---

## Testing

### Test Development Mode:
```bash
# 1. Set environment
echo "VITE_USE_FIREBASE=false" > .env

# 2. Start dev server
npm run dev

# 3. Submit a financial aid request with files
# 4. View request details and click on documents
# Files should download from your local backend
```

### Test Production Mode (with Firebase):
```bash
# 1. Configure Firebase in .env.production
# 2. Build for production
npm run build

# 3. Preview production build
npm run preview

# 4. Submit a request - files should upload to Firebase
# 5. View documents - should open Firebase URLs directly
```

---

## Troubleshooting

**Files won't open in development:**
- Check if backend is running
- Verify `/api/financial-aid/files/{fileName}` endpoint works
- Check browser console for errors

**Files won't upload in production:**
- Verify Firebase credentials are correct
- Check Firebase Storage rules allow uploads
- Ensure `VITE_USE_FIREBASE=true`

**Mixed behavior (some files work, some don't):**
- Backend might have both filenames and URLs mixed
- Check the database to see what's stored
- Ensure consistent approach across all requests
