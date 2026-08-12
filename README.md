# PolantyHotels - Global Hotel Booking Platform

A scalable, multi-region hotel search and booking web application built with the MERN stack (MongoDB, Express, React, Node.js). PolantyHotels aggregates partnered multinational hotel brands and provides a seamless booking experience for customers while offering comprehensive admin and regional management tools.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Architecture & Design](#-architecture--design)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Workflows](#-core-workflows)
- [Installation & Setup](#-installation--setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Non-Functional Requirements](#-non-functional-requirements)

---

## 🎯 Project Overview

### Business Model

PolantyHotels is a hotel booking aggregation platform designed specifically for the product owner who has established partnerships with multinational hotel brands across Europe and the Americas. The business model operates on a **1% commission basis on all successful bookings** made through the platform.

**Key Business Objectives:**
- Centralize hotel search and booking across multiple hotel brands and regions
- Manage regional operations with region-specific admin teams
- Earn commission revenue from booking transactions
- Provide a white-label booking interface for partnered hotels
- Scale globally with multi-region support and cloud infrastructure

### Product Vision

PolantyHotels bridges the gap between travelers seeking accommodation and hotel partners seeking exposure. The platform:

1. **For Customers**: Provides a unified search interface to find, compare, and book hotels across multiple brands and regions
2. **For Admins**: Offers granular, region-based management of hotel catalogs, bookings, staff, and performance analytics
3. **For the Business**: Generates revenue through booking commissions while maintaining operational efficiency through regional responsibility delegation

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19.2.7 with Vite
- **State Management**: Redux Toolkit 2.12.0 + React Redux 9.3.0
- **Routing**: React Router DOM 6.30.3+
- **Mapping**: Mapbox GL 3.19.0 (for location-based search visualization)
- **HTTP Client**: Axios 1.13.4
- **Build Tool**: Vite 5.4.10
- **Testing**: Vitest 3.2.4
- **Styling**: CSS3 with CSS-in-JS patterns, Tailwind CSS support

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.1.0
- **Authentication**: JWT (jsonwebtoken 9.0.3) + optional Azure AD integration
- **Database**: MongoDB 6.21.0 with Mongoose 8.20.1 ODM
- **Payment Processing**: Stripe 22.1.0
- **Email Service**: Nodemailer 7.0.12
- **File Upload**: Multer 2.0.2 (with 5MB file size limits)
- **Security**: Bcrypt 6.0.0 (password hashing)
- **Scheduling**: Node-Cron 4.2.1 (automated tasks)
- **Utilities**: Slugify 1.6.6, Validator 13.15.23, QS 6.14.0
- **Testing**: Jest 30.2.0
- **Monitoring**: Morgan HTTP logger

### Database
- **Primary**: MongoDB Atlas (multi-region cluster)
- **Collections**: Users, Hotels, Rooms, Bookings, Reviews, Staff, Regions, Brands, Amenities, Audit Logs, Notification Logs

### Infrastructure
- **Cloud Hosting**: AWS Elastic Beanstalk / EKS, Azure App Services, or GCP Cloud Run
- **Database Hosting**: MongoDB Atlas (multi-region)
- **Object Storage**: AWS S3 or Azure Blob Storage (for images)
- **Caching**: Redis (global caching layer)
- **CDN**: CloudFront (AWS) or Azure CDN
- **Monitoring**: CloudWatch (AWS) or Azure Monitor

---

## 🏗 Architecture & Design

### High-Level Architecture

The application follows a **3-tier architecture pattern**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Tier (React/Vite)               │
│  ├─ Pages: Home, Search, Hotel Details, Auth, Account      │
│  ├─ Components: Search Bar, Hotel Card, Map Viewer          │
│  ├─ Store: Redux Toolkit (Auth, Hotels, Bookings)           │
│  └─ API: Axios interceptors for authentication              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────▼────────────────────────────────────┐
│                    API Tier (Express.js)                    │
│  ├─ Routes: Hotels, Bookings, Auth, Reviews, Admin, Users   │
│  ├─ Controllers: Business logic for each resource           │
│  ├─ Middleware: Auth, Role-based access control             │
│  ├─ Services: Email, Payment (Stripe), Upload (Multer)      │
│  ├─ Utilities: API Features, Stripe config, Email templates │
│  └─ Cron Jobs: Room release automation, cleanup tasks       │
└────────────────────────┬────────────────────────────────────┘
                         │ MongoDB Protocol
┌────────────────────────▼────────────────────────────────────┐
│                Database Tier (MongoDB Atlas)                │
│  ├─ Collections: Relational schema via Mongoose             │
│  ├─ Indexes: On search fields, timestamps, relationships    │
│  └─ Replication: Multi-region for high availability         │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

#### 1. **Model-View-Controller (MVC)**
- **Models**: Mongoose schemas define data structure
- **Controllers**: Handle request processing and business logic
- **Routes**: Map HTTP endpoints to controllers
- **Views**: React components render the UI

#### 2. **Redux State Management Pattern**
```javascript
// store/auth/auth.slice.js - Centralized auth state
// store/auth/auth.selectors.js - Memoized state selectors
// store/auth/auth.thunks.js - Async API calls (loginThunk, registerThunk, etc.)
```

#### 3. **API Feature Class (Backend)**
```javascript
// Utilities/apiFeatures.js - Supports:
// - Filtering: Query parameter parsing with case-insensitive matching
// - Sorting: Multi-field sort support
// - Pagination: Offset-based with configurable page size
// - Operator conversion: gte, gt, lte, lt → MongoDB $operators
```

#### 4. **Service Layer Pattern**
- **EmailService**: Transporter reuse, template methods for signup/password reset/booking confirmation
- **StripeService**: Payment intent creation, charge handling
- **FileUploadService**: Multer middleware with image validation and size limits

#### 5. **Role-Based Access Control (RBAC)**
```javascript
// JWT Claims Structure:
{
  user_id: "...",
  role: "admin" | "super_admin" | "csr" | "user" | "guest",
  region_id: "...", // For region-specific admins
  hotel_id: "..." // For hotel-specific staff (optional)
}
```

#### 6. **Error Handling**
- Consistent HTTP status codes (401, 403, 404, 422, 500)
- Structured error responses with descriptive messages
- Validation errors on both frontend (client-side) and backend (server-side)

---

## ✨ Key Features

### 1. Guest & User Features
- **Hotel Search**: Filter by location, date range, room type, price range, amenities
- **Hotel Details**: Full gallery, room types, amenities, reviews, pricing, location map
- **User Registration**: Email verification, secure password handling
- **Account Management**: 
  - Update profile (name, email, password, profile picture)
  - View booking history
  - Submit and manage reviews
  - Account deletion
- **Notifications**: Email alerts for security events (login, password change, billing updates)
- **Booking System**: 
  - Real-time availability checking
  - Stripe payment integration
  - Booking confirmation emails
  - Booking cancellation with refund handling

### 2. Admin Features (Region-Based)
- **Hotel Management**:
  - Add/edit/remove hotels within assigned region
  - Upload hotel images (5MB limit, JPEG/PNG only)
  - Manage room types, capacity, amenities
  - Real-time availability management
- **Booking Management**:
  - View all regional bookings
  - Investigate failed/partial bookings
  - View payment summaries
  - Fix booking discrepancies
- **Staff Management**:
  - Add/remove support staff
  - Edit staff roles and permissions
  - Assign staff to specific hotels or region-wide
- **Review Moderation**:
  - View all reviews in region
  - Delete inappropriate content
  - Toxicity filtering (optional AI)
- **Analytics Dashboard**:
  - Bookings by brand, room type, price range
  - Revenue reports (commission tracking)
  - User activity metrics
  - Date range filtering and CSV export

### 3. Support Staff (CSR) Features
- **Booking Assistance**:
  - Search bookings by reference or email
  - View detailed booking information
- **Cancellation Handling**:
  - Process cancellation requests
  - Apply hotel-specific cancellation policies
  - Issue refunds via Stripe
- **Customer Support**: Query escalation to admins

### 4. Super Admin Features
- **Global Management**:
  - Manage all regions and admins
  - Approve hotel partnerships
  - Global hotel catalog management
  - Configure system-wide settings
- **Access**: Full visibility across all regions and bookings

---

## 🏛 System Architecture

### Request Flow (Hotel Search Example)

```
1. User enters location + dates on frontend
   ↓
2. Frontend dispatches Redux thunk: paginatedHotels()
   ↓
3. API call: GET /api/hotels/search?location=Paris&checkin=2025-01-15&...
   ↓
4. Backend receives request with APIFeatures query builder:
   - Parse filters (location, date range, room type, amenities)
   - Convert operators (gte → $gte in MongoDB)
   - Case-insensitive matching for location
   - Pagination: skip/limit
   ↓
5. MongoDB query executes with indexed fields
   ↓
6. Response: Hotel list with populated room types, pricing, reviews, images
   ↓
7. Frontend Redux store updates with results
   ↓
8. React components re-render with paginated results
```

### Booking Flow (Detailed Sequence)

```
1. User selects room + enters dates/guest info
   ↓
2. Frontend calls POST /api/bookings/create
   ↓
3. Backend validates:
   - User is authenticated (JWT valid)
   - Date range is available (real-time check)
   - Guest information is complete
   ↓
4. Create Stripe PaymentIntent (amount = totalPrice)
   ↓
5. Return client_secret to frontend
   ↓
6. Frontend collects payment via Stripe.js
   ↓
7. User confirms payment
   ↓
8. Backend verifies payment was processed
   ↓
9. Create booking record with status = "confirmed"
   ↓
10. Decrement room availability in Rate collection
   ↓
11. Send confirmation email via EmailService
   ↓
12. Log commission (1%) to internal ledger
   ↓
13. Return booking confirmation to user
```

### Data Synchronization
- **Availability**: Real-time Rate collection queries ensure no overselling
- **Reviews**: Auto-calculated hotel rating from review collection
- **Audit Trail**: Every admin action logged to AuditLog collection

---

## 📁 Project Structure

```
PolantyHotels/
│
├── FrontEnd/
│   └── my-react-app/                    # React SPA (Vite)
│       ├── src/
│       │   ├── Pages/                   # Route-level components
│       │   │   ├── Index/               # Home page
│       │   │   ├── Auth/                # Login/Register
│       │   │   ├── Search/              # Hotel search results
│       │   │   ├── Hotel/               # Hotel details page
│       │   │   ├── Account/             # User profile, bookings, reviews
│       │   │   ├── PaymentSuccess/      # Payment confirmation
│       │   │   └── GlobalError/         # Error boundaries
│       │   ├── Components/              # Reusable UI components
│       │   │   ├── SearchBarComponent/  # Hotel search form
│       │   │   ├── HotelCard/           # Hotel list item
│       │   │   ├── HotelInfo/           # Hotel details cards
│       │   │   └── AvailabilityComponent/ # Booking component
│       │   ├── store/                   # Redux state
│       │   │   ├── auth/                # Auth slice, thunks, selectors
│       │   │   └── index.js             # Store configuration
│       │   ├── api/                     # API clients
│       │   │   ├── axios.js             # Axios instance with interceptors
│       │   │   ├── auth.api.js          # Auth endpoints
│       │   │   └── MapView.js           # Mapbox integration
│       │   ├── utils/                   # Utility functions
│       │   ├── App.jsx                  # Root component
│       │   ├── main.jsx                 # React-Router setup
│       │   └── index.css                # Global styles
│       ├── vite.config.js               # Vite configuration
│       ├── package.json                 # Dependencies
│       └── .env.example                 # Environment template
│
├── Admin/                               # Admin Dashboard (React + Vite)
│   ├── src/
│   │   ├── Pages/                       # Admin-specific pages
│   │   ├── Components/
│   │   └── store/
│   ├── package.json
│   └── vite.config.js
│
├── BackEnd/                             # Node.js/Express API
│   ├── src/
│   │   ├── Models/                      # Mongoose schemas
│   │   │   ├── userModel.js
│   │   │   ├── hotelModel.js
│   │   │   ├── bookingModel.js
│   │   │   ├── reviewModel.js
│   │   │   ├── roomModel.js
│   │   │   ├── room_typesModel.js
│   │   │   ├── pricingModel.js
│   │   │   ├── staffModel.js
│   │   │   └── auditLogModel.js
│   │   ├── Controller/                  # Request handlers
│   │   │   ├── AuthController/
│   │   │   ├── HotelController/
│   │   │   ├── BookingController/
│   │   │   ├── Reviews/
│   │   │   ├── BrandController/
│   │   │   └── AdminController/
│   │   ├── Routes/                      # API route definitions
│   │   │   ├── HotelRoutes/
│   │   │   ├── BookingRoutes/
│   │   │   ├── AuthRoutes/
│   │   │   ├── BrandRoutes/
│   │   │   └── AdminRoutes/
│   │   ├── Middleware/                  # Auth, validation, error handling
│   │   ├── Utilities/                   # Helper functions
│   │   │   ├── email.js                 # EmailService class
│   │   │   ├── stripe.js                # Stripe initialization
│   │   │   ├── apiFeatures.js           # Query builder (filter, sort, paginate)
│   │   │   └── NodeCron/                # Scheduled tasks
│   │   ├── config/
│   │   │   ├── database.js              # Mongoose connection
│   │   │   ├── multer.js                # File upload config
│   │   │   └── environment.js
│   │   └── Views/                       # Email templates (HTML)
│   │       └── FrontEnd/
│   │           └── userProfile/
│   ├── public/
│   │   ├── dev-data/                    # Seed data for development
│   │   │   └── Hotel Booking schema/    # JSON exports from Fabricate
│   │   └── uploads/                     # Uploaded files (images)
│   ├── app.js                           # Express app initialization
│   ├── server.js                        # Entry point (connects DB, starts cron)
│   ├── package.json
│   └── .env.example
│
└── README.md                            # This file
```

### Frontend Entry Points
- **Home Page** (`Pages/Index/`): Hotel search form, featured hotels
- **Search Results** (`Pages/Search/`): Paginated hotel listings with filters
- **Hotel Details** (`Pages/Hotel/`): Full hotel info, room options, reviews, map
- **Authentication** (`Pages/Auth/`): Login and registration forms
- **User Account** (`Pages/Account/`): Profile, bookings, reviews, settings

### Backend Entry Points
- **Main Server**: `BackEnd/server.js` (initializes Express, connects MongoDB, starts cron jobs)
- **Express App**: `BackEnd/app.js` (middleware setup, route mounting)
- **Routes**: Mounted in `app.js` and organized by resource type

---

## 🗄 Database Schema

### Core Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  first_name: String,
  last_name: String,
  nationality: String,
  date_of_birth: Date,
  role: "guest" | "user" | "csr" | "admin" | "super_admin",
  profile_picture_url: String,
  is_verified: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### Hotels
```javascript
{
  _id: ObjectId,
  brand_id: ObjectId (ref: Brands),
  region_id: ObjectId (ref: Regions),
  name: String,
  code: String,
  address_line1: String,
  city: String,
  postcode: String,
  country: String,
  latitude: Number,
  longitude: Number,
  timezone: String,
  amenities: [String], // e.g., ["WiFi", "Pool", "Gym"]
  images: [String], // URLs or local paths
  rating: Number, // Auto-calculated from reviews
  review_count: Number,
  created_at: Date,
  updated_at: Date
}
```

#### RoomTypes
```javascript
{
  _id: ObjectId,
  brand_id: ObjectId (ref: Brands),
  name: "Single" | "Double" | "Suite" | "Deluxe" | "Family",
  description: String,
  capacity: Number (1-10),
  bed_configuration: String, // e.g., "1 King Bed"
  size_sqm: Number,
  amenities: [String],
  images: [String],
  base_price: Number, // Per night (base, before Rate adjustments)
  created_at: Date
}
```

#### Rooms
```javascript
{
  _id: ObjectId,
  location_id: ObjectId (ref: Hotels),
  room_type_id: ObjectId (ref: RoomTypes),
  building_id: ObjectId (ref: Buildings), // Optional
  room_number: String,
  isAvailable: Number, // Count of available units
  status: "active" | "out_of_service",
  images: [String],
  created_at: Date
}
```

#### Rates (Inventory & Pricing)
```javascript
{
  _id: ObjectId,
  hotel_id: ObjectId (ref: Hotels),
  room_type_id: ObjectId (ref: RoomTypes),
  date: Date,
  price: Number, // Per night
  available_count: Number, // Rooms available on this date
  min_stay: Number, // Minimum nights required
  created_at: Date
}
```

#### Bookings
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: Users),
  hotel_id: ObjectId (ref: Hotels),
  room_type_id: ObjectId (ref: RoomTypes),
  room_id: ObjectId (ref: Rooms), // Assigned post-booking
  check_in_date: Date,
  check_out_date: Date,
  nights: Number,
  total_price: Number,
  currency: String, // "GBP", "EUR", etc.
  status: "pending" | "confirmed" | "cancelled" | "checked_in" | "checked_out",
  payment_provider_id: String, // Stripe payment ID
  cancellation_reason: String,
  cancelled_at: Date,
  created_at: Date
}
```

#### Reviews
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: Users),
  hotel_id: ObjectId (ref: Hotels),
  rating: Number (1-5),
  comment: String,
  moderated: Boolean, // Admin-deleted reviews
  created_at: Date
}
```

