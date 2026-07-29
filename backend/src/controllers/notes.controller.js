const noteModel = require('../models/noteModel');

async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    if (content !== undefined && typeof content !== 'string') {
      return res.status(400).json({ message: 'content must be text' });
    }

    const newNote = await noteModel.create({
      userId: req.user.userId,
      title,
      content: content || ''
    });

    res.status(201).json({ message: 'note created', note: newNote });
  } catch (err) {
    console.error('createNote failed:', err.message);
    res.status(500).json({ message: 'something went wrong creating the note' });
  }
}

async function getNotes(req, res) {
  try {
    const notes = await noteModel.findAllByUser(req.user.userId);

    // basic search - filters by title/content if a ?search= query is passed
    const { search } = req.query;

    // repeated ?search=x&search=y query keys arrive as an array in Express -
    // reject that instead of letting .toLowerCase() crash the request
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ message: 'search must be a single value' });
    }

    const filtered = search
      ? notes.filter(n =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
        )
      : notes;

    res.status(200).json({ notes: filtered });
  } catch (err) {
    console.error('getNotes failed:', err.message);
    res.status(500).json({ message: 'something went wrong fetching notes' });
  }
}

async function getNoteById(req, res) {
  try {
    const note = await noteModel.findById(req.params.id, req.user.userId);

    if (!note) {
      return res.status(404).json({ message: 'note not found' });
    }

    res.status(200).json({ note });
  } catch (err) {
    console.error('getNoteById failed:', err.message);
    res.status(500).json({ message: 'something went wrong fetching the note' });
  }
}

async function updateNote(req, res) {
  try {
    const { title, content } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    if (content !== undefined && typeof content !== 'string') {
      return res.status(400).json({ message: 'content must be text' });
    }

    const updated = await noteModel.update(req.params.id, req.user.userId, { title, content: content || '' });

    if (!updated) {
      // either the note doesn't exist, or it belongs to someone else -
      // keeping the message the same either way so we don't leak which
      return res.status(404).json({ message: 'note not found' });
    }

    res.status(200).json({ message: 'note updated' });
  } catch (err) {
    console.error('updateNote failed:', err.message);
    res.status(500).json({ message: 'something went wrong updating the note' });
  }
}

async function deleteNote(req, res) {
  try {
    const deleted = await noteModel.delete(req.params.id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ message: 'note not found' });
    }

    res.status(200).json({ message: 'note deleted' });
  } catch (err) {
    console.error('deleteNote failed:', err.message);
    res.status(500).json({ message: 'something went wrong deleting the note' });
  }
}

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };