# Git Best Practices for Clean Booker

## Branching Strategy

All branches must follow this naming convention:

- **Backend**: `username/server/short-description`
- **Frontend**: `username/client/short-description`
- **Database**: `username/db/short-description`
- **DevOps**: `username/devops/short-description`
- **Documentation**: `username/docs/short-description`

> Use lowercase letters and hyphens. Avoid spaces and underscores.

**Examples**:

- `safwan/server/add-login-api`
- `safwan/client/fix-navbar-style`
- `safwan/docs/update-readme`

---

## Commit Messages

1. Use **clear, concise, and descriptive** commit messages.
2. Start with an imperative verb: `add`, `fix`, `update`, `remove`, `refactor`, etc.
3. Optionally prefix with task ID if linked to a ticket or issue.
4. Limit subject line to **50 characters**. Wrap the body at 72 characters if used.

**Examples**:

- add: implement JWT auth for login API
- fix: resolve null error in user controller
- update: change footer background color
- refactor: split booking component into smaller modules

---

## Pull Requests (PR)

- Open all PRs to the `develop` branch (unless hotfixes).
- **Squash commits** before merging for a clean history:

```bash
git rebase -i origin/develop
```

- Use a descriptive title and body:
  > - `[123] Add validation to booking form`

**PR Checklist**

- Descriptive title and summary
- Code reviewed by at least one other person
- Commits squashed and cleaned
- No console.log or leftover comments
- Tests added/updated
- CI passes

---

## General Git Rules

**Branch Management**

- Never commit directly to main or develop
- Always create a feature branch from develop
- Keep local develop up to date:

```bash
git checkout develop
git pull origin develop
```

**Do NOT Commit**

- Secrets or .env files
- IDE configs (.vscode/, .idea/)
- OS files like .DS_Store
- Auto-generated files (e.g., dist/, node_modules/)
