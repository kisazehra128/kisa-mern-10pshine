const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const noopLogger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };

describe('userModel tests', () => {
  let poolStub;
  let userModel;

  beforeEach(() => {
    poolStub = { query: sinon.stub() };
    userModel = proxyquire('../../src/models/userModel', {
      '../config/db': { pool: poolStub },
      '../config/logger': noopLogger,
    });
  });

  it('create() never sends the password hash back', async () => {
    poolStub.query.resolves([{ insertId: 7 }]);

    const user = await userModel.create({ name: 'Test', email: 'test@example.com', hashedPassword: 'hashed' });

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/INSERT INTO users/);
    expect(params).to.deep.equal(['Test', 'test@example.com', 'hashed']);
    expect(user).to.deep.equal({ id: 7, name: 'Test', email: 'test@example.com' });
    expect(user).to.not.have.property('password');
  });

  it('findByEmail() returns the full row including the password hash (needed for login)', async () => {
    poolStub.query.resolves([[{ id: 1, email: 'test@example.com', password: 'hashed' }]]);

    const user = await userModel.findByEmail('test@example.com');

    const [sql, params] = poolStub.query.firstCall.args;
    expect(sql).to.match(/WHERE email = \?/);
    expect(params).to.deep.equal(['test@example.com']);
    expect(user).to.have.property('password', 'hashed');
  });

  it('findByEmail() returns undefined when no user matches', async () => {
    poolStub.query.resolves([[]]);

    const user = await userModel.findByEmail('nobody@example.com');

    expect(user).to.be.undefined;
  });

  it('findById() never selects the password column', async () => {
    poolStub.query.resolves([[{ id: 1, name: 'Test', email: 'test@example.com', created_at: '2026-01-01' }]]);

    const user = await userModel.findById(1);

    const [sql] = poolStub.query.firstCall.args;
    expect(sql).to.not.match(/SELECT \*/);
    expect(user).to.not.have.property('password');
  });

  it('propagates a database error instead of swallowing it', async () => {
    poolStub.query.rejects(new Error('connection lost'));

    try {
      await userModel.create({ name: 'X', email: 'x@example.com', hashedPassword: 'h' });
      throw new Error('should not reach here');
    } catch (err) {
      expect(err.message).to.equal('connection lost');
    }
  });
});