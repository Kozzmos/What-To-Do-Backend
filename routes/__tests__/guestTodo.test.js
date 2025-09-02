const request = require('supertest');
const express = require('express');
const todosRouter = require('/routes/todos'); // todos.js yolunu buraya ver
const pool = require('/db');

jest.mock('/db'); // pool.query'yi mock edeceğiz

const app = express();
app.use(express.json());
app.use('/api/todos', todosRouter);

describe('Guest kullanıcı todo ekleme', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Guest kullanıcı 10 görev eklediyse yeni todo eklenemez', async () => {
        const list_id = 'test-list-id';
        const text = 'Yeni görev';
        const status = 'New';
        const active = true;
        const due_date = null;
        const tags = [];

        // list_id -> user_id dönsün
        pool.query.mockImplementationOnce(() => Promise.resolve({
            rows: [{ user_id: 'guest-user-id' }]
        }));

        // user_id -> email dönsün
        pool.query.mockImplementationOnce(() => Promise.resolve({
            rows: [{ email: 'guest_test@example.com' }]
        }));

        // Günlük 10 görev var
        pool.query.mockImplementationOnce(() => Promise.resolve({
            rows: [{ count: '10' }]
        }));

        const res = await request(app)
            .post('/api/todos')
            .send({ list_id, text, status, active, due_date, tags });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("Guest kullanıcılar günde en fazla 10 görev ekleyebilir.");
    });

    test('Guest kullanıcı 9 görev eklediyse yeni todo eklenebilir', async () => {
        const list_id = 'test-list-id';
        const text = 'Yeni görev';
        const status = 'New';
        const active = true;
        const due_date = null;
        const tags = [];

        pool.query
            .mockImplementationOnce(() => Promise.resolve({ rows: [{ user_id: 'guest-user-id' }] })) // list -> user
            .mockImplementationOnce(() => Promise.resolve({ rows: [{ email: 'guest_test@example.com' }] })) // user -> email
            .mockImplementationOnce(() => Promise.resolve({ rows: [{ count: '9' }] })) // günlük görev sayısı
            .mockImplementationOnce(() => Promise.resolve({ rows: [{ id: '1', text, status, active, due_date, tags }] })); // todo ekleme

        const res = await request(app)
            .post('/api/todos')
            .send({ list_id, text, status, active, due_date, tags });

        expect(res.status).toBe(201);
        expect(res.body.text).toBe(text);
    });
});
