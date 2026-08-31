import { useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import client from '../api/client';

const MAX_IMPORT_SIZE = 15 * 1024 * 1024;

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's', 'ul', 'ol', 'li', 'img', 'br'],
  ALLOWED_ATTR: ['src', 'alt', 'title'],
};

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function makeFilename(count) {
  const date = new Date().toISOString().slice(0, 10);
  return `notepad-export-${count}-notes-${date}.html`;
}

function buildHtmlExport(notes, categories) {
  const exportedAt = new Date().toLocaleString();

  const noteSections = notes
    .map((note) => {
      const categoryName =
        categories.find((cat) => cat.slug === note.category)?.name || '';

      const categoryHtml = categoryName
        ? `<div class="note-category">${escapeHtml(categoryName)}</div>`
        : '';

      const content = DOMPurify.sanitize(note.content || '<p></p>', SANITIZE_CONFIG);

      return `
        <article class="note">
          <h1>${escapeHtml(note.title || 'Untitled note')}</h1>
          ${categoryHtml}
          <div class="note-content">${content}</div>
        </article>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NotePad Export</title>
<style>
:root {
  color-scheme: light;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 48px 24px;
  background: #f1e3cf;
  color: #211d19;
  font-family: Arial, Helvetica, sans-serif;
}
.page {
  width: min(900px, 100%);
  margin: 0 auto;
}
.export-heading {
  margin-bottom: 32px;
  padding-bottom: 18px;
  border-bottom: 3px solid #211d19;
}
.export-heading h1 {
  margin: 0 0 8px;
  font-size: 32px;
}
.export-heading p {
  margin: 0;
  color: #6a5e53;
  font-size: 14px;
}
.note {
  margin: 0 0 28px;
  padding: 30px;
  background: #fff8ec;
  border: 2px solid #211d19;
  box-shadow: 7px 7px 0 #211d19;
  break-inside: avoid;
}
.note h1 {
  margin: 0 0 8px;
  font-size: 26px;
  line-height: 1.25;
}
.note-category {
  display: inline-block;
  margin-bottom: 22px;
  padding: 5px 9px;
  border: 1px solid #211d19;
  background: #ead6b8;
  font-size: 12px;
  font-weight: 700;
}
.note-content {
  font-size: 16px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.note-content p {
  margin: 0 0 14px;
}
.note-content h1,
.note-content h2,
.note-content h3 {
  line-height: 1.3;
}
.note-content ul,
.note-content ol {
  padding-left: 28px;
}
.note-content img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 18px auto;
  border: 2px solid #211d19;
}
.note-content a {
  color: inherit;
}
@media print {
  body {
    padding: 0;
    background: #fff;
  }
  .export-heading {
    margin-bottom: 24px;
  }
  .note {
    box-shadow: none;
    margin-bottom: 24px;
  }
}
@media (max-width: 600px) {
  body {
    padding: 24px 14px;
  }
  .note {
    padding: 20px;
  }
}
</style>
</head>
<body>
<main class="page" data-notepad-export="1" data-notepad-version="1">
  <header class="export-heading">
    <h1>NotePad Export</h1>
    <p>${notes.length} note${notes.length === 1 ? '' : 's'} · Exported ${escapeHtml(exportedAt)}</p>
  </header>
  ${noteSections}
</main>
</body>
</html>`;
}

export default function ImportExport({
  categories = [],
  onImported,
  onMessage,
}) {
  const fileInputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportNotes, setExportNotes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const message = (text) => onMessage?.(text);

  const openExport = async () => {
    if (busy || loadingNotes) return;

    setLoadingNotes(true);

    try {
      const { data } = await client.get('/api/notes');
      const notes = Array.isArray(data.notes) ? data.notes : [];

      setExportNotes(notes);
      setSelectedIds(notes.map((note) => note.id));
      setExportOpen(true);
    } catch (err) {
      message(
        err.response?.data?.message ||
          'Could not load your notes for export.'
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  const closeExport = () => {
    if (busy) return;

    setExportOpen(false);
    setSelectedIds([]);
    setExportNotes([]);
  };

  const toggleNote = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(exportNotes.map((note) => note.id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const getSelectedNotes = () => {
    return exportNotes.filter((note) =>
      selectedIds.includes(note.id)
    );
  };

  const handleExportHtml = () => {
    const selectedNotes = getSelectedNotes();

    if (!selectedNotes.length) {
      message('Select at least one note to export.');
      return;
    }

    const html = buildHtmlExport(
      selectedNotes,
      categories
    );

    const filename = makeFilename(
      selectedNotes.length
    );

    downloadBlob(
      filename,
      html,
      'text/html;charset=utf-8'
    );

    closeExport();

    message(
      `Exported ${selectedNotes.length} note${
        selectedNotes.length === 1 ? '' : 's'
      } as HTML 🌐 — ${filename}`
    );
  };

  const handleImportClick = () => {
    if (!busy) {
      fileInputRef.current?.click();
    }
  };

  const importHtml = async (html) => {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(
      html,
      'text/html'
    );

    const root = parsedDocument.querySelector(
      '[data-notepad-export="1"]'
    );

    if (
      !root ||
      root.getAttribute('data-notepad-version') !== '1'
    ) {
      throw new Error(
        'This HTML file was not exported by NotePad.'
      );
    }

    const articles = Array.from(
      root.querySelectorAll('article.note')
    );

    if (!articles.length) {
      throw new Error(
        'The NotePad HTML export does not contain any notes.'
      );
    }

    if (articles.length > 500) {
      throw new Error(
        'An import can contain at most 500 notes.'
      );
    }

    const categoryNames = [
      ...new Set(
        articles
          .map(
            (article) =>
              article
                .querySelector('.note-category')
                ?.textContent?.trim() || ''
          )
          .filter(Boolean)
      ),
    ];

    const categoryMap = new Map();

    for (const categoryName of categoryNames) {
      const existingCategory = categories.find(
        (category) =>
          category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
      );

      if (existingCategory) {
        categoryMap.set(
          categoryName,
          existingCategory.slug
        );
        continue;
      }

      try {
        const { data } = await client.post(
          '/api/categories',
          {
            name: categoryName,
          }
        );

        const createdCategory = data?.category;

        if (createdCategory?.slug) {
          categoryMap.set(
            categoryName,
            createdCategory.slug
          );
        }
      } catch {
        const fallbackCategory = categories.find(
          (category) =>
            category.name.trim().toLowerCase() ===
            categoryName.trim().toLowerCase()
        );

        if (fallbackCategory) {
          categoryMap.set(
            categoryName,
            fallbackCategory.slug
          );
        }
      }
    }

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const article of articles) {
      const title =
        article
          .querySelector('h1')
          ?.textContent?.trim() || '';

      const categoryName =
        article
          .querySelector('.note-category')
          ?.textContent?.trim() || '';

      const contentElement =
        article.querySelector('.note-content');

      if (!title) {
        skipped += 1;
        continue;
      }

      const content = DOMPurify.sanitize(
        contentElement?.innerHTML || '',
        SANITIZE_CONFIG
      );

      try {
        await client.post('/api/notes', {
          title,
          content,
          category:
            categoryMap.get(categoryName) || null,
        });
        imported += 1;
      } catch {
        failed += 1;
      }
    }

    await onImported?.();

    message(
      `Imported ${imported} note${
        imported === 1 ? '' : 's'
      }${skipped ? `, skipped ${skipped}` : ''}${
        failed ? `, failed ${failed}` : ''
      } 📥`
    );
  };
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const lowerName = file.name.toLowerCase();

    const isHtml =
      lowerName.endsWith('.html') ||
      lowerName.endsWith('.htm');

    if (!isHtml) {
      message(
        'Please choose a NotePad .html export file.'
      );
      return;
    }

    if (file.size > MAX_IMPORT_SIZE) {
      message(
        'That export file is too large. Maximum size is 15 MB.'
      );
      return;
    }

    setBusy(true);

    try {
      const text = await file.text();
      await importHtml(text);
    } catch (err) {
      message(
        err.response?.data?.message ||
          err.message ||
          'Could not import your note.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="dash-import-export">
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="dash-import-file"
          onChange={handleImport}
        />

        <button
          type="button"
          className="btn btn-ghost dash-import-export-btn"
          onClick={handleImportClick}
          disabled={busy || loadingNotes}
        >
          {busy ? 'Importing…' : 'Import'}
        </button>

        <button
          type="button"
          className="btn btn-ghost dash-import-export-btn"
          onClick={openExport}
          disabled={busy || loadingNotes}
        >
          {loadingNotes ? 'Loading…' : 'Export'}
        </button>
      </div>

      {exportOpen && (
        <div
          className="export-modal-backdrop"
        >
          <div
            className="export-modal"
          >
            <div className="export-modal-header">
              <div>
                <h2>Select notes to export</h2>
                <p>
                  Choose which notes you want to
                  export.
                </p>
              </div>

              <button
                type="button"
                className="export-modal-close"
                onClick={closeExport}
                disabled={busy}
                aria-label="Close export dialog"
              >
                ✕
              </button>
            </div>

            <div className="export-modal-tools">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={selectAll}
                disabled={!exportNotes.length}
              >
                Select all
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearAll}
                disabled={!selectedIds.length}
              >
                Clear all
              </button>

              <span className="export-selected-count">
                {selectedIds.length} of{' '}
                {exportNotes.length} selected
              </span>
            </div>

            {exportNotes.length === 0 ? (
              <div className="export-empty">
                <strong>
                  No notes to export
                </strong>
                <p>
                  Create a note first, then come
                  back here.
                </p>
              </div>
            ) : (
              <div className="export-note-list">
                {exportNotes.map((note) => {
                  const selected =
                    selectedIds.includes(note.id);

                  return (
                    <label
                      className={`export-note-option ${
                        selected ? 'selected' : ''
                      }`}
                      key={note.id}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleNote(note.id)
                        }
                      />

                      <span className="export-note-check">
                        ✓
                      </span>

                      <span className="export-note-info">
                        <strong>
                          {note.title ||
                            'Untitled note'}
                        </strong>

                        <small>
                          {categories.find(
                            (cat) =>
                              cat.slug ===
                              note.category
                          )?.name ||
                            'No category'}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="export-modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeExport}
                disabled={busy}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExportHtml}
                disabled={
                  !selectedIds.length || busy
                }
              >
                 Export HTML
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}