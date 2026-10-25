# ProjectForge

**ProjectForge** is a full-stack academic project collaboration and teammate-matching platform designed for college students. It allows students to publish course project proposals, discover compatible teammates using a deterministic matching algorithm, request to join teams, and manage project join requests.

Built as a college innovative assignment, ProjectForge strictly emphasizes clean architecture, security best practices (HTTP-only JWT cookies, bcryptjs password hashing, server-side authorization), and a sober, professional user interface.

---

## 1. Technologies Used

### Frontend
- **React.js (v19)** with **Vite** (No TypeScript, pure JavaScript)
- **Tailwind CSS (v4)** for clean, sober, responsive styling
- **React Router DOM (v7)** for client-side routing & route guards
- **Fetch API** with `credentials: 'include'` for secure cookie-based communication

### Backend
- **Node.js** & **Express.js** REST API
- **JWT (jsonwebtoken)** for stateless authentication stored in HTTP-only cookies
- **bcryptjs** for one-way password hashing
- **cookie-parser** & **cors** configured for local development

### Database
- **MongoDB** (Local MongoDB Server or MongoDB Atlas)
- **Mongoose** for schema definitions, data modeling, and relational population

---

## 2. Features Implemented

1. **Authentication & Authorization**:
   - Student registration with full name, college email, password, skills, interests, and experience level (`Beginner`, `Intermediate`, `Advanced`).
   - Secure password hashing with bcryptjs salt rounds.
   - JWT authentication via `HTTP-only` cookie (`token`) to prevent XSS attacks.
   - Protected routes in both Express backend middleware (`protect`) and React frontend (`ProtectedRoute`).
   - Role-based project ownership checks ensuring only project creators can edit, delete, or approve team join requests.
   - Session logout clearing authentication cookies.

2. **Student Profile Management**:
   - View profile information with read-only college email.
   - Update full name, technical skills (comma-separated), interests, and experience level.
   - All changes persist directly to MongoDB.

3. **Project Management (CRUD)**:
   - Create projects with title, description, required skills, max team size, and optional deadline.
   - Creator is automatically assigned as the project owner and initial team member.
   - Browse all projects stored in MongoDB with search and status filtering (`Open`, `In Progress`, `Completed`).
   - Project owners can update project details or delete projects.

4. **Team Joining & Request Workflow**:
   - Students can submit a "Request to Join" for projects they do not own and are not yet members of.
   - Prevents duplicate pending join requests.
   - Project owners can view candidate profiles for pending requests and **Accept** or **Reject** them.
   - When accepted, candidates are added to the project's `members` array in MongoDB.
   - Team capacity limits are enforced: requests cannot be submitted or accepted if `members.length >= maxTeamSize`.

5. **Deterministic Teammate Matching**:
   - Calculates a deterministic compatibility score out of 100 on the backend without external AI APIs:
     - **Direct Skill Overlap (up to 40 points)**: Shared skills between the logged-in student and the candidate.
     - **Complementary Project Needs (up to 35 points)**: Skills required by projects owned or joined by the logged-in student that the candidate possesses.
     - **Shared Domain Interests (up to 25 points)**: Common areas of interest.
   - Results are automatically sorted descending by match score.
   - Score breakdown and complementary skill highlights are clearly displayed for transparency.

6. **User Project Portfolio (`/my-projects`)**:
   - Distinct tabs separating projects created by the user from projects joined by the user.

7. **Role-Based Access Control (RBAC)**:
   - **3-Role Model**: Built-in support for `Student`, `Faculty`, and `Admin` roles.
   - **User Role Selection**: Direct role assignment upon registration (`/register`).
   - **Server-Side Authorization**: `authorize(...roles)` middleware restricting administrative and privileged endpoints.
   - **Client-Side Route Guards**: `ProtectedRoute` enforcing `allowedRoles` with a 403 Access Restricted fallback screen.
   - **Admin Control Panel (`/admin`)**: Real-time platform KPI metrics (total users, students, faculty, admins, projects, requests), dynamic role switching, and account management.
   - **Global Project Moderation**: Administrators can edit, delete, or oversee join requests for any project across the platform.
   - **Visual Role Identification**: Color-coded badges in the navigation bar: Student (blue), Faculty (emerald), Admin (purple).

---

## 3. Project Structure

