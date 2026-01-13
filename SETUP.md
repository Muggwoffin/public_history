# Portfolio Website Setup Guide

## Overview
Your new 1920s/30s radical newspaper-style portfolio website has been created with:
- A dramatic landing page with vintage photo fade-in animations
- Tabbed navigation: Research, Books, TV & Radio, Contact, Newsletter
- Ornate newspaper aesthetic inspired by The New Masses
- Vintage photo gallery integration
- Fully responsive design

## Adding Your Images

### Required Images
Place your images in the `images/` directory with these filenames:

1. **street-scene.jpg** - The vintage street scene photograph
2. **children-garden.jpg** - The children in garden photograph
3. **mother-child.jpg** - The mother and child portrait
4. **guinguette.jpg** - La Guinguette Londres illustration
5. **isk-1926.jpg** - The ISK 1926 magazine cover

### Image Specifications
- Format: JPG, PNG, or WebP
- Recommended size: 800-1200px width for landing page
- Gallery thumbnails will be automatically cropped to square
- Images will be styled with grayscale/sepia filters for vintage effect

## Customizing Content

### Landing Page (`index.html`)
- Line 26: Update your name if needed
- Line 28: Update your title/subtitle

### Main Portfolio (`main.html`)
Update the following sections with your actual content:

#### Research Tab
- Lines 66-90: Replace placeholder articles with your publications
- Lines 95-120: Update your CV details (education, positions)

#### Books Tab
- Lines 136-165: Add your book details and cover images
- Replace `.book-cover-placeholder` divs with `<img>` tags for real covers

#### TV & Radio Tab
- Lines 185-215: Add your documentary and media work
- Include links to watch/listen

#### Contact Tab
- Lines 238-270: Update email addresses and institutional info
- Add your social media profile links

#### Newsletter Tab
- Lines 290: Update newsletter form action URL (connect to your email service)
- Lines 315-335: Add your recent newsletter archive

### Styling Adjustments

To make the site more or less ornate, edit `style.css`:

**More ornate:**
- Add more decorative elements in masthead
- Increase border widths
- Add more ornamental characters (◆, ❖, ✦)

**Less ornate:**
- Remove `.masthead-ornament-top` elements
- Simplify `.decorative-line-ornate` to basic line
- Remove ornamental pseudo-elements

## Color Customization

Edit colors in `style.css` (lines 16-22):
```css
--ink-black: #1a1a1a;        /* Main text color */
--newsprint-white: #f5f5f0;  /* Background */
--radical-red: #c41e3a;      /* Accent color */
--gray-rule: #4a4a4a;        /* Secondary text */
--light-gray: #d4d4d0;       /* Borders */
```

## Typography

Current fonts:
- **Headlines:** Playfair Display (bold, dramatic serifs)
- **Body:** Libre Baskerville (classic book serif)
- **Navigation:** Franklin Gothic (period-appropriate sans-serif)

To change fonts, update the Google Fonts import on line 31 of `style.css`.

## Adding More Photos

To add more photos to the gallery strip:
1. Add images to `images/` directory
2. In `main.html` (lines 39-51), duplicate a `.gallery-frame` div
3. Update the image source and alt text

## Newsletter Integration

To make the newsletter form functional:
1. Sign up for an email service (Mailchimp, ConvertKit, Substack, etc.)
2. Get your form action URL
3. Update line 290 in `main.html`: `<form action="YOUR_URL" method="post">`

## GitHub Pages Deployment

1. Go to repository Settings → Pages
2. Select branch: `claude/newspaper-portfolio-site-6UqAu`
3. Select folder: `/ (root)`
4. Click Save
5. Your site will be live at: `https://muggwoffin.github.io/public_history/`

## Browser Testing

Test your site in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if possible)
- Mobile devices

## File Structure

```
public_history/
├── index.html          # Landing page with photo animations
├── main.html           # Main portfolio with tabs
├── landing.css         # Landing page styles
├── style.css           # Main site styles
├── images/             # Your photos directory
└── SETUP.md           # This file
```

## Support

For questions or issues:
- Check the HTML comments in each file
- Review CSS section comments for styling logic
- All animations are defined in `landing.css` and `style.css`

## Next Steps

1. ✓ Add your 5 images to the `images/` directory
2. ✓ Update content in `main.html` with your actual work
3. ✓ Update contact information and links
4. ✓ Test locally by opening `index.html` in a browser
5. ✓ Push to GitHub and enable GitHub Pages
6. ✓ Share your new portfolio!

---

**Design Philosophy:** This site balances historical authenticity with modern usability. The 1920s/30s radical newspaper aesthetic is ornate but not cluttered—bold typography, dramatic red accents, and vintage photography create a distinctive scholarly presence while remaining highly readable and professional.
