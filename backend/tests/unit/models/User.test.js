const mongoose = require('mongoose');
const { User } = require('../../../src/models');
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
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        username: 'testuser2'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should fail to create user with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        email: 'test2@example.com'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'password123';
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password,
        firstName: 'Test',
        lastName: 'User'
      });

      await user.save();

      expect(user.password).not.toBe(password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should compare password correctly', async () => {
      const password = 'password123';
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password,
        firstName: 'Test',
        lastName: 'User'
      });

      await user.save();

      const isValidPassword = await user.comparePassword(password);
      const isInvalidPassword = await user.comparePassword('wrongpassword');

      expect(isValidPassword).toBe(true);
      expect(isInvalidPassword).toBe(false);
    });
  });

  describe('Virtual Properties', () => {
    it('should return full name', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Public Profile', () => {
    it('should return public profile without sensitive data', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        skills: ['JavaScript', 'React']
      });

      await user.save();

      const publicProfile = user.getPublicProfile();

      expect(publicProfile.password).toBeUndefined();
      expect(publicProfile.username).toBe('testuser');
      expect(publicProfile.email).toBe('test@example.com');
      expect(publicProfile.firstName).toBe('John');
      expect(publicProfile.lastName).toBe('Doe');
      expect(publicProfile.bio).toBe('Test bio');
      expect(publicProfile.skills).toEqual(['JavaScript', 'React']);
    });
  });

  describe('Validation', () => {
    it('should fail validation for invalid email', async () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation for short username', async () => {
      const user = new User({
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation for short password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
        firstName: 'Test',
        lastName: 'User'
      });

      await expect(user.save()).rejects.toThrow();
    });
  });
});