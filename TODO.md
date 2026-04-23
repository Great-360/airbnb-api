# TODO: Rewrite users.controller.ts

## Steps:
- [x] 1. Rewrite src/controllers/users.controller.ts with full CRUD using Prisma\n  - getAllUsers: findMany with _count.listings\n  - getUserById: findUnique with include listings/bookings, 404 if not found\n  - createUser: validate required fields, check duplicate email (409), create\n  - updateUser: findUnique (404 if not), then update\n  - deleteUser: findUnique (404 if not), then delete
- [x] 2. Delete outdated src/models/users.model.ts
- [x] 3. Run `npx prisma generate`
- [ ] 4. Test endpoints

