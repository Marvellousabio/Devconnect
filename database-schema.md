# DevConnect Database Schema

## Overview
The database schema is designed for MongoDB using Mongoose ODM. All entities use MongoDB ObjectIds for relationships and include timestamps for auditing.

## Core Entities

### User
```javascript
{
  _id: ObjectId,
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed),
  firstName: String (required),
  lastName: String (required),
  avatar: String (optional, URL),
  bio: String (optional, max 500 chars),
  skills: [String] (optional),
  githubUsername: String (optional),
  linkedinUrl: String (optional),
  website: String (optional),
  location: String (optional),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  name: String (required, 3-100 chars),
  description: String (required, max 1000 chars),
  owner: ObjectId (ref: User, required),
  members: [{
    user: ObjectId (ref: User),
    role: String (enum: ['owner', 'admin', 'member'], default: 'member'),
    joinedAt: Date
  }],
  status: String (enum: ['active', 'archived', 'completed'], default: 'active'),
  visibility: String (enum: ['public', 'private'], default: 'private'),
  tags: [String],
  githubRepo: String (optional, URL),
  website: String (optional, URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Issue
```javascript
{
  _id: ObjectId,
  title: String (required, 3-200 chars),
  description: String (required),
  project: ObjectId (ref: Project, required),
  creator: ObjectId (ref: User, required),
  assignee: ObjectId (ref: User, optional),
  status: String (enum: ['open', 'in_progress', 'review', 'closed'], default: 'open'),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  labels: [String],
  comments: [{
    _id: ObjectId,
    author: ObjectId (ref: User),
    content: String (required),
    createdAt: Date,
    updatedAt: Date
  }],
  dueDate: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  content: String (required, max 2000 chars),
  sender: ObjectId (ref: User, required),
  room: ObjectId (ref: ChatRoom, required),
  type: String (enum: ['text', 'code', 'file', 'system'], default: 'text'),
  metadata: {
    language: String (optional, for code messages),
    filename: String (optional, for file messages),
    fileUrl: String (optional, for file messages)
  },
  edited: Boolean (default: false),
  editedAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Repository
```javascript
{
  _id: ObjectId,
  name: String (required, unique within project, 3-100 chars),
  description: String (optional, max 500 chars),
  project: ObjectId (ref: Project, required),
  owner: ObjectId (ref: User, required),
  visibility: String (enum: ['public', 'private'], default: 'private'),
  defaultBranch: String (default: 'main'),
  language: String (optional),
  stars: Number (default: 0),
  forks: Number (default: 0),
  watchers: Number (default: 0),
  license: String (optional),
  topics: [String],
  githubUrl: String (optional),
  lastSync: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### ChatRoom
```javascript
{
  _id: ObjectId,
  name: String (required, 3-100 chars),
  description: String (optional, max 500 chars),
  type: String (enum: ['project', 'direct', 'group'], required),
  project: ObjectId (ref: Project, optional, required for project rooms),
  participants: [ObjectId] (ref: User, required),
  owner: ObjectId (ref: User, required),
  isActive: Boolean (default: true),
  lastMessage: {
    content: String,
    sender: ObjectId (ref: User),
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### ProjectBoard
```javascript
{
  _id: ObjectId,
  name: String (required, 3-100 chars),
  project: ObjectId (ref: Project, required),
  columns: [{
    _id: ObjectId,
    name: String (required),
    position: Number (required),
    limit: Number (optional),
    color: String (optional, hex color)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### BoardCard
```javascript
{
  _id: ObjectId,
  title: String (required, 3-200 chars),
  description: String (optional),
  board: ObjectId (ref: ProjectBoard, required),
  column: ObjectId (required, ref to column in board),
  assignee: ObjectId (ref: User, optional),
  labels: [String],
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  dueDate: Date (optional),
  position: Number (required),
  issue: ObjectId (ref: Issue, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes
- Users: email (unique), username (unique)
- Projects: owner, members.user, status, visibility
- Issues: project, creator, assignee, status, priority
- Messages: room, sender, createdAt
- Repositories: project, owner, visibility, language
- ChatRooms: project, participants, type
- ProjectBoards: project
- BoardCards: board, column, position

## Relationships
- User -> Projects (ownership and membership)
- Project -> Users (owner and members)
- Project -> Issues (one-to-many)
- Project -> Repositories (one-to-many)
- Project -> ChatRooms (one-to-many)
- Project -> ProjectBoards (one-to-many)
- Issue -> User (creator, assignee)
- Issue -> Project (belongs to)
- Message -> User (sender)
- Message -> ChatRoom (belongs to)
- Repository -> Project (belongs to)
- Repository -> User (owner)
- ChatRoom -> Project (optional, for project rooms)
- ChatRoom -> Users (participants)
- ProjectBoard -> Project (belongs to)
- BoardCard -> ProjectBoard (belongs to)
- BoardCard -> Issue (optional link)

## Data Validation Rules
- All string fields trimmed and validated for length
- Email format validation
- URL format validation for external links
- ObjectId references validated for existence
- Arrays limited to reasonable sizes (e.g., max 50 members per project)
- Timestamps automatically managed by Mongoose

This schema provides a comprehensive data model for the DevConnect platform, supporting all required features while maintaining data integrity and performance.