```
ProjectForge/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # System metrics, user management & role updates
│   │   ├── authController.js     # Register, Login, Logout, Me
│   │   ├── projectController.js  # Project CRUD, Join requests, Approvals, Admin overrides
│   │   └── userController.js     # Profile update, Teammate matching algorithm
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & authorize RBAC middleware
│   │   └── errorHandler.js       # Centralized JSON error handler
│   ├── models/
│   │   ├── JoinRequest.js        # Join request schema with unique index
│   │   ├── Project.js            # Course project schema with references
│   │   └── User.js               # Student user schema with role & bcryptjs hooks
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin routes (RBAC protected)
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── projectRoutes.js      # /api/projects routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Example backend configuration
│   ├── package.json              # Backend dependencies
│   ├── server.js                 # Express server entry point
│   └── test_flow.js              # Integration & RBAC test assertions
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Status feedback alerts
│   │   │   ├── Navbar.jsx        # Navigation header with role badges & drawer
│   │   │   └── ProtectedRoute.jsx# Auth & RBAC role guard component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state, session recovery & role helpers
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx    # Admin metrics & user role management
│   │   │   ├── Dashboard.jsx     # Overview & recent projects
│   │   │   ├── FindTeammates.jsx # Teammate discovery with match scores
│   │   │   ├── Home.jsx          # Public landing page
│   │   │   ├── Login.jsx         # Sign in form
│   │   │   ├── MyProjects.jsx    # User-created and joined projects
│   │   │   ├── Profile.jsx       # Edit student details & view role
│   │   │   ├── ProjectDetails.jsx# Project view, join request & owner/admin actions
│   │   │   ├── Projects.jsx      # All projects catalog + creation form
│   │   │   └── Register.jsx      # Student, Faculty & Admin registration form
│   │   ├── services/
│   │   │   └── api.js            # Centralized Fetch API client with admin endpoints
│   │   ├── App.jsx               # Application routes & role protection
│   │   ├── index.css             # Base styles & Tailwind CSS imports
│   │   └── main.jsx              # React DOM entry point
│   ├── .env                      # Frontend environment variables
│   ├── .env.example              # Example frontend configuration
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
├── .gitignore                    # Git ignore file
└── README.md                     # Documentation & setup guide
```

---

## 4. Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or higher) — check with `node -v`
2. **npm** (v9.0.0 or higher) — check with `npm -v`
3. **MongoDB**:
   - **Local MongoDB Server**: Running on `mongodb://127.0.0.1:27017`
     *(On Windows, ensure the `MongoDB` Windows Service is running)*
   - **OR MongoDB Atlas**: A free cloud cluster connection string `mongodb+srv://<username>:<password>@cluster.mongodb.net/projectforge?retryWrites=true&w=majority`

---

## 5. Environment Configuration

### Backend Environment Variables (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/projectforge
JWT_SECRET=projectforge_super_secure_jwt_secret_key_2025_innovative
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Using MongoDB Atlas?**
> Replace `MONGODB_URI` with your Atlas connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/projectforge?retryWrites=true&w=majority`

### Frontend Environment Variables (`frontend/.env`)
Create a file named `.env` in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Installation & Startup (Windows PowerShell)

Open two Windows PowerShell terminal tabs:

### Terminal 1: Start Backend Server
```powershell
# Navigate to the backend directory
cd "c:\Users\Dell\OneDrive\Desktop\Sem 5\FSD\Innovative Assignment\backend"

# Install dependencies (if not already installed)
npm install

# Start the Express server
npm start
```
*The backend will run on `http://localhost:5000` and connect to MongoDB.*

### Terminal 2: Start Frontend Dev Server
```powershell
# Navigate to the frontend directory
cd "c:\Users\Dell\OneDrive\Desktop\Sem 5\FSD\Innovative Assignment\frontend"

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 7. How to Test the Complete Application Flow

### A. Testing Registration & Authentication
1. Open your browser and navigate to `http://localhost:5173/`.
2. Click **Register as a Student** (`/register`).
3. Enter details for Student 1:
   - **Name**: Aarav Sharma
   - **Email**: `aarav@college.edu`
   - **Password**: `password123`
   - **Technical Skills**: `React, Node.js, Express, JavaScript, Docker`
   - **Areas of Interest**: `Web Development, Distributed Systems`
   - **Experience Level**: `Intermediate`
4. Click **Complete Registration**. You will be logged in automatically and redirected to the **Dashboard** (`/dashboard`).
5. Notice your skills and interests are loaded from MongoDB. Click **Logout** to verify session termination.

### B. Testing Project Creation
1. Log back in as `aarav@college.edu` (`password123`).
2. Click **+ Create a Project** from the Dashboard or navigate to `/projects`.
3. Fill in:
   - **Title**: `Campus Event Hub`
   - **Description**: `A centralized platform for student clubs to manage hackathons and workshops.`
   - **Required Skills**: `React, Python, MongoDB, Docker`
   - **Max Team Size**: `3`
   - **Deadline**: Choose an upcoming date.
4. Click **Save & Publish Project**.
5. The project will now appear on the **Projects** page with `1 / 3 members` and status `Open`.
6. Click **Manage Project** to verify that Aarav is identified as the **Owner**.

