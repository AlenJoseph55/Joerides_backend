# Joerides Backend

The backend for **Joerides**, a Bicycle Reservation System designed to manage bicycle rentals, reservations, and user authentication. This project provides a RESTful API built with Node.js, utilizing MySQL for persistent storage and Redis for caching/session management.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Prerequisites

Before setting up the Joerides Backend, ensure you have the following installed:

- **Node.js**: Version 14.x or higher
- **MySQL**: A running MySQL database (version 5.7 or higher recommended)
- **Redis**: A Redis server for caching and session management
- **npm**: Node package manager (comes with Node.js)

You’ll also need an `.env` file in the root directory with the following variables:

```
CLIENT_ORIGIN=http://localhost:3000
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/joerides_db
JWT_SECRET=your-secure-jwt-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Installation

To install and set up the Joerides Backend:

1. **Clone the repository**:
   ```
   git clone https://github.com/username/joerides-backend.git
   cd joerides-backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up the database**:
   - Create a MySQL database (e.g., `joerides_db`).
   - Update the `DATABASE_URL` in the `.env` file with your MySQL credentials.
   - Run migrations (if applicable):
     ```
     npm run migrate
     ```

4. **Start the Redis server**:
   Ensure your Redis server is running on the specified `REDIS_HOST` and `REDIS_PORT`.

5. **Run the application**:
   - For development:
     ```
     npm run dev
     ```
   - For production:
     ```
     npm start
     ```

The server will start on the port specified in the `.env` file (default: `5000`).

## Usage

The Joerides Backend provides a RESTful API to manage bicycle reservations and user accounts. After installation, interact with the API using tools like Postman, cURL, or a frontend application.

### Running the Server
- Start the server:
  ```
  npm start
  ```
- The API will be available at `http://localhost:5000` (or your configured `PORT`).

### Testing
To run the test suite (if implemented):
```
npm test
```

## API Endpoints

Below are the API endpoints provided by the Joerides Backend. All endpoints are prefixed with `/api`. Some endpoints require authentication, and certain ones are restricted to users with the `"ADMIN"` role.

### Authentication Routes
| Method | Endpoint         | Description                          | Authentication       |
|--------|------------------|--------------------------------------|----------------------|
| POST   | `/auth/login`    | Log in a user and return a JWT token | No                   |
| POST   | `/auth/register` | Register a new user                  | No                   |

### Reservation Routes
| Method | Endpoint                  | Description                              | Authentication       |
|--------|---------------------------|------------------------------------------|----------------------|
| POST   | `/reservations`           | Create a new reservation                 | No                   |
| GET    | `/reservations`           | Get all reservations                     | Yes                  |
| PUT    | `/reservations/:id/cancel`| Cancel a reservation                     | No                   |
| PUT    | `/reservations/:id/update`| Extend a reservation’s duration          | No                   |
| GET    | `/reservations/active/:id`| Get active reservations for a user/bike  | Yes                  |
| PUT    | `/reservations/complete/:id`| Manually complete a reservation       | Yes                  |

### Bicycle Routes
| Method | Endpoint         | Description                          | Authentication       |
|--------|------------------|--------------------------------------|----------------------|
| GET    | `/bicycles`      | List all bicycles                    | No                   |
| POST   | `/bicycles/add`  | Add a new bicycle                    | Yes (Admin only)     |
| PUT    | `/bicycles/:id`  | Update a bicycle’s details           | Yes (Admin only)     |
| DELETE | `/bicycles/:id`  | Delete a bicycle                     | Yes (Admin only)     |

#### Notes:
- **Authentication**: Endpoints marked "Yes" require a valid JWT token in the `Authorization` header (e.g., `Bearer <token>`).
- **Admin-Only**: Endpoints marked "Yes (Admin only)" require the authenticated user to have the `"ADMIN"` role.
- The `:id` parameter refers to either a reservation ID or bicycle ID, depending on the context.

### Example Requests

**Login:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Create a Reservation:**
```
POST /api/reservations
Content-Type: application/json

{
  "bicycleId": 1,
  "hours": "1",
  "userId": 1
}
```
**Response:**
```json
{
  "id": 123,
  "bicycleId": 1,
  "status": "active",
  "startTime": "2025-03-13T10:00:00Z",
  "endTime": "2025-03-13T12:00:00Z"
}
```

**Add a Bicycle (Admin Only):**
```
POST /api/bicycles/add
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Mountain Bike",
  "location": "Downtown Station"
}
```
**Response:**
```json
{
  "id": 2,
  "name": "Mountain Bike",
  "status": "available",
  "location": "Downtown Station"
}
```

## Environment Variables

The following environment variables are required in the `.env` file:

| Variable         | Description                                      | Example Value                  |
|------------------|--------------------------------------------------|--------------------------------|
| `CLIENT_ORIGIN`  | Frontend URL for CORS                            | `http://localhost:3000`       |
| `PORT`           | Port for the backend server                      | `5000`                        |
| `DATABASE_URL`   | MySQL connection string                          | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET`     | Secret key for JWT authentication                | `your-secure-jwt-secret`      |
| `REDIS_URL`      | Redis server url                                 | `redis://localhost:6379`               |

## Contributing

We welcome contributions to the Joerides Backend! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```
   git commit -m "Add your feature"
   ```
4. Push to your fork:
   ```
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request on GitHub.

Please ensure your code follows the project’s coding standards and includes tests where applicable.

