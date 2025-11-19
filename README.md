# PolantyHotels
# product owner


So my aim is to create an application for the Hotel brands i have partnered with, because I have partnered with these hotels I get a 1% stipend on any bookings from my website. 
These hotels in question are multinational hotels, that is they have multiple branches across multiple countries in Europe and americas.
Being a company registered on my own, I want to have staff members who are able to take up roles as admins on this application, they will manage other staff members who will be working primarily as support staffs or Customer service reps incase a user has a query or cancellation request, the admin will probably be able to manage internal activities from a different platform but should be able to view analytics from my application with regards to bookings made (location, Hotel brands, prices, room types) , my admin will only be able to access these properties from the region they are registered in.
I also want to secure a domain in the future for this application , If there is a possibility to login to this application directly from AD kindly lay out the steps.
My tech stack will be the MERN stack and I plan on hosting this application on a scalable cloud platform.
As the admin I should be able to Manage Hotels (remove authorised hotels, add hotel along with its information( images and reelevant information), Manage reviews (Read, Delete), Manage Users (both admin and Business support ), manage Bookings (view booking information incase its processed but an error occurred from client side).

# User Perspective
As a user I want to be able to search for available hotels within any region , I want to be able to filter based on roomsize, pricing, location and distance.
I should be able to perform all of these as a guest user , however I can only book these hotels only when I signUp to the platform, 
I can Login, Delete my account , Update my Information (password, profile picture, Name, email), I should be able to view details of each hotel,  my bookings, my reviews, settings etc
And I should get information about important stuff like email update, password update or changes to my Billing Information.

# Chat Gpt generated prompt
Below is a **clear, structured, product-owner level specification** of your hotel search & booking platform, written in a way that you can hand directly to developers, architects, or investors.
It includes:
✅ Full product model
✅ User roles & permissions
✅ Functional + non-functional requirements
✅ System architecture (MERN + Cloud)
✅ Integration with Azure AD (if desired)
✅ Multi-region admin constraints
✅ Booking + review + analytics workflows
✅ Future-proofing for scalability & compliance

---

# **Hotel Booking Platform — Full Product Model (Product Owner Perspective)**

## **1. Product Vision**

To build a scalable hotel search and booking web application that aggregates partnered multinational hotel brands. Users can browse hotels globally and book rooms through the platform. Your company earns a **1% commission per booking**.

The platform includes:

* A **customer-facing booking interface**
* An **internal admin console** for managing hotels, staff, bookings, and customer issues
* **Regional access control**, where admins only manage hotels and activity in their assigned region
* **Future AD login** option
* **Secure, cloud-hosted MERN application**

---

# **2. User Roles**

### **2.1 Guest User**

* Search hotels
* Apply filters (room size, pricing, location, distance, rating)
* View hotel details, images, room types, prices, amenities
* View reviews
* Cannot book until registered

---

### **2.2 Registered User**

Everything a guest user can do, plus:

* Book hotels (requires account)
* Manage account (update name, email, password, profile picture)
* Delete account
* View past & upcoming bookings
* Submit reviews
* Cancel bookings (depending on partner rules)
* Receive security notifications:

  * Email update
  * Password update
  * Billing info change

---

### **2.3 Support Staff / Customer Service Representative (CSR)**

* View user bookings
* Handle cancellation requests
* Respond to customer queries
* Escalate issues to admin
* Cannot modify system settings or hotel configurations

---

### **2.4 Admin (Regional-Based)**

Can access features only within a region they are assigned to, e.g., “Europe Admin”, “US Admin”, “West Africa Admin”.

Admin can:

#### **Hotel Management**

* Add new partnered hotels
* Edit hotel information
* Upload/delete images
* Remove authorized hotels
* Manage room categories, amenities, availability

#### **Booking Management**

* View all bookings
* Investigate failed or partial bookings
* View payment detail summaries
* Fix booking discrepancies

#### **User Management**

* Add/remove admins
* Add/remove support staff
* Edit staff roles

#### **Review Management**

* View reviews
* Delete inappropriate reviews

#### **Analytics Dashboard**

* See bookings by:

  * Region
  * Hotel brand
  * Price range
  * Room type
* Revenue reports (1% commission)
* User activity metrics

---

### **2.5 Super Admin (You / Business Owner)**

Has full global access across all regions.
Can:

* Manage regions
* Manage all admins
* Manage all hotels globally
* Access global booking analytics
* Configure system-wide settings
* Approve hotel partnership onboarding

---

# **3. System Features (MERN Stack)**

## **3.1 Frontend (React)**

* Next.js or React 19 SPA
* Responsive design
* Accessibility friendly (WCAG 2.2 AA)
* React Query or Redux Toolkit for state

---

## **3.2 Backend (Node + Express)**

### API modules:

* Authentication & Authorization (JWT + optional Azure AD)
* Hotel Management API
* Booking Engine API
* Payment Integration (Stripe recommended)
* Review System
* User Profile API
* Admin & Staff Management
* Analytics & Reporting
* Global search and filter queries

---

## **3.3 Database (MongoDB Atlas – multi-region cluster)**

Collections:

* Users
* Roles
* Hotels
* Rooms
* Amenities
* Bookings
* Reviews
* Staff
* Regions
* Audit Logs
* Notification Logs

---

# **4. Cloud Infrastructure (Scalable)**

Recommended providers:

* **AWS → Elastic Beanstalk or EKS**
* **Azure → App Services + CosmosDB/Mongo**
* **GCP → Cloud Run + Mongo Atlas**

Architecture:

* Load balancer
* Auto-scaling containers
* CDN (CloudFront/Azure CDN)
* Object storage for images (AWS S3/Azure Blob)
* Global caching layer (Redis)

---

# **5. Logging, Monitoring & Analytics**

* CloudWatch or Azure Monitor
* Aggregated logs for bookings
* Event-driven triggers for booking failures
* Audit trail (admin actions)

---

# **6. Azure AD Login (Optional Future Implementation)**

### **Steps for Integrating Microsoft Azure AD Login**

1. Register your application in **Azure Active Directory**
2. Configure callback URLs for your frontend & backend
3. Enable **OAuth2 / OpenID Connect**
4. Install MSAL libraries:

   * msal-browser (React)
   * msal-node (Backend validation)
5. Create user roles mapping in a "claims" token
6. Assign staff members to your Azure AD directory
7. Configure tokens so staff auto-login without password

AD can be used for **staff/admin login only** or for all users, depending on your design.

---

# **7. Complete System Workflows**

## **7.1 Hotel Search Workflow**

1. User enters location or country
2. Frontend requests `/hotels/search`
3. Filters applied on backend
4. Results sorted by relevance
5. Return hotel list + images + pricing

---

## **7.2 Booking Workflow**

1. User selects room
2. Backend checks availability in real-time
3. User enters details
4. Payment processed (Stripe)
5. Booking confirmation + email
6. Commission logged for your earnings

---

## **7.3 Admin Hotel Management Workflow**

1. Admin logs in
2. Admin region verified
3. Admin can create/update/delete hotels in their region
4. Hotel visible immediately to users
5. Changes logged in audit trail

---

## **7.4 Review Moderation Workflow**

1. User submits review
2. AI toxicity filter (optional)
3. Review stored with flag
4. Admin can delete inappropriate reviews

---

## **7.5 Staff Management**

* Only super admin can create admin accounts
* Admin can create support staff
* Role-based access enforced via middleware

---

# **8. Non-Functional Requirements**

* Must comply with GDPR
* 99.9% uptime (cloud SLA)
* Scalable to millions of hotel data points
* Accessible (WCAG 2.2 AA)
* Secure API (rate limiting, input sanitization)
* Multi-region data replication

---

If you want, I can also generate:
✅ ERD (database structure)
✅ UML diagrams
✅ Full API documentation
✅ Full project folder structure (React + Node)
✅ User stories + acceptance criteria
Just tell me which one you want next.

# My question - can i get an ERD , UNL Diagrams and User stories and acceptance criteria


# Hotel Booking Platform — ERD, UML Diagrams, User Stories & Acceptance Criteria

This document contains three artifacts requested:

1. **Entity Relationship Diagram (ERD)** — textual model and a compact diagram description you can paste into diagramming tools.
2. **UML Diagrams** — PlantUML code snippets for: component overview, sequence diagram for booking, and class diagram for core models.
3. **User Stories & Acceptance Criteria** — prioritized user stories for Guest, Registered User, CSR, Admin, and Super Admin with clear acceptance criteria.

---

## 1) ERD (Entity Relationship Diagram)

Below is a concise ERD model. You can paste this into tooling (dbdiagram.io or draw.io) or use the textual summary to build the diagram.

### Entities & Key Attributes

**User**

* user_id (PK)
* email
* password_hash
* name
* role (guest|user|csr|admin|super_admin)
* profile_picture_url
* created_at

**Region**

* region_id (PK)
* name
* code (e.g., EU, US)

**Brand**

* brand_id (PK)
* name
* slug
* description

**Hotel**

* hotel_id (PK)
* brand_id (FK -> Brand.brand_id)
* region_id (FK -> Region.region_id)
* name
* code
* address_line1
* city
* postcode
* country
* lat
* lng
* timezone
* amenities (json/array)

**Building** (optional)

* building_id (PK)
* hotel_id (FK -> Hotel.hotel_id)
* name
* floors

**RoomType**

* room_type_id (PK)
* hotel_id (FK -> Hotel.hotel_id)
* code
* name
* capacity
* base_price
* amenities

**Room**

* room_id (PK)
* hotel_id (FK -> Hotel.hotel_id)
* building_id (FK -> Building.building_id)
* room_number
* room_type_id (FK -> RoomType.room_type_id)
* status (active|out_of_service)

**Rate** (inventory & pricing per date)

* rate_id (PK)
* hotel_id (FK -> Hotel.hotel_id)
* room_type_id (FK -> RoomType.room_type_id)
* date
* price
* available_count
* min_stay

**Booking**

* booking_id (PK)
* user_id (FK -> User.user_id)
* hotel_id (FK -> Hotel.hotel_id)
* room_type_id (FK -> RoomType.room_type_id)
* room_id (FK -> Room.room_id) nullable
* check_in_date
* check_out_date
* nights
* total_price
* currency
* status (pending|confirmed|cancelled|checked_in|checked_out)
* payment_provider_id
* created_at

**Review**

* review_id (PK)
* user_id (FK -> User.user_id)
* hotel_id (FK -> Hotel.hotel_id)
* rating
* comment
* created_at
* moderated (boolean)

**StaffAssignment**

* staff_id (FK -> User.user_id)
* hotel_id (FK -> Hotel.hotel_id) nullable
* region_id (FK -> Region.region_id)
* role (csr|admin)

**AuditLog**

* audit_id (PK)
* actor_user_id
* action
* target_type
* target_id
* metadata (json)
* timestamp

### Relationships (summary)

* Brand 1..* Hotel
* Region 1..* Hotel
* Hotel 1..* RoomType
* Hotel 1..* Room
* RoomType 1..* Rate (per date)
* RoomType 1..* Booking
* User 1..* Booking
* Hotel 1..* Review
* User 1..* Review
* User (staff) assigned to Region or Hotel via StaffAssignment

---


## 3) User Stories & Acceptance Criteria

Below are prioritized user stories grouped by persona. Each story is small and testable with clear acceptance criteria.

### EPIC A — Search & Booking (Guest / Registered User)

**User Story A1 — Search hotels (Guest)**

* *As a* guest user
* *I want to* search hotels by location and date range
* *So that* I can view available hotel branches and their prices

Acceptance Criteria:

* Search endpoint returns hotels within the selected area and date range.
* Response includes hotel name, brand, city, price range, rating, and available room types.
* Search supports filters for room size, price min/max, distance (km), and brand.
* Results are paginated and respond within 1 second under normal load.

**User Story A2 — Book a room (Registered User)**

* *As a* registered user
* *I want to* book a specific room type for chosen dates
* *So that* I can reserve the room and receive confirmation

Acceptance Criteria:

* Booking flow checks availability atomically before creating a pending booking.
* Payment intent is created and client receives a client secret.
* Upon successful payment, booking status becomes `confirmed` and rates inventory decremented.
* Confirmation email sent to user with booking details and commission logged.

### EPIC B — User Account

**User Story B1 — Sign up & login**

* *As a* guest
* *I want to* create an account and log in
* *So that* I can book rooms

Acceptance Criteria:

* User can sign up with email and password, receiving verification email.
* Login returns a JWT session token valid for configured time.
* Users can reset password via email link.

**User Story B2 — Manage profile**

* *As a* registered user
* *I want to* update name, email, password, and profile picture
* *So that* my account information is accurate

Acceptance Criteria:

* Changes persist to DB and trigger verification for email changes.
* Profile picture accepts images under 5MB and returns CDN URL.
* Notifications sent on email/password change.

### EPIC C — Admin & Staff

**User Story C1 — Admin region limitation**

* *As an* admin
* *I want to* only view/manage hotels in my assigned region
* *So that* I cannot modify hotels outside my responsibility

Acceptance Criteria:

* Admin's JWT contains `region_id` claim.
* All admin APIs filter results by `region_id` for non-super-admin accounts.
* Attempts to access out-of-region resources return 403.

**User Story C2 — Hotel CRUD (Admin)**

* *As an* admin
* *I want to* create, update, and remove hotels in my region
* *So that* the platform reflects partnership changes

Acceptance Criteria:

* Create returns new hotel_id and validates required fields.
* Update applies changes and writes audit log with actor & timestamp.
* Delete flags hotel as inactive (soft delete) and prevents new bookings.

**User Story C3 — Review moderation**

* *As an* admin
* *I want to* view and delete inappropriate reviews
* *So that* content remains appropriate

Acceptance Criteria:

* Reviews list shows flagged and recent reviews.
* Delete sets `moderated=true` and removes review from public queries.
* Action recorded in AuditLog.

### EPIC D — Support Staff

**User Story D1 — CSR handle cancellation**

* *As a* CSR
* *I want to* view user booking and process cancellation requests
* *So that* I can help users who face issues

Acceptance Criteria:

* CSR can search bookings by booking number or email.
* CSR can trigger cancellation flow; system follows hotel-specific cancellation rules.
* Cancellation updates inventory and issues refunds via PaymentService when required.

### EPIC E — Analytics & Reporting

**User Story E1 — Admin analytics**

* *As an* admin
* *I want to* view booking analytics filtered by brand, region, room type, and date range
* *So that* I can monitor performance and revenue (including commission)

Acceptance Criteria:

* Dashboard shows total bookings, revenue, occupancy %, and commission (1%).
* Filters update charts and tables live.
* Exports available as CSV for the date range.

---

## Next steps / Deliverables I can produce for you

If you want, I can now produce directly:

* A draw.io (XML) export of the ERD ready to import
* Mongoose model files for each schema
* Express route skeletons and example request/response JSON
* PlantUML images exported as PNG/SVG

Tell me which artifact you want next and I will generate it.
