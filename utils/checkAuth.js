import jwt from "jsonwebtoken"
const checkAuth = (req,res,next)=> {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "")
    if(token) {
        try {
            const decoded = jwt.verify(token, "secret")
            req.userId = decoded._id
        } catch(err) {
            console.log(err)
            return res.status(403).json({message:"Нет доступа"})
        }
    } else {
        return res.status(403).json({message:"Нет доступа"})
    }
    next()
}

export default checkAuth