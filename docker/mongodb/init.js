// MongoDB initialization script for DevConnect
// This script runs when the MongoDB container starts for the first time

// Create application database
db = db.getSiblingDB('devconnect');

// Create collections with initial indexes
db.createCollection('users');
db.createCollection('projects');
db.createCollection('issues');
db.createCollection('messages');
db.createCollection('repositories');
db.createCollection('chatrooms');
db.createCollection('projectboards');
db.createCollection('boardcards');
db.createCollection('codesessions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.projects.createIndex({ "owner": 1 });
db.projects.createIndex({ "members.user": 1 });
db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "visibility": 1 });
db.projects.createIndex({ "createdAt": 1 });

db.issues.createIndex({ "project": 1 });
db.issues.createIndex({ "creator": 1 });
db.issues.createIndex({ "assignee": 1 });
db.issues.createIndex({ "status": 1 });
db.issues.createIndex({ "priority": 1 });
db.issues.createIndex({ "createdAt": 1 });

db.messages.createIndex({ "room": 1, "createdAt": -1 });
db.messages.createIndex({ "sender": 1 });
db.messages.createIndex({ "createdAt": 1 });

db.repositories.createIndex({ "project": 1 });
db.repositories.createIndex({ "owner": 1 });
db.repositories.createIndex({ "visibility": 1 });
db.repositories.createIndex({ "language": 1 });
db.repositories.createIndex({ "stars": -1 });
db.repositories.createIndex({ "createdAt": 1 });

db.chatrooms.createIndex({ "project": 1 });
db.chatrooms.createIndex({ "participants": 1 });
db.chatrooms.createIndex({ "type": 1 });
db.chatrooms.createIndex({ "owner": 1 });

db.projectboards.createIndex({ "project": 1 });

db.boardcards.createIndex({ "board": 1, "column": 1, "position": 1 });
db.boardcards.createIndex({ "assignee": 1 });

db.codesessions.createIndex({ "project": 1 });
db.codesessions.createIndex({ "creator": 1 });
db.codesessions.createIndex({ "isActive": 1 });
db.codesessions.createIndex({ "lastActivity": -1 });

// Create a sample admin user (optional - for development)
db.users.insertOne({
  username: "admin",
  email: "admin@devconnect.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8GwqZpVzG", // password: admin123
  firstName: "Admin",
  lastName: "User",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("DevConnect database initialized successfully!");
print("Sample admin user created:");
print("  Email: admin@devconnect.com");
print("  Password: admin123");