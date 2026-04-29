# Airbnb API - Deploy to Render

## Current Progress
✅ Plan approved and breakdown created.

## Completed Steps
- ✅ Edit src/index.ts: Dynamic PORT and 0.0.0.0 host
- ✅ Create .env.example with vars

## Remaining Steps
### Code Updates

- [ ] Create .env.example with PORT=10000 and other placeholders (DATABASE_URL, JWT_SECRET, etc.)

### Local Prep
- [ ] Copy .env.example to .env, set your vars (PORT=10000 optional), add secrets
- [ ] `npm run build` (running now)
- [ ] Test: `npm start` (needs DB URL)


### Git & Deploy
- [ ] `git add . && git commit -m "chore: prepare for Render deployment (dynamic port)" && git push origin main`
- [ ] Ensure repo public on GitHub
- [ ] Render.com: New → Web Service → Connect GitHub repo
- [ ] Settings: Build `npm ci && npx prisma generate`, Start `npm start`, Plan Free
- [ ] Add Env Vars: DATABASE_URL (from Render Postgres), JWT_SECRET, CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET, EMAIL_HOST/PORT/USER/PASS, etc.
- [ ] Create Postgres DB on Render (free), link if needed

### Post-Deploy
- [ ] Deploy automatic on push
- [ ] Render Shell (tmp): `npx prisma migrate deploy`
- [ ] `npx prisma db seed` if needed
- [ ] Test endpoints e.g. curl https://your-app.onrender.com/

## Notes
- Render free tier sleeps after 15min inactivity.
- Migrate/seed manually first time.

