# Interactive Timeline Integration Guide

## Overview
This interactive timeline showcases your career milestones, publications, exhibitions, fellowships, teaching, and media appearances in a filterable, accessible format.

## Files Created
1. **projects.js** - Data structure containing all timeline items
2. **timeline.js** - JavaScript logic for rendering and filtering
3. **timeline.css** - Styling for the timeline component

## How to Add to Your Website

### Option 1: Embed in Main Portfolio Page (main.html)

Add this section after your Public History section and before the Newsletter section:

```html
<!-- Timeline Section -->
<section id="timeline">
    <div class="content-section">
        <h2 class="section-headline">CAREER TIMELINE</h2>
        <div class="decorative-line-thin"></div>

        <div class="intro-text">
            <p>Explore my work as a public-facing historian, from archival research and book publications to exhibitions, teaching, and media engagement. Filter by category to see specific types of projects.</p>
        </div>

        <div id="timeline-container"></div>
    </div>
</section>
```

### Option 2: Create a Dedicated Timeline Page

Create a new file `timeline-page.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Timeline - Dr Maurice J. Casey</title>

    <!-- Link to your existing site styles -->
    <link rel="stylesheet" href="style.css">

    <!-- Link to timeline styles -->
    <link rel="stylesheet" href="timeline.css">
</head>
<body>
    <div class="page-wrapper">
        <!-- Masthead -->
        <header class="masthead">
            <h1 class="masthead-title">Dr Maurice J. Casey</h1>
            <div class="masthead-subtitle">Historian & Writer</div>
            <div class="decorative-line"></div>
        </header>

        <!-- Timeline Section -->
        <section id="timeline-page">
            <div class="content-section">
                <h2 class="section-headline">CAREER TIMELINE</h2>
                <div class="decorative-line-thin"></div>

                <div class="intro-text">
                    <p>This timeline showcases my work as a public-facing historian, from archival research and book publications to exhibitions, teaching, and media engagement. Use the filters to explore specific types of projects and milestones.</p>
                </div>

                <div id="timeline-container"></div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="decorative-line"></div>
            <div class="footer-content">
                <p class="colophon">© Dr Maurice J. Casey • All Rights Reserved</p>
            </div>
        </footer>
    </div>

    <!-- Load timeline data and logic -->
    <script src="projects.js"></script>
    <script src="timeline.js"></script>
</body>
</html>
```

### Required Script Tags

Add these script tags at the bottom of your HTML file, just before the closing `</body>` tag:

```html
<!-- Timeline scripts -->
<script src="projects.js"></script>
<script src="timeline.js"></script>
```

### Required CSS Link

Add this in your `<head>` section:

```html
<link rel="stylesheet" href="timeline.css">
```

## Adding New Timeline Items

To add a new achievement or project to the timeline:

1. Open `projects.js`
2. Copy an existing item object
3. Update the fields with your new information
4. Add it to the `timelineData` array

### Example: Adding a New Talk

```javascript
{
    id: 'new-talk-2025',
    title: 'Lecture Title Here',
    type: 'talk',
    date: 'September 2025',
    sortDate: '2025-09-15',
    scope: 'public',
    description: 'Brief description of the talk and its significance.',
    link: 'https://example.com/event',
    venue: 'University Name'
}
```

### Field Definitions

- **id**: Unique identifier (use lowercase, hyphens, include year)
- **title**: Full title of the project/achievement
- **type**: One of: `'book'`, `'exhibition'`, `'fellowship'`, `'teaching'`, `'media'`, `'talk'`
- **date**: Display format (e.g., "2024", "June 2025", "2018-2019")
- **sortDate**: YYYY-MM-DD format for chronological sorting
- **scope**: One of: `'academic'`, `'public'`, `'international'`, `'national'`
- **description**: 1-2 sentence summary (be concise and engaging)
- **link**: External URL (or `null` if none)
- **venue**: Institution/location (or `null` if not applicable)

## Customization

### Changing Colors

Edit `timeline.css` to customize badge colors. The badge color classes are:

```css
.timeline-badge-book { /* Books - blue */
.timeline-badge-exhibition { /* Exhibitions - purple */
.timeline-badge-fellowship { /* Fellowships - orange */
.timeline-badge-teaching { /* Teaching - green */
.timeline-badge-media { /* Media - pink */
.timeline-badge-talk { /* Talks - teal */
```

### Adjusting Layout

The timeline is set to a max-width of 900px. To change this:

```css
#timeline-container {
    max-width: 1000px; /* Adjust as needed */
}
```

## Accessibility Features

The timeline includes:
- Keyboard navigation (arrow keys) for filters
- ARIA labels and roles for screen readers
- Focus indicators for interactive elements
- Semantic HTML structure
- Live region announcements for filter changes
- High contrast text and good color contrast ratios

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

The timeline is lightweight and fast:
- No external dependencies (vanilla JavaScript)
- Minimal CSS (under 10KB)
- Smooth animations using CSS transforms
- Efficient rendering and filtering

## Troubleshooting

### Timeline doesn't appear
- Check that all three files are in the same directory as your HTML file
- Ensure script tags are in the correct order (projects.js before timeline.js)
- Check browser console for JavaScript errors

### Items not filtering correctly
- Verify that `type` values in projects.js match exactly: 'book', 'exhibition', 'fellowship', 'teaching', 'media', 'talk'
- Check that sortDate is in YYYY-MM-DD format

### Styling conflicts
- Timeline uses specific class names starting with `timeline-` to avoid conflicts
- If needed, increase CSS specificity or add `!important` to override styles

## Future Enhancements

Consider adding:
- Search functionality to find specific items by keyword
- Date range filtering (e.g., "Show only 2020-2024")
- Export to PDF/print view
- Detailed modal popups for each item with more information
- Integration with your newsletter section to highlight recent additions

## Support

For questions or issues with the timeline component, refer to:
- The inline comments in each file
- This integration guide
- Modern JavaScript and CSS documentation at MDN Web Docs
