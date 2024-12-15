const jwt = require('jsonwebtoken');

const excludedPaths = ['/api/users/login', '/api/users/register']; 

exports.verifyToken = (req, res, next) => {
    console.log("API: ", req.path);

    if (excludedPaths.includes(req.path) || req.path.startsWith('/uploads')) {
        return next(); 
    }

    const token = req.token; 

    if (!token) {
        console.log("A token is required for authentication")
        return res.status(403).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 

        // Thêm createdBy và updatedBy vào body
        req.body.createdBy = decoded.id; 
        req.body.updatedBy = decoded.id; 

        if (decoded.buildingId) {
            req.body.buildingId = decoded.buildingId; 
        }
        next();
    } catch (error) {
        console.log("Invalid Token", error.message)
        return res.status(401).send("Invalid Token");
    }
};