#### StaffAssignment
```javascript
{
  staff_id: ObjectId (ref: Users), // PK
  hotel_id: ObjectId (ref: Hotels), // Optional
  region_id: ObjectId (ref: Regions), // Required
  role: "csr" | "admin",
  assigned_at: Date
}
```

#### AuditLog
```javascript
{
  _id: ObjectId,
  actor_user_id: ObjectId (ref: Users),
  action: String, // "CREATE_HOTEL", "DELETE_REVIEW", etc.
  target_type: String, // "Hotel", "Review", "User"
  target_id: ObjectId,
  metadata: Object, // Additional context
  timestamp: Date
}
```

#### Regions
```javascript
{
  _id: ObjectId,
  name: String, // e.g., "Europe", "North America"
  code: String, // e.g., "EU", "NA"
  created_at: Date
}
```

#### Brands
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  logo_url: String,
  created_at: Date
}
```

---

## 👥 User Roles & Permissions

### Role Hierarchy & Capabilities

| Role | Search Hotels | Book | View Profile | Update Profile | Manage Bookings | Manage Hotels | Manage Staff | View Analytics | Global Access |
|------|---|---|---|---|---|---|---|---|---|
| **Guest** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User** (Registered) | ✅ | ✅ | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| **CSR** | ✅ | ❌ | ✅ | ❌ | ✅ (regional) | ❌ | ❌ | ❌ | ❌ |
| **Admin** | ✅ | ❌ | ✅ | ❌ | ✅ (regional) | ✅ (regional) | ✅ (regional) | ✅ (regional) | ❌ |
| **Super Admin** | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Permission Enforcement
- **JWT Claims**: Role and region_id embedded in token
- **Middleware**: `verifyToken()`, `verifyRole()`, `verifyRegion()` validate on every request
- **Query Filtering**: Admin queries automatically filtered by region_id
- **API Responses**: 403 Forbidden for out-of-region access attempts

### Authentication & Authorization Flow

```javascript
// Backend middleware stack example
1. verifyToken() → Extract and validate JWT
2. verifyRole() → Check if user role is allowed for this endpoint
3. verifyRegion() → For admins, verify they can access this resource's region
4. Controller logic → Process the request
5. Response → Return data or error
```

---

## 🔄 Core Workflows

### 1. Hotel Search Workflow
1. User enters location, check-in/out dates on home page
2. Frontend dispatches Redux thunk → API call
3. Backend `APIFeatures` class processes filters:
   - Case-insensitive location matching
   - Availability check against Rates collection
   - Price range filtering
   - Amenity filtering (multi-select)
4. MongoDB query with pagination
5. Results returned with images, room types, pricing
6. Frontend renders results with sorting/filtering options
7. User clicks hotel → navigates to detail page

### 2. Booking Workflow
1. User selects room + quantity on hotel details page
2. Frontend checks real-time availability
3. User enters guest info and billing address
4. Frontend initiates Stripe payment:
   - Create PaymentIntent on backend
   - Stripe.js collects card details
5. Backend verifies payment success
6. Create booking record with status "confirmed"
7. Decrement availability in Rates collection
8. EmailService sends confirmation email with booking reference
9. Log commission (1%) for business analytics
10. User receives booking confirmation on success page

### 3. Admin Hotel Management Workflow
1. Admin logs in → JWT token with region_id claim
2. Admin navigates to Hotel Management section
3. To add hotel:
   - Fill form with hotel details
   - Upload images (validated by Multer)
   - Assign room types and prices
   - Set availability
4. Backend validates:
   - User role is "admin"
   - Hotel region matches admin's region_id
   - Required fields are present
5. Save to Hotels and RoomTypes collections
6. Log action to AuditLog with admin ID and timestamp
7. Hotel appears immediately in search results for customers in that region

### 4. Review Moderation Workflow
1. User submits review after booking
2. Backend (optional) runs toxicity filter (AI model)
3. Review stored with `moderated: false`
4. Admin sees review in moderation queue
5. Admin can:
   - Approve (no action needed)
   - Delete (sets `moderated: true`, removes from public queries)
6. Action logged to AuditLog
7. Hotel rating auto-recalculates from non-moderated reviews

### 5. Payment & Refund Workflow
1. Booking confirmation:
   - Stripe processes payment
   - Backend records `payment_provider_id` (Stripe charge ID)
   - Booking status = "confirmed"
2. Cancellation:
   - CSR or admin initiates cancellation
   - Backend retrieves Stripe charge ID from booking
   - Calls Stripe refund API
   - Updates booking status = "cancelled"
   - Increments availability back to Rates collection
   - Sends cancellation email to user
   - Logs action to AuditLog

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (for ES Modules support)
- MongoDB Atlas account (free tier available)
- Stripe account (for payment processing)
- Nodemailer-compatible SMTP server (Gmail, Brevo, etc.)
- Mapbox API token (for map features)

### Backend Setup

1. **Navigate to BackEnd directory**
   ```bash
   cd BackEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # MongoDB
   MONGO_CLUSTER=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
   MONGO_DB_USER=your_mongo_user
   MONGO_PASS=your_mongo_password
   
   # JWT
   JWT_SECRET=your_jwt_secret_key_here_min_32_chars
   JWT_EXPIRES_IN=7d
   
   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to FrontEnd/my-react-app**
   ```bash
   cd FrontEnd/my-react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Admin Dashboard Setup

1. **Navigate to Admin**
   ```bash
   cd Admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🔧 Development

