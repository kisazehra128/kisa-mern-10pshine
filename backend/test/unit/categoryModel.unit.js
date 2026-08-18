const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const noopLogger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };

describe('categoryModel (unit, mocked MySQL pool)', () => {
  let poolStub;
  let categoryModel;

  beforeEach(() => {
    poolStub = { query: sinon.stub() };
    categoryModel = proxyquire('../../src/models/categoryModel', {
      '../config/db': { pool: poolStub },
      '../config/logger': noopLogger,
    });
  });

  it('create() inserts a category and returns it with the new id', async () => {
    poolStub.query.resolves([{ insertId: 7 }]);

    const category = await categoryModel.create({ userId: 1, name: 'Recipes', slug: 'recipes', icon: 'note.png' });

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/INSERT INTO categories/);
    expect(params).to.deep.equal([1, 'Recipes', 'recipes', 'note.png']);
    expect(category).to.deep.equal({ id: 7, userId: 1, name: 'Recipes', slug: 'recipes', icon: 'note.png' });
  });

  it('findAllByUser() scopes the query to the given user', async () => {
    poolStub.query.resolves([[{ id: 1, user_id: 1, slug: 'study' }]]);

    const categories = await categoryModel.findAllByUser(1);

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE user_id = \?/);
    expect(params).to.deep.equal([1]);
    expect(categories).to.have.length(1);
  });

  it('findBySlug() scopes by both user and slug', async () => {
    poolStub.query.resolves([[{ id: 1, user_id: 1, slug: 'study' }]]);

    const category = await categoryModel.findBySlug(1, 'study');

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE user_id = \? AND slug = \?/);
    expect(params).to.deep.equal([1, 'study']);
    expect(category).to.deep.equal({ id: 1, user_id: 1, slug: 'study' });
  });

  it('findBySlug() returns undefined when nothing matches', async () => {
    poolStub.query.resolves([[]]);

    const category = await categoryModel.findBySlug(1, 'nope');

    expect(category).to.be.undefined;
  });

  it('findById() scopes by both id and user', async () => {
    poolStub.query.resolves([[{ id: 5, user_id: 1, slug: 'study' }]]);

    const category = await categoryModel.findById(5, 1);

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE id = \? AND user_id = \?/);
    expect(params).to.deep.equal([5, 1]);
    expect(category).to.deep.equal({ id: 5, user_id: 1, slug: 'study' });
  });

  it('deleteById() returns true when a row was actually removed', async () => {
    poolStub.query.resolves([{ affectedRows: 1 }]);

    const deleted = await categoryModel.deleteById(5, 1);

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/DELETE FROM categories WHERE id = \? AND user_id = \?/);
    expect(params).to.deep.equal([5, 1]);
    expect(deleted).to.be.true;
  });

  it('deleteById() returns false when nothing matched', async () => {
    poolStub.query.resolves([{ affectedRows: 0 }]);

    const deleted = await categoryModel.deleteById(999, 1);

    expect(deleted).to.be.false;
  });
});
