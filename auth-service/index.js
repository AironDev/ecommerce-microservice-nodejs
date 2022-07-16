const express = require("express")
const { json } = require("express")

const jwt = require("jsonwebtoken")
app = express()
const mongoose = require("mongoose")
const PORT = process.env.PORT_ONE || 7070
app.use(express.json())

const User = require("./models/user")

mongoose.connect("mongodb://127.0.0.1/ems-auth-service-db", { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

app.post('/auth/login', async (req, res)=>{
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.json({message: "User does not exists"})
    }else{
        if(!password == user.password){
            return res.json({message: "password incorrect"})
        }
        const payload = {
            email,
            name: user.name
        }

        jwt.sign(payload, "secret", (err, token)=>{
            if(err){
                console.log(err);
            }else{
                return res.json({token})
            }
        })
    }

});

app.post('/auth/register', async(req, res) =>{
    const {email, password, name} = req.body

    const userExists = await User.findOne({email})
    if(userExists){
        return res.json({message: "User already exists"})
    }else{
        const newUser = new User({
            name,
            email,
            password
        })
        newUser.save()
        return res.json(newUser)
    }
})


app.listen(PORT, ()=>{
    console.log( "auth service running on port ", PORT)
})