### Development Scripts

**Both UIs (from the repository root):**
```bash
npm run build:user      # Build the customer UI into FrontEnd/my-react-app/dist
npm run build:admin     # Build the admin UI into Admin/dist
npm run build:all       # Build both UIs
```

Each UI is an independent Vite application and can be deployed separately. Copy
its environment example before building, then replace the development values
with the production API URL and Mapbox token as appropriate:

```bash
cp FrontEnd/my-react-app/.env.example FrontEnd/my-react-app/.env.production
cp Admin/.env.example Admin/.env.production
npm run build:all
```

Vite loads `.env.production` during `npm run build`. Do not commit that file;
only the safe `.env.example` templates belong in source control.

**Backend:**
```bash
npm start              # Start server with nodemon (auto-reload)
npm test               # Run Jest test suite
npm run data:upload    # Upload development data to MongoDB
```

**Frontend:**
```bash
npm run dev            # Start Vite dev server with HMR
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run Vitest
npm run lint           # Run ESLint
```

### API Examples

**Search Hotels**
```bash
GET /api/hotels/search?location=Paris&checkin=2025-01-15&checkout=2025-01-20&minPrice=50&maxPrice=500&page=1&limit=10
Response:
{
  "status": "success",
  "results": 45,
  "data": [
    {
      "_id": "...",
      "name": "Hotel Name",
      "city": "Paris",
      "country": "France",
      "rating": 4.5,
      "image": "...",
      "available_rooms": 5,
      "price_per_night": 150,
      "amenities": ["WiFi", "Pool", "Gym"]
    }
  ]
}
```

