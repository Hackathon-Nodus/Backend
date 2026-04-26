import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Notification from '../models/Notification';

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.JWT_SECRET = 'test-secret';

let app: any;
let mongoServer: MongoMemoryServer;
let authToken = '';
let testProblemId = '';

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    await mongoose.connect(process.env.MONGO_URI);

    const appModule = await import('../App');
    app = appModule.default;
});

beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const collectionName of Object.keys(collections)) {
        await collections[collectionName].deleteMany({});
    }

    authToken = '';
    testProblemId = new mongoose.Types.ObjectId().toString();
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

test('POST /api/v1/auth/register registers a user and returns JWT', async () => {
    const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Alice Tester',
            email: 'alice@example.com',
            password: 'secret123'
        });

    assert.equal(response.status, 201);
    assert.equal(typeof response.body.token, 'string');
    assert.equal(response.body.user.email, 'alice@example.com');
});

test('POST /api/v1/auth/login logs in and returns JWT', async () => {
    await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Bob Tester',
            email: 'bob@example.com',
            password: 'secret123'
        });

    const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: 'bob@example.com',
            password: 'secret123'
        });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.token, 'string');
});

test('POST /api/v1/solutions creates a protected solution', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Carol Tester',
            email: 'carol@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;

    const response = await request(app)
        .post('/api/v1/solutions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            problemId: testProblemId,
            content: 'This is a complete solution with enough technical detail.',
            link: 'https://example.com/solution'
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.problemId, testProblemId);
});

test('GET /api/v1/solutions returns protected solution list by problemId', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Dan Tester',
            email: 'dan@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;

    await request(app)
        .post('/api/v1/solutions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            problemId: testProblemId,
            content: 'This is another complete solution with enough detail to pass.',
            link: 'https://example.com/solution-two'
        });

    const response = await request(app)
        .get('/api/v1/solutions')
        .query({ problemId: testProblemId })
        .set('Authorization', `Bearer ${authToken}`);

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body), true);
    assert.equal(response.body.length, 1);
});

test('POST /api/v1/ai/enhance returns mocked AI result in test mode', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Eve Tester',
            email: 'eve@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;

    const response = await request(app)
        .post('/api/v1/ai/enhance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            title: 'Need better onboarding',
            description: 'Users are dropping early, and we need better onboarding help.',
            category: 'product'
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data.refinedTitle, 'string');
});

test('PATCH /api/v1/notifications/:id/read marks a single notification as read', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Nora Tester',
            email: 'nora@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;
    const userId = registerResponse.body.user._id;

    const notification = await Notification.create({
        userId,
        type: 'system',
        message: 'Welcome to Nodus'
    });

    const response = await request(app)
        .patch(`/api/v1/notifications/${notification._id.toString()}/read`)
        .set('Authorization', `Bearer ${authToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.read, true);
});

test('PATCH /api/v1/notifications/read-all marks all notifications as read', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Rina Tester',
            email: 'rina@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;
    const userId = registerResponse.body.user._id;

    await Notification.create({
        userId,
        type: 'system',
        message: 'First notification'
    });
    await Notification.create({
        userId,
        type: 'new_ranking',
        message: 'Second notification'
    });

    const response = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.modifiedCount, 2);
});

test('DELETE /api/v1/notifications/:id removes a notification', async () => {
    const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Dina Tester',
            email: 'dina@example.com',
            password: 'secret123'
        });

    authToken = registerResponse.body.token;
    const userId = registerResponse.body.user._id;

    const notification = await Notification.create({
        userId,
        type: 'system',
        message: 'Delete me'
    });

    const response = await request(app)
        .delete(`/api/v1/notifications/${notification._id.toString()}`)
        .set('Authorization', `Bearer ${authToken}`);

    assert.equal(response.status, 204);

    const deleted = await Notification.findById(notification._id);
    assert.equal(deleted, null);
});
