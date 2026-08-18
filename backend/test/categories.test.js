const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Categories routes', () => {
  const userA = {
    name: 'Categories Test User A',
    email: `categoriesA${Date.now()}@example.com`,
    password: 'password123',
  };

  let tokenA;

  before(async () => {
    await request(app).post('/api/auth/register').send(userA);

    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ email: userA.email, password: userA.password });
    tokenA = loginA.body.token;
  });

  after(async () => {
    await pool.query('DELETE FROM users WHERE email = ?', [userA.email]);
  });

  describe('GET /api/categories', () => {
    it('rejects with no token', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).to.equal(401);
    });

    it('a new account already has the 5 starter categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.categories).to.have.length(5);
      expect(res.body.categories.map(c => c.slug)).to.include.members(
        ['projects', 'grocery', 'personal', 'study', 'ideas']
      );
      expect(res.body.categories.every(c => c.count === 0)).to.be.true;
    });
  });

  describe('POST /api/categories', () => {
    it('rejects with no token', async () => {
      const res = await request(app).post('/api/categories').send({ name: 'Recipes' });
      expect(res.status).to.equal(401);
    });

    it('creates a new category for the logged-in user', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Recipes', icon: 'note.png' });

      expect(res.status).to.equal(201);
      expect(res.body.category).to.include({ name: 'Recipes', slug: 'recipes', icon: 'note.png' });
    });

    it('rejects a duplicate category name for the same user', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Recipes' });

      expect(res.status).to.equal(409);
    });

    it('rejects a name with no letters or numbers', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '!!!' });

      expect(res.status).to.equal(400);
    });

    it('shows up in the sidebar list with a real note count once a note uses it', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Pasta night', content: 'garlic, olive oil', category: 'recipes' });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      const recipes = res.body.categories.find(c => c.slug === 'recipes');
      expect(recipes.count).to.equal(1);
      expect(res.body.total).to.be.at.least(1);
    });
  });
});
