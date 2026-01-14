# Portfolio Website Integration Guide

## Image Upload Paths

Add your images to the `/images/` directory with these exact filenames:

### Landing Page Background
- **passport-background.jpg**
  - Your 1920s passport image
  - Recommended size: 1920x1080px or larger
  - The image will be faded with a 92% white overlay for readability
  - Upload to: `/images/passport-background.jpg`

### Research Section
- **research.jpg**
  - An image representing your academic research (archival photo, historical document, etc.)
  - Size: 800-1200px width, 4:5 aspect ratio preferred
  - Upload to: `/images/research.jpg`

### About Section - Author Photo
- **author-photo.jpg**
  - Professional portrait-style photograph
  - Size: 900x1200px (3:4 aspect ratio)
  - Will be displayed with vintage sepia filter
  - Hover effect: photo lifts slightly and zooms
  - Upload to: `/images/author-photo.jpg`

### Popular Writing - Outlet Logos
- **outlet-logo-1.png** - Logo for first publication
- **outlet-logo-2.png** - Logo for second publication
- **outlet-logo-3.png** - Logo for third publication
  - Format: PNG with transparent background preferred
  - Size: 300x100px or similar horizontal format
  - Will be displayed in 60px height container
  - Upload to: `/images/outlet-logo-1.png`, etc.

## Apple Podcasts Embed Integration

### How to Get Apple Podcasts Embed Code:

1. **Find Your Episode on Apple Podcasts:**
   - Go to https://podcasts.apple.com
   - Search for the podcast and find your episode

2. **Get the Embed Link:**
   - Click the share button (•••) on the episode
   - Select "Copy Embed Code" or copy the episode URL
   - The embed URL format: `https://embed.podcasts.apple.com/us/podcast/[podcast-name]/id[podcast-id]?i=[episode-id]`

3. **Update main.html:**
   - Find the two instances of `YOUR_APPLE_PODCAST_EMBED_URL_1` and `YOUR_APPLE_PODCAST_EMBED_URL_2`
   - Replace with your actual Apple Podcasts embed URLs

**Example:**
```html
<iframe src="https://embed.podcasts.apple.com/us/podcast/history-unplugged/id1234567890?i=1000567890123"
    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
    frameborder="0"
    height="175"
    style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;"
    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation">
</iframe>
```

### Update Episode Information:
In `main.html`, update these sections for each podcast:
- **`.podcast-title`** - The episode title
- **`.podcast-meta`** - "Podcast Name • Date"
- **`.podcast-description`** - What you discussed in the episode

## Substack Newsletter Integration

### Step 1: Get Your Substack Embed Code

1. **Go to Your Substack Dashboard:**
   - Log in to your Substack account
   - Go to Settings → Publication details

2. **Get the Embed Code:**
   - Your Substack URL format: `https://[yourname].substack.com`
   - Embed URL format: `https://[yourname].substack.com/embed`

3. **Update main.html:**
   - Find `YOUR_SUBSTACK_URL` in the Newsletter section
   - Replace with your actual Substack username

**Example:**
```html
<iframe src="https://mauricecasey.substack.com/embed"
    width="100%"
    height="320"
    style="border:1px solid #EEE; background:white;"
    frameborder="0"
    scrolling="no">
</iframe>
```

### Alternative: Use Substack's Native Embed

Substack provides a customizable embed widget:

1. Go to https://[yourname].substack.com/publish/settings
2. Click on "Get embed code"
3. Copy the full embed code
4. Replace the entire `<div id="substack-embed-container">` section with Substack's code

**Substack's full embed includes:**
- Subscribe button
- Email input field
- Automatic styling
- Built-in subscriber management

## Content Updates Required

### Research Section (main.html, lines ~76-95)
Replace placeholders with your actual academic articles:
- Article titles
- Journal names and years
- Article abstracts/excerpts
- Links to articles (DOI, journal website, or PDF)

### Popular Writing Section (main.html, lines ~192-237)
For each of the three writing examples:
- Add outlet logo images
- Update article titles
- Add publication dates
- Write brief excerpts
- Add links to online articles

### About Section (main.html, line ~26)
- Add your author photo
- Update the biography text
- Customize academic background sections

## File Checklist

Upload these files to `/images/` directory:

```
images/
├── passport-background.jpg   (1920s passport for landing page background)
├── research.jpg              (Represents academic research)
├── author-photo.jpg          (Your professional portrait)
├── outlet-logo-1.png         (First publication logo)
├── outlet-logo-2.png         (Second publication logo)
├── outlet-logo-3.png         (Third publication logo)
├── street-scene.jpg          (Already exists - About section)
├── children-garden.jpg       (Already exists - Contact section)
├── mother-child.jpg          (Already exists - Books section)
├── guinguette.jpg            (Already exists - Public History section)
└── isk-1926.jpg             (Already exists - Newsletter section)
```

## Quick Upload Method (GitHub Web Interface)

1. Go to: https://github.com/Muggwoffin/public_history
2. Navigate to the `images` folder
3. Click **Add file** → **Upload files**
4. Drag and drop all your images
5. **Important:** Ensure filenames match exactly as listed above
6. Commit message: "Add portfolio images"
7. Commit directly to your branch
8. Wait 2-3 minutes for GitHub Pages to rebuild

## Testing Your Changes

After uploading:

1. **Landing Page:**
   - Background should show faded passport image
   - Title should be clearly readable on semi-transparent white background
   - All 6 photo cards should display
   - Captions should animate in after photos

2. **About Section:**
   - Author photo should appear on left (desktop) or top (mobile)
   - Hover over photo should lift it slightly with subtle zoom

3. **Research Section:**
   - Research image card on landing page links here
   - Three academic articles should display

4. **Public History:**
   - Two podcast players should be embedded and playable
   - Three writing examples with logos should display in grid

5. **Newsletter:**
   - Substack embed should show subscribe form
   - Should match your Substack theme

## Troubleshooting

### Images Not Showing:
- Check filenames match exactly (case-sensitive)
- Verify images are in `/images/` directory
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait for GitHub Pages to rebuild (2-5 minutes)

### Podcast Embeds Not Working:
- Verify embed URL format is correct
- Check that episode is publicly available
- Try the episode in Apple Podcasts web player first

### Substack Not Loading:
- Verify your Substack publication is public
- Check the URL format: `https://[yourname].substack.com/embed`
- Try embedding on a test page first

## Need Help?

Common issues:
1. **Images too large:** Resize to recommended dimensions
2. **Wrong aspect ratio:** Crop images to specified ratios
3. **Logos not centered:** Use PNG with transparent background
4. **Mobile not responsive:** Clear cache and test in incognito mode

---

**Next Steps:** Once all images are uploaded and embeds are configured, your portfolio will be complete! Test on desktop, tablet, and mobile to ensure everything displays correctly.
