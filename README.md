# siloka-quizki
Web development full stack for PWL - B Final 4th Semester (Collab)

# QUIZKI - Full Stack Web Application JSX


[![GitHub contributors](https://img.shields.io/github/contributors/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/issues)
[![GitHub stars](https://img.shields.io/github/stars/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/network)
[![GitHub license](https://img.shields.io/github/license/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/blob/main/LICENSE)

## 📝 Project Overview

QUIZKI is a full-stack web application built with JSX that integrates with various databases to deliver an interactive quiz platform. The application will utilize APIs to fetch and manage quiz content.

## 🔧 Tech Stack

- Frontend: React.js with JSX
- Backend: Node.js/Express
- Databases: (TBD - MongoDB, PostgreSQL, etc.)
- API Integration
- Other tech: (Add as needed)

## 👥 Git Collaboration Guide

This guide outlines our team's GitHub workflow to ensure smooth collaboration and version control.

> **IMPORTANT NOTE**: Jika ingin collab, silahkan buat branch sendiri dan push ke branch serta pastikan agar git fetch untuk memastikan kesamaan

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/reynaldyAl/quizki.git
   cd quizki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Sync with remote repository**
   ```bash
   git fetch --all
   ```

### Branch Structure

We follow a structured branching strategy:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/[feature-name]` - Individual feature development
- `bugfix/[bug-name]` - Bug fixes
- `hotfix/[hotfix-name]` - Urgent fixes for production

### Creating a Branch

Always create new branches from `develop` for features or `main` for hotfixes:

```bash
# First, make sure you're up to date
git checkout develop
git pull origin develop

# Create and switch to a new feature branch
git checkout -b feature/user-authentication

# For bug fixes
git checkout -b bugfix/login-validation

# For hotfixes (from main)
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-issue
```

### Branch Naming Convention

Follow these conventions for branch names:

- `feature/[feature-name]` - For new features (e.g., `feature/quiz-search`)
- `bugfix/[bug-name]` - For bug fixes (e.g., `bugfix/score-calculation`)
- `hotfix/[hotfix-name]` - For critical fixes (e.g., `hotfix/auth-vulnerability`)
- `docs/[doc-name]` - For documentation updates (e.g., `docs/api-endpoints`)
- `refactor/[area]` - For code refactoring (e.g., `refactor/database-queries`)

Use kebab-case (lowercase with hyphens) for the descriptive part.

### Daily Workflow

1. **Update your branch with the latest changes from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch-name
   git merge develop
   ```

2. **Sync with remote repository before making changes**
   ```bash
   git fetch --all
   ```

3. **Make your changes locally**
   - Write code
   - Add tests if applicable
   - Ensure code linting passes

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

   **Commit Message Format:**
   - `feat:` - A new feature
   - `fix:` - A bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push your branch**
   ```bash
   git push origin your-branch-name
   ```

### Pull Requests

1. **Open a Pull Request (PR) on GitHub**
   - Go to the repository on GitHub
   - Click "Pull Requests" > "New Pull Request"
   - Select your branch as "compare"
   - Select "develop" as the "base" (or "main" for hotfixes)
   - Fill in the PR template

2. **PR Requirements**
   - Give your PR a clear title
   - Describe what changes you've made
   - Reference any related issues (#issue-number)
   - Request reviews from relevant team members
   - Make sure all CI checks pass

3. **Code Review Process**
   - Address reviewer comments
   - Make necessary changes
   - Push additional commits to the same branch
   - PR will update automatically

4. **Merging**
   - PRs require at least one approval
   - Resolve any merge conflicts
   - PRs are typically merged using "Squash and merge" to keep history clean

### Handling Merge Conflicts

If you encounter merge conflicts:

```bash
# Update your local develop branch
git checkout develop
git pull origin develop

# Return to your branch
git checkout your-branch-name
git merge develop

# Resolve conflicts in your code editor
# After resolving, mark files as resolved
git add .

# Complete the merge
git commit
git push origin your-branch-name
```

## 📁 Code Organization

Our project follows this structure:

```
quizki/
├── client/               # Frontend code
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Helper functions
│   │   └── App.jsx       # Main app component
├── server/               # Backend code
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── .gitignore
├── package.json
└── README.md
```

**Guidelines:**
- Place components in appropriate directories
- Use PascalCase for component files (e.g., `UserProfile.jsx`)
- Use camelCase for non-component files (e.g., `authService.js`)
- Create subdirectories for feature-specific code

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass before submitting PRs
- Run the test suite locally:
  ```bash
  npm test
  ```

## 🚀 Deployment

(Add deployment information when available)

## 📝 Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Team Members

- [reynaldyAl](https://github.com/reynaldyAl) 
- [A. M. YUSRAN MAZIDAN](https://github.com/Yousran)
- [REZKY ROBBYYANTO AKBARI](https://github.com/)
- [A.MUH. MUFLIH HANIFATUSSURUR](https://github.com/)


## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
