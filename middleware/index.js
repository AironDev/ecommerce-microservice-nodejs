const jwt = require("jsonwebtoken")

exports.isAuth = async function (req, res, next){

    if (!req.headers.authorization) {
        return res.json({ error: 'No credentials sent!' });
    }

    token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, "secret", (err, user)=>{
        if(err){
            return res.json({message: err})
        }
        else{
            req.user = user
            next()
        }
    })
}

exports.isAdmin =  async function (req, res, next){
    token = req.headers['authorization'].split(" ")[1]
    jwt.verify(token, "secret", (err, user)=>{
        if(err){
            return res.json({message: err})
        }
        else{
            req.user = user
            next()
        }
    })
}