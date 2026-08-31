import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import client from '../api/client';
import ConfirmDialog from './ConfirmDialog';

const ImageNode = Node.create({
  name: 'image',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrap = document.createElement('div');
      wrap.className = 'note-image-wrap';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      if (node.attrs.title) img.title = node.attrs.title;
      wrap.appendChild(img);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'note-image-remove';
      removeBtn.setAttribute('aria-label', 'Remove image');
      removeBtn.title = 'Remove image';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof getPos !== 'function') return;
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .run();
      });
      wrap.appendChild(removeBtn);

      return {
        dom: wrap,
        selectNode() {
          wrap.classList.add('is-selected');
        },
        deselectNode() {
          wrap.classList.remove('is-selected');
        },
      };
    };
  },
});

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function NoteEditor({
  note,
  defaultCategory,
  categories = [],
  onClose,
  onSaved,
  onDeleted,
}) {
  const isEditing = Boolean(note?.id);
  const imageInputRef = useRef(null);

  const [title, setTitle] = useState(note?.title || '');
  const [category, setCategory] = useState(note?.category || defaultCategory || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, ImageNode],
    content: note?.content || '',
  });

  useEffect(() => {
    setTitle(note?.title || '');
    setCategory(note?.category || defaultCategory || '');

    if (editor && !editor.isDestroyed) {
      const currentHTML = editor.getHTML();
      const newHTML = note?.content || '';
      if (currentHTML !== newHTML) {
        editor.commands.setContent(newHTML);
      }
    }
  }, [note, editor, defaultCategory]);

  const handleImageClick = () => {
    if (!saving && !deleting) imageInputRef.current?.click();
  };

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Please choose an image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string' || !editor) return;

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: reader.result,
            alt: file.name,
            title: file.name,
          },
        })
        .run();

      setError('');
    };

    reader.onerror = () => {
      setError('Could not read that image.');
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give your note a title first.');
      return;
    }

    setSaving(true);
    setError('');

    const content = editor?.getHTML() || '';

    try {
      const payload = {
        title: title.trim(),
        content,
        category: category || null,
      };

      if (isEditing) {
        await client.put(`/api/notes/${note.id}`, payload);
      } else {
        await client.post('/api/notes', payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;

    setDeleting(true);
    setError('');

    try {
      await client.delete(`/api/notes/${note.id}`);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the note.');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <div className="editor-header">
          <input
            className="editor-title-input"
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <select
            className="editor-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            title="Category"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="button" className="editor-close" onClick={onClose} aria-label="Close editor">
            ✕
          </button>
        </div>

        {editor && (
          <div className="editor-toolbar">
            <button
              type="button"
              className={editor.isActive('bold') ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <b>B</b>
            </button>

            <button
              type="button"
              className={editor.isActive('italic') ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <i>I</i>
            </button>

            <button
              type="button"
              className={editor.isActive('strike') ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <s>S</s>
            </button>

            <button
              type="button"
              className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              H2
            </button>

            <button
              type="button"
              className={editor.isActive('bulletList') ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              • List
            </button>

            <button
              type="button"
              className={editor.isActive('orderedList') ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              1. List
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="editor-image-input"
              onChange={handleImageSelected}
            />

            <button
              type="button"
              className="editor-image-button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleImageClick}
              title="Insert image"
            >
              🖼️ Image
            </button>
          </div>
        )}

        <div className="editor-content-area">
          <EditorContent editor={editor} />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="editor-footer">
          {isEditing && (
            <button
              type="button"
              className="btn btn-ghost editor-delete"
              onClick={() => setConfirmingDelete(true)}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}

          <div className="editor-footer-right">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || deleting}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message="This can't be undone."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          busy={deleting}
        />
      )}
    </div>
  );
}
