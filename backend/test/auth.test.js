const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Auth routes', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`, // unique each run so it doesn't collide
    password: 'password123'
  };

  let token;

  // clean up the test user after all tests run
  after(async () => {
    await pool.query('DELETE FROM users WHERE email = ?', [testUser.email]);
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).to.equal(201);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('rejects a duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).to.equal(409);
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@example.com' });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      token = res.body.token; // save for the protected route tests below
    });

    it('rejects a wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('rejects with no token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).to.equal(401);
    });

    it('rejects a broken token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer garbage.token.here');

      expect(res.status).to.equal(401);
    });

    it('returns the user with a valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });
  });
});