**Create Booking**
```bash
POST /api/bookings
Body:
{
  "hotel_id": "...",
  "room_type_id": "...",
  "check_in_date": "2025-01-15",
  "check_out_date": "2025-01-20",
  "total_price": 750
}
Response:
{
  "status": "success",
  "data": {
    "booking_id": "...",
    "payment_intent": {
      "client_secret": "...",
      "amount": 75000  // in cents
    }
  }
}
```

**Admin: Create Hotel**
```bash
POST /api/admin/hotels
Body:
{
  "name": "Grand Hotel",
  "city": "London",
  "country": "UK",
  "address": "123 Main St",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "brand_id": "...",
  "amenities": ["WiFi", "Pool"]
}
Response:
{
  "status": "success",
  "data": {
    "hotel_id": "...",
    "name": "Grand Hotel"
  }
}
```

### Project-Specific Conventions

1. **File Naming**:
   - Components: `ComponentName.jsx`
   - Styles: `component-name.css`
   - Models: `entityModel.js`
   - Controllers: `EntityController.js`
   - Routes: `EntityRoutes.js`

2. **Code Organization**:
   - One model/controller per file
   - Related components grouped in directories
   - Utility functions in `utils/` folder
   - API calls in `api/` folder with resource-specific files

3. **Redux Store Structure**:
   - Slices: `auth.slice.js`
   - Selectors: `auth.selectors.js` (memoized with Reselect)
   - Async Thunks: `auth.thunks.js`
   - All exported from `store/index.js`

