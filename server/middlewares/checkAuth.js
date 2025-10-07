import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
export default async function checkAuth(req,res,next){
    try {
        // accept token from Authorization header (Bearer) or cookie
        let token = null;
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = req.cookies?.token;
        }

        if(!token) return res.status(401).json({message: "token not found"});
        
        const payload = jwt.verify(token,secret) 
        if(!payload) return res.status(401).json({message: "token invalid"});
        req.userData = payload
        return next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({message: "Unauthorized or invalid token"})
    }
}