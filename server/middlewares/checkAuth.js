import jwt from 'jsonwebtoken'

const secret = process.env.jwtsecret
export default async function checkAuth(req,res,next){
    try {
        const token = req.cookies?.token;
        if(!token) return res.status(401).json({message: "token not found"});
        // console.log("Auth middleware hit");
        
        const payload = jwt.verify(token,secret) 
        if(!payload) return res.status(401).json({message: "token invalid"});
        req.userData = payload
        return next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({message: "Unauthorized or invalid token"})
    }
}