---

## 🚢 Deployment

### Prerequisites for Production
- Multi-region MongoDB Atlas cluster
- AWS/Azure/GCP account with CI/CD pipeline
- SSL certificate for HTTPS
- Environment secrets management (AWS Secrets Manager, Azure Key Vault)

### Recommended Deployment Architecture

**Frontend**: CloudFront (AWS) with S3 bucket, or Azure Static Web Apps
**Backend**: Elastic Beanstalk with auto-scaling, or EKS with Kubernetes
**Database**: MongoDB Atlas multi-region cluster
**Cache**: ElastiCache (Redis)
**Storage**: S3 (images), CloudFront (CDN)
**Monitoring**: CloudWatch, DataDog, or New Relic

### Deployment Steps

1. **Build the customer and admin frontends**
   ```bash
   # Run from the repository root
   npm run build:all
   ```

   This creates two independent deployment artifacts:
   - `FrontEnd/my-react-app/dist/` for the customer website
   - `Admin/dist/` for the admin dashboard

2. **Deploy each UI to its own CloudFront/S3 destination**
   ```bash
   aws s3 sync FrontEnd/my-react-app/dist/ s3://your-customer-ui-bucket/ --delete
   aws s3 sync Admin/dist/ s3://your-admin-ui-bucket/ --delete
   ```

   Configure each static host to serve `index.html` for unknown paths so that
   React Router routes work when opened directly. A typical domain layout is
   `www.example.com` for customers, `admin.example.com` for administrators, and
   `api.example.com` for the backend. Allow both UI origins in backend CORS.

