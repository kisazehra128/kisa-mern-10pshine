const request = require('supertest');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');
const app = require('../src/app');

describe('Global error handling', () => {
  it('returns a 404 with a message for an unknown route', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('message');
  });
});

describe('Validation (Joi)', () => {
  describe('POST /api/auth/register', () => {
    it('rejects an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'password123' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('rejects a password under the minimum length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'shortpw@example.com', password: '123' });

      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/notes', () => {
    // signing our own token here since this only needs to prove the
    // validation middleware rejects it before any database work happens -
    // doesn't need a real registered user
    const fakeToken = jwt.sign({ userId: 999999 }, process.env.JWT_SECRET, { expiresIn: '1h' });

    it('rejects a repeated ?search= query (parsed as an array by Express)', async () => {
      const res = await request(app)
        .get('/api/notes?search=a&search=b')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });
  });
});
