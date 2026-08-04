const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const noopLogger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };

describe('noteModel (unit, mocked MySQL pool)', () => {
  let poolStub;
  let noteModel;

  beforeEach(() => {
    poolStub = { query: sinon.stub() };
    noteModel = proxyquire('../../src/models/noteModel', {
      '../config/db': { pool: poolStub },
      '../config/logger': noopLogger,
    });
  });

  it('create() inserts a note and returns it with the new id', async () => {
    poolStub.query.resolves([{ insertId: 42 }]);

    const note = await noteModel.create({ userId: 1, title: 'Title', content: 'Body' });

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/INSERT INTO notes/);
    expect(params).to.deep.equal([1, 'Title', 'Body']);
    expect(note).to.deep.equal({ id: 42, userId: 1, title: 'Title', content: 'Body' });
  });

  it('findAllByUser() scopes the query to the given user', async () => {
    poolStub.query.resolves([[{ id: 1, user_id: 1, title: 'A' }]]);

    const notes = await noteModel.findAllByUser(1);

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE user_id = \?/);
    expect(params).to.deep.equal([1]);
    expect(notes).to.have.length(1);
  });

  it('findById() scopes by both id and user_id, so you can\'t open someone else\'s note', async () => {
    poolStub.query.resolves([[{ id: 1, user_id: 1 }]]);

    const note = await noteModel.findById(1, 1);

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE id = \? AND user_id = \?/);
    expect(params).to.deep.equal([1, 1]);
    expect(note).to.deep.equal({ id: 1, user_id: 1 });
  });

  it('findById() returns undefined when no row matches (wrong owner or missing note)', async () => {
    poolStub.query.resolves([[]]);

    const note = await noteModel.findById(999, 1);

    expect(note).to.be.undefined;
  });

  it('update() returns true when a row was actually changed', async () => {
    poolStub.query.resolves([{ affectedRows: 1 }]);

    const updated = await noteModel.update(1, 1, { title: 'New', content: 'c' });

    expect(updated).to.be.true;
  });

  it('update() returns false when no row matched (wrong owner or missing note)', async () => {
    poolStub.query.resolves([{ affectedRows: 0 }]);

    const updated = await noteModel.update(999, 1, { title: 'New', content: 'c' });

    expect(updated).to.be.false;
  });

  it('delete() returns true when a row was actually removed', async () => {
    poolStub.query.resolves([{ affectedRows: 1 }]);

    const deleted = await noteModel.delete(1, 1);

    expect(deleted).to.be.true;
  });

  it('delete() returns false when no row matched (wrong owner or missing note)', async () => {
    poolStub.query.resolves([{ affectedRows: 0 }]);

    const deleted = await noteModel.delete(999, 1);

    expect(deleted).to.be.false;
  });

  it('propagates a database error instead of swallowing it', async () => {
    poolStub.query.rejects(new Error('connection lost'));

    try {
      await noteModel.findAllByUser(1);
      throw new Error('should not reach here');
    } catch (err) {
      expect(err.message).to.equal('connection lost');
    }
  });
});