3. **Deploy backend to Elastic Beanstalk**
   ```bash
   cd BackEnd
   eb init
   eb create polanty-hotels-env
   eb deploy
   ```

4. **Configure environment variables in cloud provider dashboard**

5. **Set up CI/CD pipeline** (GitHub Actions, GitLab CI, or Jenkins)

---

## 📋 Non-Functional Requirements

### Compliance & Security
- ✅ **GDPR Compliance**: User data encryption, right to deletion, data export functionality
- ✅ **PCI-DSS**: Stripe handles payment data (PCI-compliant), backend never stores raw card details
- ✅ **HTTPS/TLS**: All endpoints use HTTPS
- ✅ **CORS**: Frontend/backend separated, CORS configured for specific origins
- ✅ **Input Validation**: Server-side validation on all endpoints
- ✅ **Rate Limiting**: Prevent brute force and DDoS attacks
- ✅ **JWT Security**: Short-lived tokens, refresh token rotation

### Performance & Scalability
- ✅ **99.9% Uptime**: Cloud SLA with auto-scaling and failover
- ✅ **Database Indexing**: On search fields (location, date), relationships, timestamps
- ✅ **Caching Layer**: Redis for frequently accessed data (hotel listings, pricing)
- ✅ **CDN**: CloudFront for static assets and images
- ✅ **API Response Time**: < 1 second under normal load (from APIFeatures optimization)
- ✅ **Horizontal Scaling**: Stateless backend allows easy replica scaling
- ✅ **Database Replication**: MongoDB multi-region replication for high availability

