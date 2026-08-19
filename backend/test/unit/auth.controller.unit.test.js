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

describe('auth.controller (unit, mocked dependencies)', () => {
  let userModelStub;
  let categoryModelStub;
  let bcryptStub;
  let jwtStub;
  let authController;

  beforeEach(() => {
    userModelStub = {
      findByEmail: sinon.stub(),
      create: sinon.stub(),
    };
    categoryModelStub = {
      create: sinon.stub().resolves({}),
    };
    bcryptStub = {
      hash: sinon.stub(),
      compare: sinon.stub(),
    };
    jwtStub = {
      sign: sinon.stub(),
      decode: sinon.stub(),
    };

    authController = proxyquire('../../src/controllers/auth.controller', {
      '../models/userModel': userModelStub,
      '../models/categoryModel': categoryModelStub,
      bcrypt: bcryptStub,
      jsonwebtoken: jwtStub,
      '../config/logger': noopLogger,
    });
  });

  describe('register', () => {
    it('creates a user and returns 201 when the email is not taken', async () => {
      userModelStub.findByEmail.resolves(undefined);
      bcryptStub.hash.resolves('hashed-password');
      userModelStub.create.resolves({ id: 1, name: 'Test', email: 'test@example.com' });

      const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.register(req, res, next);

      expect(userModelStub.create.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message', 'user registered');
      expect(next.called).to.be.false;
    });

    it('seeds the 5 starter categories for the new user', async () => {
      userModelStub.findByEmail.resolves(undefined);
      bcryptStub.hash.resolves('hashed-password');
      userModelStub.create.resolves({ id: 9, name: 'Test', email: 'test@example.com' });

      const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.register(req, res, next);

      expect(categoryModelStub.create.callCount).to.equal(5);
      expect(categoryModelStub.create.args.every(([arg]) => arg.userId === 9)).to.be.true;
      expect(categoryModelStub.create.args.map(([arg]) => arg.slug)).to.include.members(
        ['projects', 'grocery', 'personal', 'study', 'ideas']
      );
    });

    it('forwards a 409 AppError when the email is already registered', async () => {
      userModelStub.findByEmail.resolves({ id: 1, email: 'test@example.com' });

      const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.register(req, res, next);

      expect(userModelStub.create.called).to.be.false;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].statusCode).to.equal(409);
    });

    it('translates a DB duplicate-entry race into a 409 AppError', async () => {
      userModelStub.findByEmail.resolves(undefined);
      bcryptStub.hash.resolves('hashed-password');
      const dupErr = new Error('Duplicate entry');
      dupErr.code = 'ER_DUP_ENTRY';
      userModelStub.create.rejects(dupErr);

      const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.register(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(409);
    });
  });

  describe('login', () => {
    it('returns a token and 200 on correct credentials', async () => {
      userModelStub.findByEmail.resolves({ id: 1, name: 'Test', email: 'test@example.com', password: 'hashed' });
      bcryptStub.compare.resolves(true);
      jwtStub.sign.returns('fake.jwt.token');

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('token', 'fake.jwt.token');
    });

    it('forwards a 401 AppError when the user does not exist', async () => {
      userModelStub.findByEmail.resolves(undefined);

      const req = { body: { email: 'nobody@example.com', password: 'password123' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });

    it('forwards a 401 AppError when the password is wrong', async () => {
      userModelStub.findByEmail.resolves({ id: 1, password: 'hashed' });
      bcryptStub.compare.resolves(false);

      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      const res = makeRes();
      const next = sinon.spy();

      await authController.login(req, res, next);

      expect(next.firstCall.args[0].statusCode).to.equal(401);
    });
  });

  describe('logout', () => {
    it('blacklists the token and returns 200', async () => {
      const blacklistStub = { add: sinon.stub() };
      jwtStub.decode.returns({ exp: Math.floor(Date.now() / 1000) + 3600 });

      const controllerWithBlacklist = proxyquire('../../src/controllers/auth.controller', {
        '../models/userModel': userModelStub,
        bcrypt: bcryptStub,
        jsonwebtoken: jwtStub,
        '../config/logger': noopLogger,
        '../utils/tokenBlacklist': blacklistStub,
      });

      const req = {
        headers: { authorization: 'Bearer sometoken' },
        user: { userId: 1 },
      };
      const res = makeRes();
      const next = sinon.spy();

      await controllerWithBlacklist.logout(req, res, next);

      expect(blacklistStub.add.calledOnce).to.be.true;
      expect(blacklistStub.add.firstCall.args[0]).to.equal('sometoken');
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message', 'logged out');
    });
  });
});