# Implementation Guide: Site Enhancements

This guide provides step-by-step instructions for implementing all requested features.

## Table of Contents

1. [Timeline Layout & Behavior](#1-timeline-layout--behavior)
2. [Author Photo Easter Egg](#2-author-photo-easter-egg)
3. [Admin Panel: Events Manager](#3-admin-panel-events-manager)
4. [Admin Panel: Reading & Books](#4-admin-panel-reading--books)
5. [Admin Panel: Landing Images](#5-admin-panel-landing-images)
6. [Admin Panel: Statistics](#6-admin-panel-statistics)
7. [Testing Checklist](#testing-checklist)

---

## 1. Timeline Layout & Behavior

### Files Modified
- `main.html` (lines 45-67)
- `style.css` (add contents from `updates-styles.css`)

### Implementation Steps

#### Step 1.1: Update HTML Structure

Open `main.html` and replace the timeline section (lines ~45-67) with:

```html
<!-- Timeline Section -->
<section id="timeline">
    <div class="content-section">
        <!-- UPDATED: Centered heading -->
        <h2 class="section-headline" style="text-align: center;">CAREER TIMELINE</h2>
        <div class="decorative-line-thin"></div>

        <!-- Intro text at top -->
        <div class="intro-text">
            <p>Explore my CV as an interactive timeline, from archival research and book publications to exhibitions, teaching, and media engagement.</p>
        </div>

        <!-- UPDATED: Toggle button moved below intro, centered -->
        <div class="timeline-toggle-container">
            <button
                id="timeline-toggle"
                class="timeline-toggle-btn"
                aria-expanded="false"
                aria-controls="timeline-content">
                <span class="toggle-text">View Timeline</span>
                <svg class="toggle-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>

        <!-- UPDATED: Content wrapper starts collapsed -->
        <div id="timeline-content" class="timeline-content-wrapper collapsed">
            <div id="timeline-container"></div>
        </div>
    </div>
</section>
```

#### Step 1.2: Update Toggle Script

Find the timeline toggle script (around line 355) and replace with:

```javascript
// Timeline toggle functionality - collapsed by default
const timelineToggle = document.getElementById('timeline-toggle');
const timelineContent = document.getElementById('timeline-content');

if (timelineToggle && timelineContent) {
    timelineToggle.addEventListener('click', function() {
        const isExpanded = timelineToggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            // Collapse
            timelineContent.classList.add('collapsed');
            timelineToggle.setAttribute('aria-expanded', 'false');
            timelineToggle.querySelector('.toggle-text').textContent = 'View Timeline';
        } else {
            // Expand
            timelineContent.classList.remove('collapsed');
            timelineToggle.setAttribute('aria-expanded', 'true');
            timelineToggle.querySelector('.toggle-text').textContent = 'Collapse Timeline';
        }
    });
}
```

#### Step 1.3: Add CSS

Append to `style.css`:

```css
/* Timeline centered heading */
#timeline .section-headline {
    text-align: center;
}

/* Timeline toggle container */
.timeline-toggle-container {
    text-align: center;
    margin: 1.5rem 0;
}

.timeline-toggle-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--ink-black);
    color: var(--newsprint-white);
    border: 2px solid var(--ink-black);
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.timeline-toggle-btn:hover {
    background-color: var(--newsprint-white);
    color: var(--ink-black);
}

.timeline-toggle-icon {
    display: inline-block;
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
}

.timeline-toggle-btn[aria-expanded="false"] .timeline-toggle-icon {
    transform: rotate(-90deg);
}

/* Timeline content - starts collapsed */
.timeline-content-wrapper {
    max-height: 5000px;
    overflow: hidden;
    transition: max-height 0.5s ease, opacity 0.3s ease;
    opacity: 1;
}

.timeline-content-wrapper.collapsed {
    max-height: 0;
    opacity: 0;
}
```

---

## 2. Author Photo Easter Egg

### Files Modified
- `main.html` (line ~29)
- `style.css` (add from `updates-styles.css`)
- New file: `author-easter-egg.js`

### Implementation Steps

#### Step 2.1: Update Author Photo HTML

In `main.html`, find the author photo (line ~29) and update:

```html
<div class="author-photo-container">
    <div class="author-photo">
        <!-- UPDATED: Added data-alt-src and class -->
        <img
            src="images/author-photo.jpg"
            data-alt-src="images/author-photo-alt.jpg"
            alt="Dr Maurice J. Casey"
            class="author-photo-img">
    </div>
</div>
```

#### Step 2.2: Create Alternate Photo

Upload a second author photo to: `images/author-photo-alt.jpg`

#### Step 2.3: Add CSS Animation

Append to `style.css`:

```css
.author-photo-img {
    transition: filter 0.2s ease, transform 0.2s ease;
    cursor: pointer;
}

.author-photo-img.mirage-transition {
    animation: mirage 0.7s ease;
}

@keyframes mirage {
    0% {
        filter: none;
        transform: none;
    }
    30% {
        filter: blur(1px);
        transform: scaleX(1.015);
    }
    50% {
        filter: blur(2px);
        transform: scaleX(1.03);
        opacity: 0.95;
    }
    70% {
        filter: blur(1px);
        transform: scaleX(1.015);
    }
    100% {
        filter: none;
        transform: none;
        opacity: 1;
    }
}

.author-photo-container:focus {
    outline: 2px solid var(--radical-red);
    outline-offset: 4px;
}
```

#### Step 2.4: Add JavaScript

The file `author-easter-egg.js` is already created. Add it to `main.html` before `</body>`:

```html
<script src="author-easter-egg.js"></script>
```

---

## 3. Admin Panel: Events Manager

### New Files
- `admin/admin-events.js`
- `events.js` (data file)
- `events-renderer.js` (front-end renderer)

### Implementation Steps

#### Step 3.1: Add Data File

The file `events.js` is already created. Upload it to your repository root.

#### Step 3.2: Update Main HTML for Events

In `main.html`, find the events section (line ~168) and replace with:

```html
<h3 class="subsection-heading">Upcoming Events</h3>

<!-- UPDATED: Events dynamically rendered -->
<div class="events-calendar">
    <!-- Events inserted here by events-renderer.js -->
</div>
```

#### Step 3.3: Add Front-End Renderer

Add to `main.html` before `</body>`:

```html
<script src="events.js"></script>
<script src="events-renderer.js"></script>
```

#### Step 3.4: Add Admin Tab

In `admin/index.html`, add to the navigation:

```html
<button class="nav-tab" data-section="events-manager">Events & Timeline</button>
```

Add section content:

```html
<section id="events-manager" class="admin-content" style="display: none;">
    <!-- Generated by admin-events.js -->
</section>
```

Add script before `</body>`:

```html
<script src="admin-events.js"></script>
```

#### Step 3.5: Initialize in Admin

Update your `switchSection` function to include:

```javascript
case 'events-manager':
    if (typeof initEventsManager === 'function') initEventsManager();
    break;
```

---

## 4. Admin Panel: Reading & Books

### New Files
- `admin/admin-content.js`
- `reading.js` (data file)
- `books.js` (data file)
- `reading-modal.js` (front-end)
- `books-renderer.js` (front-end)

### Implementation Steps

#### Step 4.1: Add Data Files

Upload `reading.js` and `books.js` to repository root.

#### Step 4.2: Update Books Section HTML

In `main.html`, replace the books section (line ~70-90):

```html
<section id="books">
    <div class="content-section">
        <h2 class="section-headline">BOOKS</h2>
        <div class="decorative-line-thin"></div>

        <!-- UPDATED: Dynamic rendering -->
        <div class="books-container">
            <!-- Books inserted here -->
        </div>
    </div>
</section>
```

#### Step 4.3: Add Reading Modal HTML

Before `</body>` in `main.html`, add:

```html
<!-- What I'm Reading Modal -->
<div id="reading-modal" style="display: none;">
    <div class="reading-modal-content">
        <button id="close-reading-modal" class="reading-modal-close" aria-label="Close">&times;</button>
        <h2 class="reading-book-title">Loading...</h2>
        <p class="reading-author">by Author Name</p>
        <img src="" alt="" class="reading-cover">
        <p class="reading-note"></p>
    </div>
</div>
```

#### Step 4.4: Add Front-End Scripts

Add to `main.html` before `</body>`:

```html
<script src="reading.js"></script>
<script src="books.js"></script>
<script src="reading-modal.js"></script>
<script src="books-renderer.js"></script>
```

#### Step 4.5: Add Admin Tab

In `admin/index.html`:

```html
<button class="nav-tab" data-section="content-boxes">Content Boxes</button>
```

```html
<section id="content-boxes" class="admin-content" style="display: none;">
    <div id="reading-editor"></div>
    <hr class="section-divider">
    <div id="books-manager"></div>
</section>
```

```html
<script src="admin-content.js"></script>
```

Update `switchSection`:

```javascript
case 'content-boxes':
    if (typeof initReadingEditor === 'function') initReadingEditor();
    if (typeof initBooksManager === 'function') initBooksManager();
    break;
```

---

## 5. Admin Panel: Landing Images

### New Files
- `admin/admin-images.js`
- `landing-config.js` (data file)
- `carousel.js` (front-end)

### Implementation Steps

#### Step 5.1: Add Data File

Upload `landing-config.js` to repository root.

#### Step 5.2: Create Image Directories

Create directories:
- `images/landing/hero/`
- `images/landing/about/`

#### Step 5.3: Add Carousel Script

Add to `main.html` before `</body>`:

```html
<script src="landing-config.js"></script>
<script src="carousel.js"></script>
```

#### Step 5.4: Mark Elements for Rotation

Add `data-carousel` attributes to elements you want to rotate. For example:

```html
<!-- For background images -->
<div class="hero-section" data-carousel="hero" style="background-image: url('images/landing/hero/default.jpg')">
</div>

<!-- For img tags -->
<img src="images/landing/about/default.jpg" data-carousel="about" alt="About photo">
```

#### Step 5.5: Add Admin Tab

In `admin/index.html`:

```html
<button class="nav-tab" data-section="landing-images">Landing Images</button>
```

```html
<section id="landing-images" class="admin-content" style="display: none;">
    <div id="landing-images-manager"></div>
</section>
```

```html
<script src="admin-images.js"></script>
```

Update `switchSection`:

```javascript
case 'landing-images':
    if (typeof initLandingImagesManager === 'function') initLandingImagesManager();
    break;
```

---

## 6. Admin Panel: Statistics

### New Files
- `admin/admin-statistics.js`

### Implementation Steps

#### Step 6.1: Add Statistics Tab

In `admin/index.html`:

```html
<button class="nav-tab" data-section="statistics">Statistics</button>
```

```html
<section id="statistics" class="admin-content" style="display: none;">
    <div id="statistics-dashboard"></div>
</section>
```

```html
<script src="admin-statistics.js"></script>
```

Update `switchSection`:

```javascript
case 'statistics':
    if (typeof initStatisticsDashboard === 'function') initStatisticsDashboard();
    break;
```

#### Step 6.2: Configure Analytics Provider

1. Open admin panel
2. Go to Statistics tab
3. Select your analytics provider (Google Analytics 4, Plausible, or Fathom)
4. Enter your Site ID and API key
5. Click "Save Config"
6. Click "Fetch Statistics"

**Note:** For production use with Google Analytics 4, you'll need to:
- Set up OAuth2 authentication
- Use Google Analytics Data API v1
- Handle CORS properly

The current implementation includes mock data for demonstration.

---

## 7. Add Admin CSS

Append the contents of `admin-extensions.css` to your `admin/admin.css` file.

---

## Testing Checklist

### Timeline
- [ ] Timeline section heading is centered
- [ ] Timeline starts collapsed on page load
- [ ] Button says "View Timeline" when collapsed
- [ ] Button says "Collapse Timeline" when expanded
- [ ] Toggle button is centered below intro text
- [ ] Timeline expands/collapses smoothly
- [ ] Icon rotates with state change

### Author Photo Easter Egg
- [ ] Photo shows mirage shimmer on click
- [ ] Photo swaps to alternate image after shimmer
- [ ] Clicking again swaps back to original
- [ ] Works with keyboard (Enter/Space when focused)
- [ ] No layout shift during animation

### Events (Front-End)
- [ ] Events render dynamically from events.js
- [ ] Upcoming events appear first
- [ ] Past events appear below (if enabled)
- [ ] Events sorted chronologically
- [ ] Date and time formatted correctly
- [ ] Registration links work

### Events (Admin)
- [ ] Can add new events
- [ ] Can edit existing events
- [ ] Can delete events (with confirmation)
- [ ] Events save to events.js in repository
- [ ] Changes appear on live site after commit

### Reading Modal
- [ ] "What I'm Reading" link opens modal
- [ ] Modal populated from reading.js
- [ ] Close button works
- [ ] Clicking overlay closes modal
- [ ] Escape key closes modal

### Reading (Admin)
- [ ] Can load current reading
- [ ] Can update all fields
- [ ] Changes save to reading.js
- [ ] Changes appear on site

### Books (Front-End)
- [ ] Books render dynamically from books.js
- [ ] Books sorted by year (newest first)
- [ ] All book details display correctly
- [ ] Links work

### Books (Admin)
- [ ] Can add new books
- [ ] Can edit existing books
- [ ] Can delete books (with confirmation)
- [ ] Changes save to books.js
- [ ] Changes appear on site

### Landing Images (Admin)
- [ ] Can create new image boxes
- [ ] Can upload multiple images to each box
- [ ] Can delete images
- [ ] Can delete entire boxes
- [ ] Configuration saves to landing-config.js

### Landing Images (Front-End)
- [ ] Images rotate daily
- [ ] All visitors see same image on same day
- [ ] Images cycle through entire array

### Statistics
- [ ] Can configure analytics provider
- [ ] Config saves to localStorage
- [ ] Can fetch statistics
- [ ] Stats display correctly
- [ ] Referrers table shows
- [ ] Countries table shows

---

## Helper Functions

### GitHub API Functions

These functions are referenced in admin scripts but should be in your main `admin.js`:

```javascript
/**
 * Fetch file from GitHub
 */
async function fetchFileFromGitHub(path) {
    const response = await fetch(
        `${AdminApp.apiBase}/repos/${AdminApp.repoOwner}/${AdminApp.repoName}/contents/${path}?ref=${AdminApp.branch}`,
        {
            headers: {
                'Authorization': `token ${AdminApp.token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Update file on GitHub
 */
async function updateFileOnGitHub(path, content, sha, message) {
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const response = await fetch(
        `${AdminApp.apiBase}/repos/${AdminApp.repoOwner}/${AdminApp.repoName}/contents/${path}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${AdminApp.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                content: base64Content,
                sha: sha,
                branch: AdminApp.branch
            })
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    // Implement your notification system
    console.log(`[${type}] ${message}`);
    // Or use a toast library, etc.
}
```

---

## Troubleshooting

### Timeline doesn't collapse
- Check that `collapsed` class is added to `.timeline-content-wrapper`
- Verify CSS for `.collapsed` class exists
- Check browser console for JavaScript errors

### Author photo doesn't swap
- Verify `data-alt-src` attribute is set
- Check that alternate image exists at specified path
- Check browser console for errors

### Events/Books don't render
- Verify data files (events.js, books.js) are loaded
- Check that renderer scripts are included after data files
- Open browser console and check for errors
- Verify DOM elements exist (`.events-calendar`, `.books-container`)

### Admin can't save
- Check GitHub token has write permissions
- Verify repository owner and name are correct
- Check network tab for API errors
- Ensure file SHAs are current

### Images don't rotate
- Verify `data-carousel` attributes match keys in landing-config.js
- Check that carousel.js is loaded
- Verify image paths are correct
- Check browser console for errors

---

## File Checklist

Upload these files to your repository:

### Root Directory
- [ ] `events.js`
- [ ] `reading.js`
- [ ] `books.js`
- [ ] `landing-config.js`
- [ ] `events-renderer.js`
- [ ] `books-renderer.js`
- [ ] `reading-modal.js`
- [ ] `author-easter-egg.js`
- [ ] `carousel.js`

### Admin Directory
- [ ] `admin/admin-events.js`
- [ ] `admin/admin-content.js`
- [ ] `admin/admin-images.js`
- [ ] `admin/admin-statistics.js`

### Images Directory
- [ ] `images/author-photo-alt.jpg` (your alternate photo)
- [ ] `images/landing/hero/` (directory)
- [ ] `images/landing/about/` (directory)

### Modified Files
- [ ] `main.html` (timeline, author photo, events, books, scripts)
- [ ] `style.css` (append updates-styles.css content)
- [ ] `admin/index.html` (new tabs and sections)
- [ ] `admin/admin.css` (append admin-extensions.css content)
- [ ] `admin/admin.js` (add helper functions if not present)

---

## Next Steps

1. **Test locally first:** Run a local server and test all features
2. **Commit incrementally:** Don't commit everything at once
3. **Test on staging:** Use a staging branch if possible
4. **Deploy to production:** Merge to main when confident

---

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check network tab for failed requests
3. Verify all files are uploaded correctly
4. Check GitHub API rate limits
5. Ensure permissions are correct

---

This guide should provide everything needed for a production-ready implementation. All code is modular, well-commented, and follows best practices.