### Accessibility & UX
- ✅ **WCAG 2.2 AA Compliance**: Semantic HTML, ARIA labels, keyboard navigation
- ✅ **Responsive Design**: Mobile-first approach, breakpoints at 480px, 768px, 1024px
- ✅ **Dark Mode**: CSS variables for theme switching
- ✅ **Error Handling**: Clear, actionable error messages
- ✅ **Loading States**: Skeleton loaders, spinners for async operations
- ✅ **Accessibility Testing**: Tested with screen readers (NVDA, JAWS)

### Monitoring & Logging
- ✅ **Centralized Logging**: Morgan HTTP logger, CloudWatch aggregation
- ✅ **Error Tracking**: Sentry for error monitoring (optional)
- ✅ **Database Monitoring**: MongoDB Atlas alerts
- ✅ **Audit Logging**: All admin actions logged to AuditLog collection
- ✅ **Performance Metrics**: Response times, request volume, error rates

---

## 🔐 Future Enhancements

### Planned Features
1. **Azure AD Integration**: SSO for staff/admin login
2. **Advanced Analytics**: Machine learning for price optimization
3. **Multi-currency Support**: Real-time exchange rates
4. **Booking Modifications**: Extend stay, upgrade room type
5. **Loyalty Program**: Points/rewards for repeat bookings
6. **Marketing Tools**: Email campaigns, promotions, referral system
7. **Inventory Sync**: API integration with hotel PMS systems
8. **Mobile App**: React Native version for iOS/Android
9. **Chatbot Support**: AI-powered customer service
10. **Advanced Search**: Amenity combinations, proximity filters, hotel chain filtering

---

## 📞 Support & Contact

For issues, feature requests, or questions about the PolantyHotels platform:
- GitHub Issues: [Create an Issue](https://github.com/polanty/PolantyHotels/issues)
- Email: support@polantyhotels.com (future)

---

## 📄 License

This project is licensed under the ISC License — see `LICENSE` file for details.

---

**Last Updated**: July 2025  
**Version**: 1.0.0  
**Maintained By**: Polanty (Product Owner)
