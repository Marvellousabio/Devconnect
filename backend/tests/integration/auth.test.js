const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../../src/app');
const { User } = require('../../src/models');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API', () => {
  describe('POST /graphql - Register', () => {
    it('should register a new user successfully', async () => {
      const mutation = `
        mutation Register($input: UserInput!) {
          register(input: $input) {
            token
            user {
              id
              username
              email
              firstName
              lastName
            }
          }
        }
      `;

      const variables = {
        input: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      expect(response.body.data.register.token).toBeDefined();
      expect(response.body.data.register.user.username).toBe('testuser');
      expect(response.body.data.register.user.email).toBe('test@example.com');
    });

    it('should fail to register with duplicate email', async () => {
      // First register a user
      await new User({
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }).save();

      const mutation = `
        mutation Register($input: UserInput!) {
          register(input: $input) {
            token
            user {
              id
            }
          }
        }
      `;

      const variables = {
        input: {
          username: 'testuser2',
          email: 'test@example.com', // Same email
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('already exists');
    });
  });

  describe('POST /graphql - Login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      await user.save();
    });

    it('should login successfully with correct credentials', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              username
              email
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      expect(response.body.data.login.token).toBeDefined();
      expect(response.body.data.login.user.username).toBe('testuser');
    });

    it('should fail login with incorrect password', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid email or password');
    });
  });

  describe('Authentication Middleware', () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a user to get token
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      await user.save();

      const loginMutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }
      `;

      const loginResponse = await request(app)
        .post('/graphql')
        .send({
          query: loginMutation,
          variables: {
            input: { email: 'test@example.com', password: 'password123' }
          }
        });

      authToken = loginResponse.body.data.login.token;
    });

    it('should allow authenticated requests', async () => {
      const query = `
        query Me {
          me {
            id
            username
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data.me.username).toBe('testuser');
    });

    it('should reject unauthenticated requests', async () => {
      const query = `
        query Me {
          me {
            id
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Not authenticated');
    });
  });
});