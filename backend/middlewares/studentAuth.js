const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const Student = require('../models/student');

const studentAuth = expressAsyncHandler(async (req, res, next) => {
    // 1. Get token from cookie or Authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        res.status(401);
        throw new Error('Not authenticated - No token provided');
    }

    try {
        // 2. Verify token
        const data = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Verify role
        if (data.role?.toLowerCase() !== "student") {
            res.status(403);
            throw new Error("Unauthorized Role - Student access only");
        }

        // 4. Find student by email
        const user = await Student.findOne({ mail: data.email }).select('+faceImage');
        console.log("JWT payload:", data, " | Found student:", user?._id);

        if (!user) {
            res.status(401);
            throw new Error("Unauthorized Access - Student not found");
        }

        // 5. Check if face is required (only for face routes)
        if (req.path.includes('/face/') && !user.faceImage) {
            res.status(403);
            throw new Error("Face registration required - Please register your face first");
        }

        // 6. Attach student and token to request
        req.student = user;
        req.token = token;

        // Optional: attach class if present in JWT
        if (data.class) {
            req.class = data.class;
        }

        next();
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Session expired - Please login again');
        } else if (err.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token - Authentication failed');
        }
        throw err; // any other error
    }
});

module.exports = studentAuth;
