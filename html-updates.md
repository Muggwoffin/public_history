# HTML Updates for main.html

## 1. ABOUT Section - Updated Author Photo (lines ~21-43)

Replace the author photo section with:

```html
<!-- About Section -->
<section id="about">
    <div class="content-section">
        <h2 class="section-headline">ABOUT</h2>
        <div class="decorative-line-thin"></div>

        <div class="about-layout">
            <div class="author-photo-container">
                <div class="author-photo">
                    <!-- UPDATED: Added data-alt-src and class for Easter egg -->
                    <img
                        src="images/author-photo.jpg"
                        data-alt-src="images/author-photo-alt.jpg"
                        alt="Dr Maurice J. Casey"
                        class="author-photo-img">
                </div>
            </div>
            <div class="intro-text">
                <p class="drop-cap">I am an Irish historian based in Belfast, where I am a AHRC-funded Research Fellow at Queen's University. My work traces how early twentieth century revolutionaries navigated the messiness of day-to-day life. This has led me to explore topics as varied as the anti-Nazi underground, Irish nationalism, the Comintern and queer sexuality.</p>

                <div class="reading-links-container">
                    <a href="#" class="reading-link" id="readingLink">📖 What I'm Reading</a>
                    <a href="YOUR_GOOGLE_DOC_URL_HERE" target="_blank" rel="noopener noreferrer" class="reading-link archive-link">🍽️ The Archive Food Guide</a>
                </div>
            </div>
        </div>

    </div>
</section>
```

## 2. TIMELINE Section - Restructured (lines ~45-67)

Replace the timeline section with:

```html
<!-- Timeline Section -->
<section id="timeline">
    <div class="content-section">
        <!-- UPDATED: Centered heading, removed button from header -->
        <h2 class="section-headline" style="text-align: center;">CAREER TIMELINE</h2>
        <div class="decorative-line-thin"></div>

        <!-- Intro text now at top -->
        <div class="intro-text">
            <p>Explore my CV as an interactive timeline, from archival research and book publications to exhibitions, teaching, and media engagement.</p>
        </div>

        <!-- UPDATED: Toggle button moved below intro, centered, collapsed by default -->
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

## 3. PUBLIC HISTORY Section - Events Container (lines ~136-190)

Replace the events calendar section with:

```html
<h3 class="subsection-heading">Upcoming Events</h3>

<!-- UPDATED: Events will be dynamically rendered by events-renderer.js -->
<div class="events-calendar">
    <!-- Events dynamically inserted here -->
</div>
```

## 4. BOOKS Section - Dynamic Rendering (lines ~70-90)

Replace the books section with:

```html
<!-- Books Section -->
<section id="books">
    <div class="content-section">
        <h2 class="section-headline">BOOKS</h2>
        <div class="decorative-line-thin"></div>

        <!-- UPDATED: Books will be dynamically rendered by books-renderer.js -->
        <div class="books-container">
            <!-- Books dynamically inserted here -->
        </div>
    </div>
</section>
```

## 5. READING MODAL - Add Before Closing </body> Tag

Add this modal structure before the closing `</body>` tag:

```html
<!-- What I'm Reading Modal -->
<div id="reading-modal" style="display: none;">
    <div class="reading-modal-content">
        <button id="close-reading-modal" class="reading-modal-close" aria-label="Close modal">&times;</button>
        <h2 class="reading-book-title">Loading...</h2>
        <p class="reading-author">by Author Name</p>
        <img src="" alt="" class="reading-cover">
        <p class="reading-note"></p>
    </div>
</div>
```

## 6. SCRIPT TAGS - Update Before Closing </body> Tag

Replace the scripts section (lines ~350-378) with:

```html
<script>
    // Reading modal trigger (keep existing modal code if any)
    // ... existing modal code ...

    // UPDATED: Timeline toggle functionality - collapsed by default
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
</script>

<!-- Data files -->
<script src="events.js"></script>
<script src="reading.js"></script>
<script src="books.js"></script>
<script src="landing-config.js"></script>

<!-- Timeline scripts -->
<script src="projects.js"></script>
<script src="timeline.js"></script>

<!-- New feature scripts -->
<script src="events-renderer.js"></script>
<script src="books-renderer.js"></script>
<script src="reading-modal.js"></script>
<script src="author-easter-egg.js"></script>
<script src="carousel.js"></script>
</body>
</html>
```

## 7. CSS FILE - Add to style.css

Add the contents of `updates-styles.css` to your main `style.css` file.

## Implementation Checklist

- [ ] Update ABOUT section with data-alt-src attribute and class
- [ ] Create alternate author photo at `images/author-photo-alt.jpg`
- [ ] Update TIMELINE section structure (centered heading, moved button)
- [ ] Update BOOKS section for dynamic rendering
- [ ] Update EVENTS section for dynamic rendering
- [ ] Add reading modal HTML
- [ ] Update script tags at end of file
- [ ] Add new CSS from updates-styles.css to style.css
- [ ] Ensure all new .js files are uploaded
- [ ] Ensure all new data files are uploaded
