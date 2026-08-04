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

describe('notes.controller (unit, mocked noteModel)', () => {
  let noteModelStub;
  let notesController;

  beforeEach(() => {
    noteModelStub = {
      create: sinon.stub(),
      findAllByUser: sinon.stub(),
      findById: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub(),
    };

    notesController = proxyquire('../../src/controllers/notes.controller', {
      '../models/noteModel': noteModelStub,
      '../config/logger': noopLogger,
    });
  });

  describe('createNote', () => {
    it('creates a note scoped to the logged-in user and returns 201', async () => {
      noteModelStub.create.resolves({ id: 1, userId: 1, title: 'Title', content: 'Body' });

      const req = { user: { userId: 1 }, body: { title: 'Title', content: 'Body' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.createNote(req, res, next);

      expect(noteModelStub.create.calledWith({ userId: 1, title: 'Title', content: 'Body' })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });
  });

  describe('getNotes', () => {
    it('returns all of the user\'s notes when there is no search term', async () => {
      noteModelStub.findAllByUser.resolves([
        { id: 1, title: 'A', content: 'x' },
        { id: 2, title: 'B', content: 'y' },
      ]);

      const req = { user: { userId: 1 }, query: {} };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.getNotes(req, res, next);

      expect(res.json.firstCall.args[0].notes).to.have.length(2);
    });

    it('filters to only notes matching the search term in title or content', async () => {
      noteModelStub.findAllByUser.resolves([
        { id: 1, title: 'Shopping list', content: 'milk, eggs' },
        { id: 2, title: 'Random', content: 'nothing relevant here' },
      ]);

      const req = { user: { userId: 1 }, query: { search: 'milk' } };
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
    it('returns 200 when the update succeeds', async () => {
      noteModelStub.update.resolves(true);

      const req = { user: { userId: 1 }, params: { id: '1' }, body: { title: 'New', content: 'c' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.updateNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('forwards a 404 AppError when the note is not found or not owned by the user', async () => {
      noteModelStub.update.resolves(false);

      const req = { user: { userId: 1 }, params: { id: '999' }, body: { title: 'New', content: 'c' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.updateNote(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });

  describe('deleteNote', () => {
    it('returns 200 when the delete succeeds', async () => {
      noteModelStub.delete.resolves(true);

      const req = { user: { userId: 1 }, params: { id: '1' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.deleteNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('forwards a 404 AppError when the note is not found or not owned by the user', async () => {
      noteModelStub.delete.resolves(false);

      const req = { user: { userId: 1 }, params: { id: '999' } };
      const res = makeRes();
      const next = sinon.spy();

      await notesController.deleteNote(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });
});
