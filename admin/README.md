# Admin Panel Setup Guide

A client-side content management system for your GitHub Pages portfolio site. Manage content, upload images, and edit your career timeline without touching the command line.

## Features

✅ **Content Editor** - Edit About section, contact info, and site tagline with live markdown preview
✅ **Image Upload** - Drag-and-drop image uploads directly to your repository
✅ **Timeline Manager** - Add, edit, and delete career milestones with a visual interface
✅ **Dashboard** - View recent commits and quick stats
✅ **Secure** - Uses GitHub Personal Access Token, stored only in session storage

---

## Quick Start

### 1. Generate a GitHub Personal Access Token (PAT)

The admin panel uses a Personal Access Token to authenticate with GitHub and make changes to your repository.

**Steps:**

1. Go to [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)

2. Fill in the token details:
   - **Note**: `Portfolio Admin Panel` (or any descriptive name)
   - **Expiration**: Choose duration (90 days recommended, or "No expiration" for convenience)
   - **Scopes**: Select **`repo`** (Full control of private repositories)
     - This gives access to read and write repository contents

3. Click **"Generate token"**

4. **Copy the token immediately** - you won't be able to see it again!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxx`

5. Store it securely (password manager recommended)

**Important Security Notes:**
- Never share your token publicly
- Never commit it to your repository
- The admin panel stores it only in `sessionStorage` (cleared when tab closes)
- If compromised, revoke it immediately at [github.com/settings/tokens](https://github.com/settings/tokens)

### 2. Access the Admin Panel

Once your repository is deployed on GitHub Pages:

1. Navigate to: `https://yourusername.github.io/your-repo-name/admin/`

2. Enter your credentials:
   - **Personal Access Token**: The token you generated above
   - **Repository**: `username/repository` (e.g., `Muggwoffin/public_history`)
   - **Branch**: The branch your site deploys from (e.g., `main` or `claude/newspaper-portfolio-site-6UqAu`)

3. Click **"Log In"**

4. If authentication succeeds, you'll see the admin dashboard

### 3. Deploy the Admin Folder

If you haven't already added the `/admin` folder to your repository:

```bash
# From your repository root
git add admin/
git commit -m "Add admin panel for content management"
git push origin your-branch-name
```

Wait 2-3 minutes for GitHub Pages to rebuild, then access the admin panel URL.

---

## Using the Admin Panel

### Dashboard

The dashboard shows:
- **Recent Activity**: Last 5 commits to your repository
- **Quick Stats**: Number of timeline projects and uploaded images

### Content Editor

Edit core site content without touching HTML:

1. Click the **"Content Editor"** tab
2. Edit these fields:
   - **About Section**: Your main bio text (supports basic markdown: `**bold**`, `*italic*`, `[link](url)`)
   - **Contact Email**: Your primary email address
   - **Site Tagline**: The subtitle under your name

3. See live markdown preview as you type
4. Click **"Save Changes"** to commit to GitHub
5. Changes appear on your live site after GitHub Pages rebuilds (2-3 minutes)

**Markdown Support:**
- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `[link text](https://example.com)` → clickable link

### Image Upload

Upload images directly to your repository:

1. Click the **"Image Upload"** tab
2. Either:
   - Drag and drop an image onto the dropzone, OR
   - Click the dropzone to browse and select a file

3. Supported formats: PNG, JPG, GIF, WebP
4. Maximum size: 2MB
5. Images are uploaded to `/images/` folder with timestamp prefix

**Using Uploaded Images:**
- Scroll down to see recently uploaded images
- Click **"Copy URL"** to copy the image path
- Use the path in your content: `images/your-image.jpg`

### Timeline Manager

Manage your career timeline projects:

**Add New Project:**
1. Click **"+ Add New Project"**
2. Fill in the form:
   - **Title**: Project or achievement name (required)
   - **Type**: Category (Book, Exhibition, Fellowship, Teaching, Media, Talk)
   - **Scope**: Audience reach (Academic, Public, International, National)
   - **Display Date**: How it appears on timeline (e.g., "2024", "June 2025", "2018-2019")
   - **Sort Date**: Actual date for chronological ordering (YYYY-MM-DD format)
   - **Venue/Institution**: Optional location or organization
   - **Description**: 1-2 sentence summary (required)
   - **Link URL**: Optional external link for more details

3. Click **"Save Project"**
4. Project is added to `projects.js` and appears on your timeline

**Edit Existing Project:**
1. Find the project card in the list
2. Click **"Edit"**
3. Update fields as needed
4. Click **"Save Project"**

**Delete Project:**
1. Find the project card
2. Click **"Delete"**
3. Confirm the deletion
4. Project is removed from `projects.js`

**Important:** All timeline changes create git commits, so they're tracked in your repository history.

---

## Configuration

### Changing Repository or Branch

To manage a different repository or branch:

1. Click **"Log Out"** in the header
2. Enter new repository and branch details
3. Log in again

### Session Persistence

- Authentication is stored in `sessionStorage` (cleared when browser tab closes)
- To stay logged in permanently, use `localStorage` instead (less secure)
- Edit `admin.js` line 20 to change storage method

### Customizing Content Editor

The content editor extracts specific sections from `main.html`:

- **About**: Text between `<p class="drop-cap">...</p>`
- **Tagline**: Text in `<div class="masthead-subtitle">...</div>`
- **Email**: Text after `mailto:` in links

To edit different sections, modify the regex patterns in `admin.js` functions:
- `loadContentForEditing()` (lines 216-239)
- `saveContent()` (lines 241-284)

---

## Troubleshooting

### "Login failed: Invalid token or repository"

**Causes:**
- Incorrect Personal Access Token
- Token doesn't have `repo` scope
- Wrong repository name format (should be `username/repo`, not URL)
- Repository doesn't exist or you don't have access

**Solutions:**
- Verify token at [github.com/settings/tokens](https://github.com/settings/tokens)
- Regenerate token with correct scopes
- Check repository name spelling (case-sensitive)

### "Failed to load timeline: Could not find timelineData"

**Cause:** The `projects.js` file structure doesn't match expected format

**Solution:**
- Ensure `projects.js` contains: `const timelineData = [ ... ];`
- Check for syntax errors in the file
- Use the timeline manager to re-save, which reformats the file correctly

### Changes not appearing on live site

**Cause:** GitHub Pages build delay or cache

**Solutions:**
- Wait 2-3 minutes for GitHub Pages to rebuild
- Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Check repository "Actions" tab for build status
- Verify correct branch is set in repository Settings → Pages

### Image upload fails

**Causes:**
- File over 2MB
- Not an image file
- Network error
- Token lacks write permissions

**Solutions:**
- Compress image before uploading
- Ensure file is PNG, JPG, GIF, or WebP
- Check browser console for detailed error
- Verify token has `repo` scope with write access

### "API request failed" or 403 errors

**Causes:**
- Token expired or revoked
- Rate limit exceeded (5000 requests/hour)
- Insufficient permissions

**Solutions:**
- Regenerate token if expired
- Wait if rate limited (check `X-RateLimit-Reset` header)
- Ensure token has full `repo` scope

### Content editor saves but content doesn't change

**Cause:** HTML structure in `main.html` doesn't match expected patterns

**Solution:**
- Check browser console for errors
- Verify `main.html` contains expected HTML class names:
  - `drop-cap` for about section
  - `masthead-subtitle` for tagline
- Update regex patterns in `admin.js` to match your HTML structure

---

## Advanced: OAuth Setup (Optional)

For enhanced security, you can set up GitHub OAuth instead of using a Personal Access Token. This requires a serverless function or proxy for the token exchange.

### Using Netlify Functions (Recommended)

1. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers)
2. Deploy a Netlify function to handle OAuth callback
3. Update `admin.js` to use OAuth flow instead of PAT

**Example Netlify Function:**

```javascript
// netlify/functions/github-auth.js
exports.handler = async (event) => {
  const { code } = JSON.parse(event.body);

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ token: data.access_token })
  };
};
```

**OAuth App Settings:**
- Homepage URL: `https://yourusername.github.io/your-repo`
- Authorization callback URL: `https://yourusername.github.io/your-repo/admin/`

This approach is more secure but requires additional setup. For a single-user personal site, the PAT method is simpler and sufficient.

---

## Security Best Practices

✅ **DO:**
- Use strong, unique Personal Access Tokens
- Set token expiration (90 days recommended)
- Revoke tokens immediately if compromised
- Use HTTPS (GitHub Pages provides this automatically)
- Log out when done editing on shared computers

❌ **DON'T:**
- Share your token with anyone
- Commit tokens to your repository
- Use overly broad token scopes (only `repo` needed)
- Store tokens in `localStorage` on public computers
- Reuse tokens across multiple sites

---

## Technical Details

### Architecture

- **Frontend**: Pure HTML, CSS, JavaScript (no build step required)
- **Authentication**: GitHub Personal Access Token or OAuth
- **API**: GitHub REST API v3 ([docs.github.com/rest](https://docs.github.com/rest))
- **Storage**: Browser `sessionStorage` for token (cleared on tab close)
- **Deployment**: Static files on GitHub Pages

### API Operations

The admin panel performs these GitHub API operations:

1. **Read file**: `GET /repos/{owner}/{repo}/contents/{path}`
2. **Update file**: `PUT /repos/{owner}/{repo}/contents/{path}` (with `sha`)
3. **Create file**: `PUT /repos/{owner}/{repo}/contents/{path}` (without `sha`)
4. **List commits**: `GET /repos/{owner}/{repo}/commits`
5. **List directory**: `GET /repos/{owner}/{repo}/contents/{path}`

All operations create git commits, maintaining full version history.

### File Structure

```
admin/
├── index.html      # Admin panel UI
├── admin.js        # Client-side logic & GitHub API integration
├── admin.css       # Styling
└── README.md       # This file
```

### Browser Compatibility

Requires modern browsers with support for:
- ES6+ JavaScript (async/await, fetch, arrow functions)
- CSS Grid & Flexbox
- `sessionStorage` API
- `atob`/`btoa` for base64 encoding

Tested and working:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

---

## Future Enhancements

Potential features to add:

- **Rich text editor** with WYSIWYG for About section
- **Image editing** (crop, resize) before upload
- **Bulk operations** (delete multiple projects, upload multiple images)
- **Preview changes** before committing to GitHub
- **Undo/rollback** to previous commit
- **Search/filter** timeline projects
- **Export timeline** as JSON or CSV
- **Media library** with organized folders
- **Two-factor authentication** for enhanced security

Contributions and suggestions welcome!

---

## Support

For issues or questions:

1. Check this README for troubleshooting steps
2. Review browser console for detailed error messages
3. Verify GitHub API status at [githubstatus.com](https://githubstatus.com)
4. Check your repository's commit history for successful saves
5. Consult GitHub API docs: [docs.github.com/rest](https://docs.github.com/rest)

---

## License

This admin panel is part of your personal portfolio site. You're free to modify and extend it as needed. No external dependencies or licenses to worry about!

---

**Last updated**: January 2026
**Version**: 1.0.0
**Compatible with**: GitHub Pages, any git-based hosting with API access
