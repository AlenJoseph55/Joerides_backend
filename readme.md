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
- The API will be available at `http://localhost:3000` (or your configured `PORT`).

### Testing
To run the test suite (if implemented):
```
npm test
```

## API Endpoints

Below are the API endpoints provided by the Joerides Backend. All endpoints are prefixed with `/api/v1`. Some endpoints require authentication, and certain ones are restricted to users with the `"ADMIN"` role.

### Authentication Routes
| Method | Endpoint         | Description                          | Authentication       |
|--------|------------------|--------------------------------------|----------------------|
| POST   | `/auth/login`    | Log in a user and return a JWT token | No                   |
| POST   | `/auth/register` | Register a new user                  | No                   |

### Reservation Routes
| Method | Endpoint                  | Description                              | Authentication       |
|--------|---------------------------|------------------------------------------|----------------------|
| POST   | `/reservations`           | Create a new reservation                 | No                   |
| GET    | `/reservations/get`       | Get all reservations                     | Yes                  |
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
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0MjI3MTMyM30.oNyv3umoAdECuIFkaTnRkXemaUjA6fULb7pcWTjw","user":
  {
    "id":1,
    "email":"email@gmail.com",
    "name":"User",
    "role":"USER",
    "createdAt":"2025-02-17T13:36:56.836Z",
    "updatedAt":"2025-02-17T13:36:56.836Z",
    "emailVerified":false,
    "image":null
  }
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
 "id":29,
 "startTime":"2025-03-18T04:40:30.607Z",
 "endTime":"2025-03-18T05:40:30.607Z",
 "hours":1,
 "status":"ACTIVE",
 "totalAmount":"5",
 "paymentStatus":"PENDING",
 "userId":1,"bicycleId":1,
 "createdAt":"2025-03-18T04:40:30.608Z",
 "updatedAt":"2025-03-18T04:40:30.608Z",
 "user":{
  "id":1,
  "email":"admin@gmail.com",
  "name":"Admin",
  "password":"$2a$10$llfRCGFQrNAdnsIy0.LdhebjOoJe0tEG.xw1AGXCeqEXxlaGPcC5m",
  "role":"ADMIN",
  "createdAt":"2025-02-17T13:36:56.836Z",
  "updatedAt":"2025-02-17T13:36:56.836Z",
  "emailVerified":false,
  "image":null
  },
  "bicycle":
  {
    "id":1,
    "name":"Speedster 500",
    "type":"Road Bike",
    "hourlyRate":"5",
    "available":true,
    "location":"Downtown",
    "imageUrl":"https://source.unsplash.com/featured/?roadbike",
    "createdAt":"2025-02-17T19:02:47.000Z",
    "updatedAt":"2025-03-13T14:31:16.563Z"
  }
    }
```

**Add a Bicycle (Admin Only):**
```
POST /api/bicycles/add
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Mountain Bike",
  "location": "Downtown Station",
  "hourlyRate":"5"
}
```
**Response:**
```json
{
  "id":11,
  "name":"Mountain Bike",
  "type":null,
  "hourlyRate":"5",
  "available":true,
  "location":"Downtown Station",
  "imageUrl":null,
  "createdAt":"2025-03-18T04:47:22.578Z",
  "updatedAt":"2025-03-18T04:47:22.578Z"
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

