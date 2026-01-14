# How to Add Images to Your Portfolio Repository

This guide explains how to add the 5 vintage photographs to your portfolio website.

## Required Images

You need these 5 images in the `images/` directory:

1. **street-scene.jpg** - Vintage street scene (Eastern European cityscape)
2. **children-garden.jpg** - Two children in a garden
3. **mother-child.jpg** - Mother holding baby portrait
4. **guinguette.jpg** - La Guinguette Londres illustration
5. **isk-1926.jpg** - ISK 1926 magazine cover (red typography)

## Method 1: Using GitHub Web Interface (Easiest)

### Step 1: Go to Your Repository
Visit: https://github.com/Muggwoffin/public_history

### Step 2: Navigate to Images Folder
1. Click on the **`images`** folder
2. Click **Add file** → **Upload files**

### Step 3: Upload Your Photos
1. Drag and drop all 5 images into the upload area, OR
2. Click "choose your files" and select them from your computer

### Step 4: Name Your Images
**IMPORTANT:** Rename your images to match these exact filenames:
- `street-scene.jpg`
- `children-garden.jpg`
- `mother-child.jpg`
- `guinguette.jpg`
- `isk-1926.jpg`

### Step 5: Commit the Upload
1. At the bottom, add a commit message: "Add vintage photographs for portfolio"
2. Select "Commit directly to the **main** branch"
3. Click **Commit changes**

## Method 2: Using Git Command Line

If you have the images on your local computer:

### Step 1: Save Images to the Directory
```bash
# Navigate to your repository
cd /path/to/public_history

# Copy your images to the images folder with correct names
cp /path/to/your/street-photo.jpg images/street-scene.jpg
cp /path/to/your/garden-photo.jpg images/children-garden.jpg
cp /path/to/your/portrait.jpg images/mother-child.jpg
cp /path/to/your/guinguette.jpg images/guinguette.jpg
cp /path/to/your/isk-cover.jpg images/isk-1926.jpg
```

### Step 2: Add, Commit, and Push
```bash
# Add the images to git
git add images/*.jpg

# Commit with a message
git commit -m "Add vintage photographs for portfolio"

# Push to GitHub
git push origin main
```

## Method 3: Using GitHub Desktop

### Step 1: Open GitHub Desktop
1. Open GitHub Desktop app
2. Make sure you're on the **main** branch
3. Click "Repository" → "Show in Finder/Explorer"

### Step 2: Add Images
1. Navigate to the `images` folder
2. Copy your 5 photos into this folder
3. Rename them to match the required filenames (see above)

### Step 3: Commit and Push
1. Return to GitHub Desktop
2. You'll see the images listed in the "Changes" tab
3. Enter commit message: "Add vintage photographs for portfolio"
4. Click **Commit to main**
5. Click **Push origin**

## Image Specifications

### Recommended Settings:
- **Format:** JPG (best for photographs)
- **Dimensions:** 1200px width (height proportional)
- **File Size:** Under 500KB each for fast loading
- **Quality:** 80-90% JPEG quality

### How to Resize Images (Optional):

**Using Mac Preview:**
1. Open image in Preview
2. Tools → Adjust Size
3. Set width to 1200px (keep "Scale proportionally" checked)
4. Save

**Using Windows Photos:**
1. Open image
2. Click ⋯ (three dots) → Resize
3. Choose "Custom dimensions"
4. Set width to 1200px
5. Save

**Using Online Tool:**
- Visit: https://imageresizer.com
- Upload image, resize to 1200px width
- Download resized version

## After Adding Images

Once you've uploaded the images to GitHub:

1. **Wait 2-3 minutes** for GitHub Pages to rebuild
2. **Visit your live site:** https://muggwoffin.github.io/public_history/
3. **Check:**
   - Landing page shows photos fading in ✓
   - Photo gallery strip displays all 5 images ✓
   - Images have vintage sepia/grayscale effect ✓

## Troubleshooting

### Images Don't Appear:
- **Check filenames:** Must match exactly (case-sensitive)
- **Check file format:** Should be .jpg (not .jpeg, .JPG, .JPEG)
- **Clear browser cache:** Try Ctrl+Shift+R (Cmd+Shift+R on Mac)
- **Wait for deployment:** GitHub Pages can take 2-5 minutes

### Images Look Wrong:
- **Too large:** Resize to 1200px width
- **Wrong aspect ratio:** That's OK - CSS will crop to fit
- **Not vintage looking:** The CSS automatically applies filters

### Images Are Slow to Load:
- **Compress images:** Use https://tinyjpg.com
- **Target file size:** 200-400KB per image
- **Keep dimensions:** 1200px width maximum

## Where Images Are Used

Your images appear in two places:

1. **Landing Page (index.html):**
   - All 5 photos fade in/out as background
   - Grayscale + sepia filters applied
   - Full-screen display

2. **Photo Gallery Strip (main.html):**
   - All 5 photos in thumbnail strip
   - Hover effects (lift + rotate)
   - Grayscale + sepia filters applied

## Need Help?

- Check the console for errors: Right-click → Inspect → Console tab
- Verify images uploaded: https://github.com/Muggwoffin/public_history/tree/main/images
- Review the `images/README.md` file in your repository

---

**Quick Checklist:**
- [ ] Images renamed to exact filenames
- [ ] Images saved as .jpg format
- [ ] Images uploaded to `images/` folder
- [ ] Changes committed to main branch
- [ ] Changes pushed to GitHub
- [ ] Waited 2-3 minutes for deployment
- [ ] Checked live site