### C. Testing Teammate Matching & Join Requests
1. Log out from Aarav's account.
2. Register a second student:
   - **Name**: Priya Patel
   - **Email**: `priya@college.edu`
   - **Password**: `password123`
   - **Technical Skills**: `Python, Docker, MongoDB, FastAPI`
   - **Areas of Interest**: `Web Development, Machine Learning`
   - **Experience Level**: `Advanced`
3. Click **Find Teammates** (`/teammates`) in the navbar:
   - Aarav Sharma appears with a calculated **Match Score** (e.g. 70-80+ / 100).
   - Direct Matching Skills: `Docker`
   - Complementary Skills for Aarav's project: `Python, MongoDB`
   - Shared Interest: `Web Development`
   - Score breakdown details points for direct skills, complementary needs, and shared interests.
4. Click **Projects** in the navbar and open details for `Campus Event Hub`.
5. Click **Request to Join Team**.
   - Notice the button changes to `"Your join request is currently pending review by the project owner."`

### D. Testing Owner Approval Workflow
1. Log out as Priya, and log back in as Aarav (`aarav@college.edu` / `password123`).
2. Navigate to **My Projects** (`/my-projects`) and click **Manage Project & Join Requests** on `Campus Event Hub`.
3. Under the **Manage Join Requests** section, Priya Patel's pending request is displayed with her skills and experience level.
4. Click **Accept**.
5. The request status updates to `Accepted`, and Priya is added to the project's team members. The team size updates to `2 / 3 Members`.

### E. Testing Role-Based Access Control (RBAC) & Admin Panel
1. Click **Logout** and navigate to `/register`.
2. Register an **Admin** user:
   - **Name**: Administrator
   - **Email**: `admin@college.edu`
   - **Password**: `admin123`
   - **Account Role**: Select **Admin — Platform administration & user management**.
   - Complete registration.
3. Observe the purple **Admin** badge beside your name and the new **Admin Panel** link in the navigation header.
4. Open the **Admin Panel** (`/admin`):
   - View live KPI metrics: Total Users, Students, Faculty, Admins, Projects, and Join Requests.
   - Test dynamic role reassignment: Use the dropdown in the users table to change any user's role (e.g., promote a student to Faculty or Admin).
   - Test account management: Delete inactive users and verify that related projects and requests are cascade-deleted.
5. Test Access Restriction (403):
   - Log out and log back in as Aarav (Student role).
   - Attempt to directly access `http://localhost:5173/admin`.
   - The route guard will intercept the request and display the **403 Access Restricted** page.

---

## 8. Common Errors & Troubleshooting

| Error | Cause | Solution |
|---|---|---|
| `[Database Error] Connection failed: connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB server service is not running | Run `Get-Service -Name *mongo*` in PowerShell. If stopped, start it with `Start-Service -Name MongoDB`, or update `MONGODB_URI` in `backend/.env` with MongoDB Atlas. |
| `Not authorized. Please log in to access this resource` (401) | Cookie expired or missing | Sign in through `/login`. Ensure your browser does not block third-party cookies or cookies on localhost. |
| `Duplicate entry for email` (400) | An account with this email already exists | Use another email address or log in with the existing account. |
| `Forbidden: User role is not authorized` (403) | Current account does not have required permissions | Check your assigned role (`Student`, `Faculty`, `Admin`). Admin-only endpoints require the `admin` role. |
| `Team has already reached its maximum capacity` | Cannot join or accept requests beyond `maxTeamSize` | The project owner can edit the project to increase `maxTeamSize` if more members are needed. |
| `Vite port 5173 already in use` | Another dev server instance is running | Kill the previous node process or Vite will automatically choose port 5174. If it switches to 5174, update `CLIENT_URL` in `backend/.env` to match. |

---

## 9. College Assignment Checklist & Verification

- [x] **Frontend**: React.js with Vite, Tailwind CSS, React Router DOM, Fetch API with credentials.
- [x] **Backend**: Node.js, Express.js, JWT in HTTP-only cookies, bcryptjs hashing, role-based protection.
- [x] **Database**: MongoDB with Mongoose (`User`, `Project`, `JoinRequest` models).
- [x] **Role-Based Access Control (RBAC)**: 3-role model (`Student`, `Faculty`, `Admin`), server-side `authorize` middleware, client-side route guards, and Admin Dashboard.
- [x] **Design**: Clean, sober, professional academic design.
- [x] **Teammate Matching**: Deterministic, explainable scoring formula calculated server-side based on skills, complementary project requirements, and interests.
- [x] **End-to-End Verified**: Full workflow (register -> create project -> match -> request -> approve -> admin oversight) verified via automated testing.

