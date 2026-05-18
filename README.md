## 🔐 Environment Variables
To run this project locally, you will need to add the following environment variables to your `.env` file:

`PORT` - The port number (e.g., 5000)
`MONGODB_URI` - Your MongoDB connection string
`JWT_SECRET` - Your secret key for generating JSON Web Tokens

---

## 📡 API Endpoints

### 🔑 Authentication
* `POST /jwt` - Generates a secure JWT token for user sessions.

### 📚 Tutors
* `GET /tutors` - Retrieves all tutors. (Supports `search`, `startDate`, and `endDate` query queries).
* `GET /tutors/home` - Retrieves a limited list of 6 tutors for the homepage display.
* `GET /tutors/:id` - Retrieves detailed information about a specific tutor by their ID.
* `GET /my-tutors/:email` **(Protected)** - Retrieves all tutors created by a specific logged-in user.
* `POST /tutors` **(Protected)** - Adds a new tutor to the database.
* `PUT /tutors/:id` **(Protected)** - Updates an existing tutor's information.
* `DELETE /tutors/:id` **(Protected)** - Deletes a tutor from the database.

### 📅 Bookings
* `POST /bookings` **(Protected)** - Creates a new booking and automatically decreases the tutor's available slot by 1.
* `GET /bookings/:email` **(Protected)** - Retrieves all bookings made by a specific student.
* `PATCH /bookings/:id` **(Protected)** - Updates the status of a specific booking to "cancelled".

---

## 👨‍💻 Author
Developed by **Jobayer Hosen** as part of the Web Development curriculum.