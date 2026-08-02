const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Notes routes', () => {
  const userA = {
    name: 'Notes Test User A',
    email: `notesA${Date.now()}@example.com`,
    password: 'password123'
  };

  const userB = {
    name: 'Notes Test User B',
    email: `notesB${Date.now()}@example.com`,
    password: 'password123'
  };

  let tokenA;
  let tokenB;
  let noteId; // a note belonging to userA

  before(async () => {
    await request(app).post('/api/auth/register').send(userA);
    await request(app).post('/api/auth/register').send(userB);

    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ email: userA.email, password: userA.password });
    tokenA = loginA.body.token;

    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ email: userB.email, password: userB.password });
    tokenB = loginB.body.token;
  });

  after(async () => {
    await pool.query('DELETE FROM users WHERE email IN (?, ?)', [userA.email, userB.email]);
    // notes get deleted automatically - foreign key is ON DELETE CASCADE
  });

  describe('POST /api/notes', () => {
    it('rejects with no token', async () => {
      const res = await request(app).post('/api/notes').send({ title: 'test' });
      expect(res.status).to.equal(401);
    });

    it('creates a note for userA', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'My first note', content: 'some content' });

      expect(res.status).to.equal(201);
      expect(res.body.note).to.have.property('title', 'My first note');
      noteId = res.body.note.id;
    });

    it('rejects a note with no title', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'no title here' });

      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/notes', () => {
    it('gets all notes for the logged-in user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.notes).to.be.an('array');
      expect(res.body.notes.length).to.be.at.least(1);
    });

    it('filters notes with ?search=', async () => {
      const res = await request(app)
        .get('/api/notes?search=first')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.notes.some(n => n.title.includes('first'))).to.be.true;
    });

    it('does not return userA notes when userB asks', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).to.equal(200);
      expect(res.body.notes.find(n => n.id === noteId)).to.be.undefined;
    });
  });

  describe('GET /api/notes/:id', () => {
    it('gets a single note by id', async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.note).to.have.property('id', noteId);
    });

    it('returns 404 for a note that does not exist', async () => {
      const res = await request(app)
        .get('/api/notes/999999')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(404);
    });

    it('returns 404 when userB tries to read userA note', async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('returns 404 when userB tries to update userA note', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'hacked title', content: 'hacked content' });

      expect(res.status).to.equal(404);
    });

    it('updates a note as its owner', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Updated title', content: 'updated content' });

      expect(res.status).to.equal(200);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('returns 404 when userB tries to delete userA note', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });

    it('deletes a note as its owner', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
    });

    it('returns 404 deleting it again', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(404);
    });
  });
});