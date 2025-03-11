const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/errorHandler");

const authMiddleware = (requiredRole = "USER") => {
  return (req, res, next) => {
    try {
      // 1️⃣ Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError(401, "Unauthorized: No token provided"));
      }
      const token = authHeader.split(" ")[1];

      // 2️⃣ Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 3️⃣ Role-based access control
      if (requiredRole === "USER" && decoded.role === "USER") {
        return next(new AppError(403, "Forbidden: Only administrators are allowed"));
      }

      // 4️⃣ Attach user info to request & proceed
      req.user = decoded;
      next();
    } catch (error) {
      return next(new AppError(401, "Unauthorized: Invalid or expired token"));
    }
  };
};

module.exports = authMiddleware;
