### Summary

Brief description of what this PR accomplishes.

### Plan

- **Intent**: What are we changing and why?
- **Scope**: Files to touch (≤8 preferred)
- **Risks**: Breakages, state, migrations, security
- **Test Plan**: Pre-checks, unit/integration, e2e
- **Rollback**: How to revert quickly
- **Acceptance Criteria (DoD)**: What proves this is done

### Agent Information

- **Agent**: `lead, fe, be, db, ops, test` (choose one)
- **Pattern**: `lead_specialists, peer_to_peer, single_agent, pipeline, swarm` (choose one)
- **Target Branch**: `feature/*, dev, main` (choose one)

### Checklists

#### Core Requirements

- [ ] CI green (lint, typecheck, build, tests)
- [ ] Tests added/updated; coverage not reduced
- [ ] Docs updated (README/docs/comments/claude.md if process changes)
- [ ] Rollback path proven (revert PR or feature toggle)
- [ ] Security review complete for secrets, PII, and permissions

#### Specialist Checklists (check applicable)

**Frontend Expert** (for React/TypeScript/UI changes):

- [ ] Component structure follows client/src/components/ patterns
- [ ] Material-UI and TailwindCSS styling applied correctly
- [ ] React Router navigation patterns maintained
- [ ] TypeScript types updated and consistent

**Backend Expert** (for Node.js/Express/API changes):

- [ ] RESTful API conventions followed
- [ ] Auth middleware and error handling patterns used
- [ ] Express routes and controllers properly structured
- [ ] JWT and bcrypt implementations secure

**Database Expert** (for MongoDB/Mongoose changes):

- [ ] Mongoose models in server/models/mongoDB/ updated
- [ ] Atlas and local MongoDB connections maintained
- [ ] Schema patterns for User and Task models followed
- [ ] Database indexes and queries optimized

**DevOps Expert** (for build/config/deployment changes):

- [ ] package.json dependencies and scripts updated
- [ ] Environment variables and config files managed
- [ ] GitHub Actions workflows functioning
- [ ] Build processes for client and server working

**Test Agent** (for test changes):

- [ ] Jest and React Testing Library tests added/updated
- [ ] API endpoints and auth flows tested
- [ ] Test coverage maintained or improved
- [ ] Integration tests for full-stack features

### Additional Notes

Any context, decisions, or follow-up work needed.