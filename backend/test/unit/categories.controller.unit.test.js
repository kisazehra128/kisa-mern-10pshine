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

describe('categories.controller (unit, mocked models)', () => {
  let categoryModelStub;
  let noteModelStub;
  let categoriesController;

  beforeEach(() => {
    categoryModelStub = {
      create: sinon.stub(),
      findAllByUser: sinon.stub(),
      findBySlug: sinon.stub(),
      findById: sinon.stub(),
      deleteById: sinon.stub(),
    };
    noteModelStub = {
      countByCategory: sinon.stub(),
      clearCategory: sinon.stub(),
    };

    categoriesController = proxyquire('../../src/controllers/categories.controller', {
      '../models/categoryModel': categoryModelStub,
      '../models/noteModel': noteModelStub,
      '../config/logger': noopLogger,
    });
  });

  describe('createCategory', () => {
    it('slugifies the name and creates the category', async () => {
      categoryModelStub.findBySlug.resolves(undefined);
      categoryModelStub.create.resolves({ id: 1, userId: 1, name: 'Weekend Trips', slug: 'weekend-trips', icon: 'folder.png' });

      const req = { user: { userId: 1 }, body: { name: 'Weekend Trips' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.createCategory(req, res, next);

      expect(categoryModelStub.create.calledWith({
        userId: 1, name: 'Weekend Trips', slug: 'weekend-trips', icon: 'folder.png',
      })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('uses the given icon instead of the default when provided', async () => {
      categoryModelStub.findBySlug.resolves(undefined);
      categoryModelStub.create.resolves({ id: 1, userId: 1, name: 'Books', slug: 'books', icon: 'note.png' });

      const req = { user: { userId: 1 }, body: { name: 'Books', icon: 'note.png' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.createCategory(req, res, next);

      expect(categoryModelStub.create.calledWith({
        userId: 1, name: 'Books', slug: 'books', icon: 'note.png',
      })).to.be.true;
    });

    it('rejects a name that slugifies to nothing', async () => {
      const req = { user: { userId: 1 }, body: { name: '!!!' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.createCategory(req, res, next);

      expect(categoryModelStub.create.called).to.be.false;
      expect(next.firstCall.args[0].statusCode).to.equal(400);
    });

    it('rejects a duplicate category for the same user', async () => {
      categoryModelStub.findBySlug.resolves({ id: 5, slug: 'study' });

      const req = { user: { userId: 1 }, body: { name: 'Study' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.createCategory(req, res, next);

      expect(categoryModelStub.create.called).to.be.false;
      expect(next.firstCall.args[0].statusCode).to.equal(409);
    });

    it('turns a DB unique-constraint race into the same 409', async () => {
      categoryModelStub.findBySlug.resolves(undefined);
      const dupErr = new Error('duplicate');
      dupErr.code = 'ER_DUP_ENTRY';
      categoryModelStub.create.rejects(dupErr);

      const req = { user: { userId: 1 }, body: { name: 'Study' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.createCategory(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(409);
    });
  });

  describe('getCategories', () => {
    it('merges category definitions with their note counts', async () => {
      categoryModelStub.findAllByUser.resolves([
        { id: 1, slug: 'study', name: 'Study', icon: 'study.png' },
        { id: 2, slug: 'ideas', name: 'Ideas', icon: 'ideas.png' },
      ]);
      noteModelStub.countByCategory.resolves([
        { category: 'study', count: 3 },
        { category: null, count: 5 },
      ]);

      const req = { user: { userId: 1 } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.getCategories(req, res, next);

      const body = res.json.firstCall.args[0];
      expect(body.total).to.equal(8);
      expect(body.categories).to.deep.equal([
        { id: 1, slug: 'study', name: 'Study', icon: 'study.png', count: 3 },
        { id: 2, slug: 'ideas', name: 'Ideas', icon: 'ideas.png', count: 0 },
      ]);
    });
  });

  describe('deleteCategory', () => {
    it('deletes the category and clears it off any notes using it', async () => {
      categoryModelStub.findById.resolves({ id: 5, userId: 1, slug: 'study', name: 'Study' });
      categoryModelStub.deleteById.resolves(true);
      noteModelStub.clearCategory.resolves(2);

      const req = { user: { userId: 1 }, params: { id: '5' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.deleteCategory(req, res, next);

      expect(categoryModelStub.deleteById.calledWith('5', 1)).to.be.true;
      expect(noteModelStub.clearCategory.calledWith(1, 'study')).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('forwards a 404 when the category does not exist or is not the user\'s', async () => {
      categoryModelStub.findById.resolves(undefined);

      const req = { user: { userId: 1 }, params: { id: '999' } };
      const res = makeRes();
      const next = sinon.spy();

      await categoriesController.deleteCategory(req, res, next);

      expect(categoryModelStub.deleteById.called).to.be.false;
      expect(next.firstCall.args[0].statusCode).to.equal(404);
    });
  });
});
