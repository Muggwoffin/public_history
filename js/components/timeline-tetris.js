/**
 * Timeline Tetris — a portfolio easter egg.
 *
 * Turns the rendered CV timeline into a playable filing grid: each falling
 * piece carries one real timeline entry, its category decides the
 * tetromino shape and colour, and locked pieces stay inspectable. Reads
 * the live DOM (so it tracks whatever the timeline currently shows), keeps
 * all state in memory, uses no localStorage, and depends only on SiteCore.
 *
 * Integration points worth noting:
 *  - readTimelineItems() scrapes #timeline-container .timeline-item, so new
 *    timeline data flows in automatically — nothing is hardcoded.
 *  - CATEGORY_SHAPE / CATEGORY_COLOR map the site's 7 timeline categories
 *    onto the 7 standard tetrominoes and the existing badge palette.
 *  - The trigger button is injected beside the existing timeline toggle.
 */

(function () {
    'use strict';

    const { onReady, prefersReducedMotion } = SiteCore;

    const COLS = 10;
    const ROWS = 20;
    const AUDIO_SRC = 'audio/timeline-tetris.mp3';
    const LINES_PER_LEVEL = 6;          // tweak: difficulty ramp
    const BASE_INTERVAL = 800;          // tweak: starting fall speed (ms)
    const LEVEL_STEP = 70;              // tweak: speed-up per level (ms)
    const MIN_INTERVAL = 120;           // tweak: fastest fall (ms)

    // Each of the 7 timeline categories ↔ one standard tetromino.
    // tweak: change which category maps to which shape here.
    const CATEGORY_SHAPE = {
        book:       [[1, 1, 1, 1]],          // I — Publications
        exhibition: [[1, 1], [1, 1]],        // O — Exhibitions
        fellowship: [[0, 1, 0], [1, 1, 1]],  // T — Fellowships
        teaching:   [[0, 1, 1], [1, 1, 0]],  // S — Teaching
        media:      [[1, 1, 0], [0, 1, 1]],  // Z — Media
        talk:       [[1, 0, 0], [1, 1, 1]],  // J — Talks
        education:  [[0, 0, 1], [1, 1, 1]]   // L — Education
    };
    const DEFAULT_SHAPE = [[0, 1, 0], [1, 1, 1]];

    // Colours reuse the timeline badge palette (see timeline.css) so the
    // board stays on-brand. tweak: adjust fill/ink per category here.
    const CATEGORY_COLOR = {
        book:       { fill: '#ece4d2', ink: '#6b5524' },
        exhibition: { fill: '#e7dde4', ink: '#6d4a62' },
        fellowship: { fill: '#f0e0d4', ink: '#8a4a23' },
        teaching:   { fill: '#dfe5d8', ink: '#4a5e3c' },
        media:      { fill: '#f0dcda', ink: '#8e3a33' },
        talk:       { fill: '#dce4e2', ink: '#3d5f58' },
        education:  { fill: '#ece7d2', ink: '#6f6224' }
    };
    const DEFAULT_COLOR = { fill: '#e9e5da', ink: '#5f5e5a' };

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    function rotateCW(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const out = [];
        for (let c = 0; c < cols; c++) {
            out[c] = [];
            for (let r = rows - 1; r >= 0; r--) {
                out[c].push(matrix[r][c]);
            }
        }
        return out;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    // Scrape the rendered timeline into plain data objects.
    function readTimelineItems() {
        const nodes = document.querySelectorAll('#timeline-container .timeline-item');
        const items = [];
        nodes.forEach((node) => {
            const pick = (sel) => {
                const found = node.querySelector(sel);
                return found ? found.textContent.trim() : '';
            };
            items.push({
                type: node.dataset.type || 'fellowship',
                title: pick('.timeline-title'),
                date: pick('.timeline-date'),
                category: pick('.timeline-badge'),
                scope: pick('.timeline-scope'),
                venue: pick('.timeline-venue'),
                description: pick('.timeline-description')
            });
        });
        return items;
    }

    // ----------------------------------------------------------------
    // Game
    // ----------------------------------------------------------------

    class TimelineTetris {
        constructor(items, trigger) {
            this.items = items;
            this.trigger = trigger;            // for restoring focus on exit
            this.reduce = prefersReducedMotion();
            this.grid = this.emptyGrid();
            this.bag = [];
            this.current = null;
            this.next = null;
            this.timer = null;
            this.paused = false;
            this.over = false;
            this.started = false;
            this.piecesLocked = 0;
            this.linesCleared = 0;
            this.level = 1;
            this.seenCategories = new Set();
            this.audio = null;
            this.onKey = this.onKey.bind(this);
        }

        emptyGrid() {
            return Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
        }

        interval() {
            return Math.max(MIN_INTERVAL, BASE_INTERVAL - (this.level - 1) * LEVEL_STEP);
        }

        // ---- lifecycle ----

        open() {
            this.buildUI();
            document.body.appendChild(this.overlay);
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', this.onKey);
            // allow the fade-in transition to run
            requestAnimationFrame(() => this.overlay.classList.add('tt-visible'));
            this.showScreen('intro');
            this.startBtn.focus();
        }

        beginPlay() {
            this.started = true;
            this.hideScreen();
            this.initAudio();
            this.spawn();
            this.schedule();
            this.boardWrap.setAttribute('tabindex', '-1');
            this.boardWrap.focus();
        }

        exit() {
            clearTimeout(this.timer);
            document.removeEventListener('keydown', this.onKey);
            document.body.style.overflow = '';
            if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; }
            this.overlay.classList.remove('tt-visible');
            const remove = () => this.overlay.remove();
            if (this.reduce) remove();
            else setTimeout(remove, 450);
            if (this.trigger) this.trigger.focus();
        }

        initAudio() {
            this.audio = new Audio(AUDIO_SRC);
            this.audio.loop = true;
            this.audio.volume = 0.5;
            // play() is invoked from the Start click, satisfying autoplay rules
            const p = this.audio.play();
            if (p && p.catch) p.catch(() => { /* audio optional */ });
        }

        // ---- piece flow ----

        drawPiece() {
            if (this.bag.length === 0) this.bag = shuffle(this.items.slice());
            const item = this.bag.pop();
            const shape = (CATEGORY_SHAPE[item.type] || DEFAULT_SHAPE).map((r) => r.slice());
            const color = CATEGORY_COLOR[item.type] || DEFAULT_COLOR;
            return { item, shape, color, x: 0, y: 0 };
        }

        spawn() {
            this.current = this.next || this.drawPiece();
            this.next = this.drawPiece();
            const p = this.current;
            p.x = Math.floor((COLS - p.shape[0].length) / 2);
            p.y = 0;
            if (this.collide(p.shape, p.x, p.y)) { this.gameOver(); return; }
            this.seenCategories.add(p.item.type);
            this.renderCard(p.item);
            this.renderNext();
            this.render();
        }

        collide(shape, x, y) {
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (!shape[r][c]) continue;
                    const gx = x + c;
                    const gy = y + r;
                    if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
                    if (gy >= 0 && this.grid[gy][gx]) return true;
                }
            }
            return false;
        }

        // ---- input-driven moves ----

        move(dx) {
            if (this.notPlaying()) return;
            const p = this.current;
            if (!this.collide(p.shape, p.x + dx, p.y)) { p.x += dx; this.render(); }
        }

        rotate() {
            if (this.notPlaying()) return;
            const p = this.current;
            const rotated = rotateCW(p.shape);
            for (const kick of [0, -1, 1, -2, 2]) {
                if (!this.collide(rotated, p.x + kick, p.y)) {
                    p.shape = rotated;
                    p.x += kick;
                    this.render();
                    return;
                }
            }
        }

        softDrop() {
            if (this.notPlaying()) return;
            const p = this.current;
            if (!this.collide(p.shape, p.x, p.y + 1)) {
                p.y += 1;
                this.render();
                this.schedule();           // reset gravity after a manual nudge
            } else {
                clearTimeout(this.timer);
                this.lockAndContinue();
            }
        }

        hardDrop() {
            if (this.notPlaying()) return;
            clearTimeout(this.timer);
            const p = this.current;
            while (!this.collide(p.shape, p.x, p.y + 1)) p.y += 1;
            this.lockAndContinue();
        }

        notPlaying() {
            return !this.started || this.paused || this.over || this.clearing;
        }

        // ---- gravity ----

        schedule() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.gravityTick(), this.interval());
        }

        gravityTick() {
            if (this.paused || this.over || this.clearing) return;
            const p = this.current;
            if (!this.collide(p.shape, p.x, p.y + 1)) {
                p.y += 1;
                this.render();
                this.schedule();
            } else {
                this.lockAndContinue();
            }
        }

        lockAndContinue() {
            const p = this.current;
            for (let r = 0; r < p.shape.length; r++) {
                for (let c = 0; c < p.shape[r].length; c++) {
                    if (!p.shape[r][c]) continue;
                    const gy = p.y + r;
                    const gx = p.x + c;
                    if (gy >= 0) this.grid[gy][gx] = { color: p.color, item: p.item };
                }
            }
            this.piecesLocked += 1;
            this.updateScores();
            this.render();

            const full = [];
            for (let r = 0; r < ROWS; r++) {
                if (this.grid[r].every((cell) => cell)) full.push(r);
            }

            const proceed = () => {
                this.spawn();
                if (!this.over) this.schedule();
            };

            if (full.length === 0) { proceed(); return; }
            this.processClears(full, proceed);
        }

        processClears(full, done) {
            // Gather the distinct CV items being archived on these lines
            const seen = new Set();
            const archived = [];
            full.forEach((r) => {
                this.grid[r].forEach((cell) => {
                    if (cell && !seen.has(cell.item)) {
                        seen.add(cell.item);
                        archived.push(cell.item);
                    }
                });
            });

            this.linesCleared += full.length;
            this.level = 1 + Math.floor(this.linesCleared / LINES_PER_LEVEL);
            this.updateScores();
            this.renderArchived(archived);

            const removeRows = () => {
                full.sort((a, b) => a - b).forEach((r) => {
                    this.grid.splice(r, 1);
                    this.grid.unshift(new Array(COLS).fill(null));
                });
                this.clearing = false;
                this.render();
            };

            if (this.reduce) { removeRows(); done(); return; }

            // Flash the cleared cells, then collapse the rows
            this.clearing = true;
            full.forEach((r) => {
                for (let c = 0; c < COLS; c++) this.cells[r * COLS + c].classList.add('tt-clearing');
            });
            setTimeout(() => { removeRows(); done(); }, 360);
        }

        gameOver() {
            this.over = true;
            clearTimeout(this.timer);
            if (this.audio) this.audio.pause();
            const phases = this.seenCategories.size;
            this.showScreen('over', this.piecesLocked, phases);
        }

        togglePause() {
            if (!this.started || this.over) return;
            if (this.paused) {
                this.paused = false;
                this.hideScreen();
                if (this.audio) this.audio.play().catch(() => {});
                this.schedule();
                this.boardWrap.focus();
            } else {
                this.paused = true;
                clearTimeout(this.timer);
                if (this.audio) this.audio.pause();
                this.showScreen('pause');
            }
        }

        // ---- keyboard ----

        onKey(e) {
            // Exit works from any state
            if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
                e.preventDefault();
                this.exit();
                return;
            }
            if (!this.started || this.over) return;
            if (e.key === 'p' || e.key === 'P') { e.preventDefault(); this.togglePause(); return; }
            if (this.paused) return;
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); this.move(-1); break;
                case 'ArrowRight': e.preventDefault(); this.move(1); break;
                case 'ArrowDown': e.preventDefault(); this.softDrop(); break;
                case 'ArrowUp': case 'x': case 'X': e.preventDefault(); this.rotate(); break;
                case ' ': e.preventDefault(); this.hardDrop(); break;
                default: break;
            }
        }

        // ---- rendering ----

        render() {
            // Compose a display grid: locked cells + the live piece + ghost
            const display = this.grid.map((row) => row.map((cell) => (cell ? { color: cell.color, item: cell.item, active: false, ghost: false } : null)));

            const p = this.current;
            if (p && !this.over) {
                // ghost (hard-drop landing preview)
                let gy = p.y;
                while (!this.collide(p.shape, p.x, gy + 1)) gy += 1;
                for (let r = 0; r < p.shape.length; r++) {
                    for (let c = 0; c < p.shape[r].length; c++) {
                        if (!p.shape[r][c]) continue;
                        const y = gy + r, x = p.x + c;
                        if (y >= 0 && y < ROWS && !display[y][x]) display[y][x] = { color: p.color, item: p.item, ghost: true };
                    }
                }
                // active piece (drawn over ghost)
                for (let r = 0; r < p.shape.length; r++) {
                    for (let c = 0; c < p.shape[r].length; c++) {
                        if (!p.shape[r][c]) continue;
                        const y = p.y + r, x = p.x + c;
                        if (y >= 0 && y < ROWS) display[y][x] = { color: p.color, item: p.item, active: true };
                    }
                }
            }

            for (let i = 0; i < this.cells.length; i++) {
                const cell = this.cells[i];
                const data = display[Math.floor(i / COLS)][i % COLS];
                cell.className = 'tt-cell';
                cell._item = null;
                if (!data) { cell.style.backgroundColor = ''; cell.style.borderColor = ''; continue; }
                if (data.ghost) {
                    cell.classList.add('tt-ghost');
                    cell.style.backgroundColor = '';
                    cell.style.borderColor = data.color.ink;
                } else {
                    cell.classList.add('tt-filled');
                    if (data.active) cell.classList.add('tt-active');
                    cell.style.backgroundColor = data.color.fill;
                    cell.style.borderColor = data.color.ink;
                    cell._item = data.item;     // enables hover inspection
                }
            }
        }

        renderNext() {
            const cells = this.nextCells;
            const shape = this.next.shape;
            const color = this.next.color;
            for (let i = 0; i < cells.length; i++) {
                const r = Math.floor(i / 4), c = i % 4;
                const on = shape[r] && shape[r][c];
                cells[i].className = 'tt-cell';
                cells[i].style.backgroundColor = on ? color.fill : '';
                cells[i].style.borderColor = on ? color.ink : '';
                if (on) cells[i].classList.add('tt-filled');
            }
        }

        renderCard(item) {
            if (!item) return;
            this.cardMeta.textContent = [item.category || item.type, item.date].filter(Boolean).join(' · ');
            this.cardTitle.textContent = item.title || 'Untitled';
            this.cardDesc.textContent = item.venue
                ? item.venue + (item.description ? ' — ' + item.description : '')
                : (item.description || '');
        }

        renderArchived(archived) {
            archived.slice(0, 3).forEach((item) => {
                const li = el('li');
                li.textContent = (item.date ? item.date + ' — ' : '') + (item.title || '');
                this.archivedList.prepend(li);
            });
            while (this.archivedList.children.length > 5) {
                this.archivedList.removeChild(this.archivedList.lastChild);
            }
        }

        updateScores() {
            this.elSorted.textContent = String(this.piecesLocked);
            this.elLines.textContent = String(this.linesCleared);
            this.elLevel.textContent = String(this.level);
        }

        // ---- screens (intro / pause / game over) ----

        showScreen(kind, sorted, phases) {
            const s = this.screen;
            s.textContent = '';
            if (kind === 'intro') {
                s.appendChild(el('div', 'tt-screen-star', '★'));
                s.appendChild(el('h2', null, 'Play Timeline Tetris'));
                s.appendChild(el('p', null, 'See how my career trajectory plays out! Each block is a real item from my CV.'));
                this.startBtn = el('button', 'tt-cta', 'Begin');
                this.startBtn.addEventListener('click', () => this.beginPlay());
                s.appendChild(this.startBtn);
            } else if (kind === 'pause') {
                s.appendChild(el('h2', null, 'Paused'));
                s.appendChild(el('p', null, 'The academic job market awaits. Press P to resume, or Esc to return to the timeline.'));
                const resume = el('button', 'tt-cta', 'Resume');
                resume.addEventListener('click', () => this.togglePause());
                s.appendChild(resume);
            } else if (kind === 'over') {
                s.appendChild(el('div', 'tt-screen-star', '★'));
                s.appendChild(el('h2', null, 'Career stability achieved'));
                s.appendChild(el('p', null, 'You organised ' + sorted + ' CV lines' + (sorted === 1 ? '' : 's') + ' across ' + phases + ' phase' + (phases === 1 ? '' : 's') + '.'));
                const again = el('button', 'tt-cta', 'Play again');
                again.addEventListener('click', () => this.restart());
                s.appendChild(again);
                const back = el('button', 'tt-btn', 'Return to timeline');
                back.style.marginTop = '0.4rem';
                back.addEventListener('click', () => this.exit());
                s.appendChild(back);
            }
            s.classList.add('tt-show');
        }

        hideScreen() {
            this.screen.classList.remove('tt-show');
        }

        restart() {
            this.grid = this.emptyGrid();
            this.bag = [];
            this.current = null;
            this.next = null;
            this.paused = false;
            this.over = false;
            this.clearing = false;
            this.piecesLocked = 0;
            this.linesCleared = 0;
            this.level = 1;
            this.seenCategories = new Set();
            this.archivedList.textContent = '';
            this.updateScores();
            this.hideScreen();
            if (this.audio) { this.audio.currentTime = 0; this.audio.play().catch(() => {}); }
            this.spawn();
            this.schedule();
            this.boardWrap.focus();
        }

        // ---- UI construction ----

        buildUI() {
            this.overlay = el('div', 'tt-overlay');
            this.overlay.setAttribute('role', 'dialog');
            this.overlay.setAttribute('aria-modal', 'true');
            this.overlay.setAttribute('aria-label', 'Timeline Tetris');

            const frame = el('div', 'tt-frame');

            // Header
            const head = el('div', 'tt-head');
            const title = el('div', 'tt-title');
            title.appendChild(el('span', 'tt-title-star', '★'));
            title.appendChild(document.createTextNode('Timeline Tetris'));
            const scores = el('div', 'tt-scores');
            const mkScore = (labelText) => {
                const wrap = el('div', 'tt-score');
                const num = el('span', 'tt-num', '0');
                wrap.appendChild(num);
                wrap.appendChild(el('span', 'tt-lbl', labelText));
                scores.appendChild(wrap);
                return num;
            };
            this.elSorted = mkScore('CV Lines');
            this.elLines = mkScore('Jop Applications');
            this.elLevel = mkScore('Career Milestones');
            this.elLevel.textContent = '1';
            const actions = el('div', 'tt-actions');
            const pauseBtn = el('button', 'tt-btn', 'Pause');
            pauseBtn.setAttribute('aria-label', 'Pause game');
            pauseBtn.addEventListener('click', () => this.togglePause());
            const exitBtn = el('button', 'tt-btn', 'Exit ↩');
            exitBtn.setAttribute('aria-label', 'Exit to timeline');
            exitBtn.addEventListener('click', () => this.exit());
            actions.appendChild(pauseBtn);
            actions.appendChild(exitBtn);
            head.appendChild(title);
            head.appendChild(scores);
            head.appendChild(actions);

            // Body: board + side panel
            const body = el('div', 'tt-body');

            this.boardWrap = el('div', 'tt-board-wrap');
            this.board = el('div', 'tt-board');
            this.board.setAttribute('role', 'grid');
            this.board.setAttribute('aria-label', 'Game board');
            this.cells = [];
            for (let i = 0; i < ROWS * COLS; i++) {
                const c = el('div', 'tt-cell');
                this.board.appendChild(c);
                this.cells.push(c);
            }
            // Delegated hover inspection of locked blocks
            this.board.addEventListener('mouseover', (e) => {
                if (e.target._item) this.renderCard(e.target._item);
            });
            this.board.addEventListener('mouseleave', () => {
                if (this.current) this.renderCard(this.current.item);
            });
            this.screen = el('div', 'tt-screen');
            this.boardWrap.appendChild(this.board);
            this.boardWrap.appendChild(this.screen);

            const side = el('aside', 'tt-side');
            const nowSec = el('section', 'tt-now');
            nowSec.appendChild(el('h3', null, 'Now placing'));
            this.card = el('div', 'tt-card');
            this.card.setAttribute('aria-live', 'polite');
            this.cardMeta = el('div', 'tt-card-meta');
            this.cardTitle = el('div', 'tt-card-title');
            this.cardDesc = el('div', 'tt-card-desc');
            this.card.appendChild(this.cardMeta);
            this.card.appendChild(this.cardTitle);
            this.card.appendChild(this.cardDesc);
            nowSec.appendChild(this.card);

            const nextSec = el('section', 'tt-next');
            nextSec.appendChild(el('h3', null, 'Next'));
            this.nextGrid = el('div', 'tt-next-grid');
            this.nextCells = [];
            for (let i = 0; i < 16; i++) {
                const c = el('div', 'tt-cell');
                this.nextGrid.appendChild(c);
                this.nextCells.push(c);
            }
            nextSec.appendChild(this.nextGrid);

            const archSec = el('section', 'tt-archived');
            archSec.appendChild(el('h3', null, 'Just archived'));
            this.archivedList = el('ul', 'tt-archived-list');
            archSec.appendChild(this.archivedList);

            const hint = el('div', 'tt-hint',
                '← → move · ↑ rotate · ↓ soft drop · space hard drop · P pause · Esc exit');

            side.appendChild(nowSec);
            side.appendChild(nextSec);
            side.appendChild(archSec);
            side.appendChild(hint);

            body.appendChild(this.boardWrap);
            body.appendChild(side);

            // Touch controls (shown via CSS on coarse pointers)
            const touch = el('div', 'tt-touch');
            const mkTouch = (label, aria, handler) => {
                const b = el('button', null, label);
                b.setAttribute('aria-label', aria);
                b.addEventListener('click', handler);
                touch.appendChild(b);
            };
            mkTouch('←', 'Move left', () => this.move(-1));
            mkTouch('⟳', 'Rotate', () => this.rotate());
            mkTouch('→', 'Move right', () => this.move(1));
            mkTouch('↓', 'Soft drop', () => this.softDrop());
            mkTouch('⤓', 'Hard drop', () => this.hardDrop());

            frame.appendChild(head);
            frame.appendChild(body);
            frame.appendChild(touch);
            this.overlay.appendChild(frame);
        }
    }

    // ----------------------------------------------------------------
    // Wiring: inject the trigger beside the timeline toggle
    // ----------------------------------------------------------------

    onReady(() => {
        const host = document.querySelector('.timeline-toggle-container');
        if (!host) return;
        // Only offer the game when there is timeline data to play with
        if (readTimelineItems().length === 0) return;

        const trigger = el('button', 'tt-trigger');
        trigger.type = 'button';
        trigger.setAttribute('aria-label', 'Play Timeline Tetris — an interactive easter egg of the CV');
        trigger.appendChild(el('span', 'tt-trigger-star', '★'));
        trigger.appendChild(document.createTextNode('Play Timeline Tetris'));
        host.appendChild(trigger);

        trigger.addEventListener('click', () => {
            // Re-read items at click time so the game reflects the current timeline
            const items = readTimelineItems();
            if (items.length === 0) return;
            const game = new TimelineTetris(items, trigger);
            game.open();
        });
    });
})();
