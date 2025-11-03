const { CodeSession, Project, User } = require('../../models');

const codeResolvers = {
  Query: {
    codeSessions: async (parent, { projectId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check project access
        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        return await CodeSession.findActiveByProject(projectId);
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch code sessions');
      }
    },

    codeSession: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(id)
          .populate('project', 'name visibility')
          .populate('creator', 'username firstName lastName avatar')
          .populate('participants.user', 'username firstName lastName avatar');

        if (!session) {
          throw new Error('Code session not found');
        }

        // Check if user is participant
        const isParticipant = session.participants.some(p =>
          p.user._id.toString() === context.user._id.toString()
        );
        const isCreator = session.creator._id.toString() === context.user._id.toString();

        if (!isParticipant && !isCreator) {
          throw new Error('Access denied');
        }

        return session;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch code session');
      }
    },

    activeCodeSessions: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await CodeSession.findByUser(context.user._id);
      } catch (error) {
        throw new Error('Failed to fetch active code sessions');
      }
    }
  },

  Mutation: {
    createCodeSession: async (parent, { projectId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check project access
        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        const session = new CodeSession({
          name: input.name,
          description: input.description,
          project: projectId,
          creator: context.user._id,
          language: input.language,
          content: getDefaultContent(input.language)
        });

        // Add creator as first participant
        await session.addParticipant(context.user._id);

        return await CodeSession.findById(session._id)
          .populate('project', 'name')
          .populate('creator', 'username firstName lastName avatar')
          .populate('participants.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to create code session');
      }
    },

    joinCodeSession: async (parent, { sessionId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(sessionId).populate('project');
        if (!session) {
          throw new Error('Code session not found');
        }

        if (!session.isActive) {
          throw new Error('Code session is no longer active');
        }

        // Check project access
        const project = session.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        await session.addParticipant(context.user._id);

        return await CodeSession.findById(sessionId)
          .populate('project', 'name')
          .populate('creator', 'username firstName lastName avatar')
          .populate('participants.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to join code session');
      }
    },

    leaveCodeSession: async (parent, { sessionId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(sessionId);
        if (!session) {
          throw new Error('Code session not found');
        }

        // Cannot leave if creator
        if (session.creator.toString() === context.user._id.toString()) {
          throw new Error('Session creator cannot leave the session');
        }

        await session.removeParticipant(context.user._id);

        // End session if no participants left
        if (session.participants.length === 0) {
          session.isActive = false;
          await session.save();
        }

        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to leave code session');
      }
    },

    updateCodeContent: async (parent, { sessionId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(sessionId);
        if (!session) {
          throw new Error('Code session not found');
        }

        if (!session.isActive) {
          throw new Error('Code session is no longer active');
        }

        // Check if user is participant
        const isParticipant = session.participants.some(p =>
          p.user.toString() === context.user._id.toString()
        );

        if (!isParticipant) {
          throw new Error('Access denied');
        }

        await session.applyChanges(context.user._id, input.changes);

        return {
          id: Date.now().toString(), // Simple ID generation
          sessionId,
          userId: context.user._id,
          changes: input.changes,
          timestamp: new Date()
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to update code content');
      }
    },

    updateCursorPosition: async (parent, { sessionId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(sessionId);
        if (!session) {
          throw new Error('Code session not found');
        }

        if (!session.isActive) {
          throw new Error('Code session is no longer active');
        }

        // Check if user is participant
        const isParticipant = session.participants.some(p =>
          p.user.toString() === context.user._id.toString()
        );

        if (!isParticipant) {
          throw new Error('Access denied');
        }

        await session.updateCursor(context.user._id, input.line, input.column);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to update cursor position');
      }
    },

    endCodeSession: async (parent, { sessionId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const session = await CodeSession.findById(sessionId);
        if (!session) {
          throw new Error('Code session not found');
        }

        // Only creator can end session
        if (session.creator.toString() !== context.user._id.toString()) {
          throw new Error('Access denied');
        }

        session.isActive = false;
        await session.save();

        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to end code session');
      }
    }
  },

  Subscription: {
    codeSessionUpdated: {
      subscribe: (parent, { sessionId }, { pubsub }) => {
        return null; // Would be implemented with pubsub system
      }
    },
    codeContentChanged: {
      subscribe: (parent, { sessionId }, { pubsub }) => {
        return null; // Would be implemented with pubsub system
      }
    },
    participantJoined: {
      subscribe: (parent, { sessionId }, { pubsub }) => {
        return null; // Would be implemented with pubsub system
      }
    },
    participantLeft: {
      subscribe: (parent, { sessionId }, { pubsub }) => {
        return null; // Would be implemented with pubsub system
      }
    },
    cursorMoved: {
      subscribe: (parent, { sessionId, userId }, { pubsub }) => {
        return null; // Would be implemented with pubsub system
      }
    }
  }
};

// Helper function to get default content based on language
function getDefaultContent(language) {
  const templates = {
    javascript: '// JavaScript Code\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();\n',
    typescript: '// TypeScript Code\n\nfunction hello(): void {\n  console.log("Hello, World!");\n}\n\nhello();\n',
    python: '# Python Code\n\ndef hello():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    hello()\n',
    java: '// Java Code\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
    css: '/* CSS Styles */\n\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n}\n',
    json: '{\n    "message": "Hello, World!",\n    "status": "success"\n}\n',
    markdown: '# Hello, World!\n\nThis is a **markdown** document.\n\n## Features\n\n- Easy to read\n- Easy to write\n- Supports formatting\n'
  };

  return templates[language] || '// Start coding...\n';
}

module.exports = codeResolvers;