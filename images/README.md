# Images Directory

## Required Images

Please add your vintage photographs to this directory with the following filenames:

1. **street-scene.jpg** - The vintage street scene (appears to be Eastern European/Russian)
2. **children-garden.jpg** - Two children in garden photograph
3. **mother-child.jpg** - Mother and baby portrait
4. **guinguette.jpg** - La Guinguette Londres illustrated cover
5. **isk-1926.jpg** - ISK 1926 magazine cover (bold red typography)

## Image Specifications

- **Format:** JPG, PNG, or WebP
- **Recommended dimensions:** 800-1200px width
- **File size:** Keep under 500KB per image for fast loading
- **Quality:** High quality for landing page, will be automatically processed with vintage filters

## Usage

These images are used in two places:
1. **Landing page** (`index.html`) - Photos fade in as background with sepia/grayscale filter
2. **Photo gallery strip** (`main.html`) - Thumbnails displayed at top of main portfolio

The CSS automatically applies:
- Grayscale filter (100%)
- Sepia tone (20%)
- Slight brightness reduction for vintage effect

## Adding More Images

To add additional images to your gallery:
1. Save them to this directory
2. Add new `.gallery-frame` divs in `main.html` (lines 39-51)
3. Update the image paths accordingly

---

**Note:** Make sure image filenames match exactly as specified above, or update the references in `index.html` and `main.html` accordingly.
