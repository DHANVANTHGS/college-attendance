const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const Student = require('../models/student');

const studentAuth = expressAsyncHandler(async (req, res, next) => {
    // 1. Get token from either cookies or Authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        res.status(401);
        throw new Error('Not authenticated - No token provided');
    }

    try {
        // 2. Verify token
        const data = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Verify role
        if (data.role.toLowerCase() !== "student") {
            res.status(403);
            throw new Error("Unauthorized Role - Student access only");
        }

        // 4. Find student by mail
        const user = await Student.findOne({ mail: data.mail }).select('+faceImage +tokens');
        
        if (!user) {
            res.status(401);
            throw new Error("Unauthorized Access - Student not found");
        }

        // 5. Check if token exists in student's tokens array (for logout functionality)
        const tokenExists = user.tokens.some(t => t.token === token);
        if (!tokenExists) {
            res.status(401);
            throw new Error("Invalid session - Please login again");
        }

        // 6. Check if face is registered (only for face verification routes)
        if (req.path.includes('/face/') && !user.faceImage) {
            res.status(403);
            throw new Error("Face registration required - Please register your face first");
        }

        // 7. Attach user and token to request
        req.student = user;
        req.token = token;
        
        // 8. If class verification is needed in future
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
        // Pass other errors through
        throw err;
    }
});

module.exports = studentAuth;