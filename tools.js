/**
 * Tools Data
 * Research tools and resources shared on the Tools page (tools.html),
 * rendered by tools-renderer.js. Add a new entry to this array to publish
 * another tool — the page renders each one as a self-contained block.
 *
 * DATA STRUCTURE (per tool):
 * - name:        Tool name (string)
 * - version:     Version number without a leading "v" (string)
 * - tagline:     One-line description (string)
 * - description: A short paragraph (string)
 * - license:     Licence name, e.g. "MIT" (string)
 * - plugins:     Key requirements/plugins (string[])
 * - downloadUrl: Direct download link (string)
 * - repoUrl:     Source repository link (string)
 * - inside:      "What's inside" cards — { title, text } (array)
 * - structure:   Folder-tree rows — { depth: 0|1|2, kind: 'root'|'folder'|'file', label } (array)
 * - steps:       Get-started steps (string[])
 */

const tools = [
    {
        "name": "Personae",
        "version": "1.3.0",
        "tagline": "An Obsidian vault for people who research people",
        "description": "A complete working environment for qualitative research about people — everything organised by people, events, places, organisations, concepts and sources, all cross-linked, mapped and timelined. It ships with a Russian Revolution sample to explore before you make it your own.",
        "license": "MIT",
        "plugins": ["Dataview", "Templater", "Leaflet", "Zotero"],
        "downloadUrl": "https://github.com/Muggwoffin/Personae/archive/refs/heads/main.zip",
        "repoUrl": "https://github.com/Muggwoffin/Personae",
        "inside": [
            { "title": "People databases", "text": "Auto-updating Dataview tables of everyone you track." },
            { "title": "Networks & family trees", "text": "A network map, a canvas diagram, and a family tree on every person." },
            { "title": "Maps & timelines", "text": "Self-drawing Leaflet maps and one master chronology of every dated event." },
            { "title": "Zotero citations", "text": "An auto-updating bibliography, citation cards and highlight imports." },
            { "title": "Templates for everything", "text": "Person, place, event, source, interview — applied automatically." },
            { "title": "Interviews & fieldwork", "text": "Oral-history notes: informant, consent, themes, timestamped excerpts." }
        ],
        "structure": [
            { "depth": 0, "kind": "root", "label": "Personae" },
            { "depth": 1, "kind": "file", "label": "Start Here" },
            { "depth": 1, "kind": "folder", "label": "Research Project" },
            { "depth": 2, "kind": "folder", "label": "People · Organisations" },
            { "depth": 2, "kind": "folder", "label": "Locations · Events" },
            { "depth": 2, "kind": "folder", "label": "Sources · Publications" },
            { "depth": 2, "kind": "folder", "label": "Concepts · Interviews" },
            { "depth": 2, "kind": "file", "label": "Master Timeline · Network Map" },
            { "depth": 1, "kind": "folder", "label": "Templates" },
            { "depth": 1, "kind": "folder", "label": "Zotero" },
            { "depth": 1, "kind": "folder", "label": "Vault Settings" }
        ],
        "steps": [
            "Download, unzip, and in Obsidian choose Open folder as vault.",
            "Turn off Restricted mode, enable the plugins, then run Health Check.",
            "Open Project Home — navigation cards, quick-capture and quick-create.",
            "Explore the Russian Revolution sample, then replace it with your own."
        ]
    }
];

// Export for tooling/tests; ignored by the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tools;
}
