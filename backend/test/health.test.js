const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('should return 200 and a welcome message', async () => {
    try {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Welcome to Notes API');
    } catch (err) {
      throw err;
    }
  });
});

describe('GET /api/health', () => {
  it('should return 200 and confirm backend is running', async () => {
    try {
      const res = await request(app).get('/api/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Backend is running.');
    } catch (err) {
      throw err;
    }
  });
});