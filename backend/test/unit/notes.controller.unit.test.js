const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

function makeRes() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
}

const noopLogger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };

describe('notes controller', () => {
  let noteModelStub;
  let categoryModelStub;
  let notesController;

  beforeEach(() => {
    noteModelStub = {
      create: sinon.stub(),
      findAllByUser: sinon.stub(),
      findById: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub(),
    };
    categoryModelStub = {
      findBySlug: sinon.stub(),
    };

    notesController = proxyquire('../../src/controllers/notes.controller', {
      '../models/noteModel': noteModelStub,
      '../models/categoryModel': categoryModelStub,
      '../config/logger': noopLogger,
    });
  });

  describe('createNote', () => {
    it('creates a note', async () => {
      noteModelStub.create.resolves({ id: 1, userId: 1, title: 'Title', content: 'Body', category: null });

      const req = { user: { userId: 1 }, body: { title: 'Title', content: 'Body' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.createNote(req, res, next);

      expect(noteModelStub.create.calledWith({ userId: 1, title: 'Title', content: 'Body', category: null })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('passes the category through when it belongs to the user', async () => {
      categoryModelStub.findBySlug.resolves({ id: 3, slug: 'ideas' });
      noteModelStub.create.resolves({ id: 1, userId: 1, title: 'Title', content: 'Body', category: 'ideas' });

      const req = { user: { userId: 1 }, body: { title: 'Title', content: 'Body', category: 'ideas' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.createNote(req, res, next);

      expect(categoryModelStub.findBySlug.calledWith(1, 'ideas')).to.be.true;
      expect(noteModelStub.create.calledWith({ userId: 1, title: 'Title', content: 'Body', category: 'ideas' })).to.be.true;
    });

    it('someone else\'s category -> rejected', async () => {
      categoryModelStub.findBySlug.resolves(undefined);

      const req = { user: { userId: 1 }, body: { title: 'Title', content: 'Body', category: 'someone-elses' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.createNote(req, res, next);

      expect(noteModelStub.create.called).to.be.false;
      expect(next.firstCall.args[0].statusCode).to.equal(400);
    });
  });

  describe('getNotes', () => {
    it('returns all of the user\'s notes when there is no search term', async () => {
      noteModelStub.findAllByUser.resolves([
        { id: 1, title: 'A', content: 'x' },
        { id: 2, title: 'B', content: 'y' },
      ]);

      const req = { user: { userId: 1 }, validatedQuery: {} };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNotes(req, res, next);

      expect(res.json.firstCall.args[0].notes).to.have.length(2);
    });

    it('passes the category filter down to the model', async () => {
      noteModelStub.findAllByUser.resolves([{ id: 1, title: 'A', content: 'x', category: 'study' }]);

      const req = { user: { userId: 1 }, validatedQuery: { category: 'study' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNotes(req, res, next);

      expect(noteModelStub.findAllByUser.calledWith(1, 'study')).to.be.true;
    });

    it('filters to only notes matching the search term in title or content', async () => {
      noteModelStub.findAllByUser.resolves([
        { id: 1, title: 'Shopping list', content: 'milk, eggs' },
        { id: 2, title: 'Random', content: 'nothing relevant here' },
      ]);

      const req = { user: { userId: 1 }, validatedQuery: { search: 'milk' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNotes(req, res, next);

      const notes = res.json.firstCall.args[0].notes;
      expect(notes).to.have.length(1);
      expect(notes[0].id).to.equal(1);
    });
  });

  describe('getNoteById', () => {
    it('returns the note when found', async () => {
      noteModelStub.findById.resolves({ id: 1, title: 'Title' });

      const req = { user: { userId: 1 }, params: { id: '1' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNoteById(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('forwards a 404 AppError when the note does not exist or is not the user\'s', async () => {
      noteModelStub.findById.resolves(undefined);

      const req = { user: { userId: 1 }, params: { id: '999' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNoteById(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });

  describe('updateNote', () => {
    it('update works', async () => {
      noteModelStub.update.resolves(true);

      const req = { user: { userId: 1 }, params: { id: '1' }, body: { title: 'New', content: 'c' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.updateNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('not your category -> 400', async () => {
      categoryModelStub.findBySlug.resolves(undefined);

      const req = { user: { userId: 1 }, params: { id: '1' }, body: { title: 'New', content: 'c', category: 'not-mine' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.updateNote(req, res, next);

      expect(noteModelStub.update.called).to.be.false;
      expect(next.firstCall.args[0].statusCode).to.equal(400);
    });

    it('note not found/not yours -> 404', async () => {
      noteModelStub.update.resolves(false);

      const req = { user: { userId: 1 }, params: { id: '999' }, body: { title: 'New', content: 'c' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.updateNote(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });

  describe('deleteNote', () => {
    it('delete works', async () => {
      noteModelStub.delete.resolves(true);

      const req = { user: { userId: 1 }, params: { id: '1' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.deleteNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('404 if not found/not yours', async () => {
      noteModelStub.delete.resolves(false);

      const req = { user: { userId: 1 }, params: { id: '999' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.deleteNote(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });
});