# Event Planning App – System Summary

## 1. API & Backend
- **Tech Stack:** Node.js, Next.js API routes, MongoDB (Mongoose)
- **Authentication:** JWT, role-based access (admin/user)
- **Endpoints:**
  - `/api/auth/login` – User/admin login
  - `/api/events` – CRUD for events
  - `/api/users/count` – (Admin) User count
- **Validation:** Zod for data validation
- **Business Logic:** Strict event overlap prevention

## 2. Frontend
- **Tech Stack:** Next.js (React), Tailwind CSS
- **Features:**
  - Login/Register
  - Dashboard with calendar and event cards
  - Role-based UI (admin/user)
  - Event details, admin management
  - Responsive design

## 3. How It Works
- User logs in → frontend sends credentials to API → backend returns JWT
- Frontend uses token to fetch/manage data via API
- All actions (create/edit/delete events, admin stats) go through the API
- UI updates instantly as data changes

## 4. Presentation Tips
- Show login, dashboard, event creation/editing, admin features
- Use browser dev tools to show API calls
- Mention error handling and validation

---

*Add screenshots for a more visual PDF if desired.* 