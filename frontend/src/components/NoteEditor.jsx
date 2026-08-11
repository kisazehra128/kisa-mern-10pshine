import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import client from '../api/client';

// note=null means we're creating a new one, otherwise editing
export default function NoteEditor({ note, onClose, onSaved, onDeleted }) {
  const isEditing = Boolean(note);
  const [title, setTitle] = useState(note?.title || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
  });

  // reset fields when switching notes
  useEffect(() => {
    setTitle(note?.title || '');
    if (editor) {
      editor.commands.setContent(note?.content || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give your note a title first.');
      return;
    }
    setSaving(true);
    setError('');
    const content = editor?.getHTML() || '';
    try {
      if (isEditing) {
        await client.put(`/api/notes/${note.id}`, { title, content });
      } else {
        await client.post('/api/notes', { title, content });
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
    }
  };

  return (
    <div className="editor-overlay" onClick={onClose}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <input
            className="editor-title-input"
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <button className="editor-close" onClick={onClose} aria-label="Close editor">✕</button>
        </div>

        {editor && (
          <div className="editor-toolbar">
            <button
              type="button"
              className={editor.isActive('bold') ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </button>
            <button
              type="button"
              className={editor.isActive('italic') ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </button>
            <button
              type="button"
              className={editor.isActive('strike') ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              S
            </button>
            <button
              type="button"
              className={editor.isActive('bulletList') ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              • List
            </button>
            <button
              type="button"
              className={editor.isActive('orderedList') ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              1. List
            </button>
            <button
              type="button"
              className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
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
              className="btn btn-ghost editor-delete"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <div className="editor-footer-right">
            <button className="btn btn-ghost" onClick={onClose} disabled={saving || deleting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || deleting}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}