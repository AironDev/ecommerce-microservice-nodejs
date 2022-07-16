const express = require("express")
const app = express()
const mongoose  = require("mongoose")
const PORT = process.env.PORT2 || 7080
const amqp = require("amqplib")
const {isAuth} = require("../middleware")
const Product = require("./models/product")

app.use(express.json())

var channel, connection
var order

mongoose.connect("mongodb://127.0.0.1/ems-product-service-db", 
{ useNewUrlParser: true, useUnifiedTopology: true }, 
(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("Connected to product db successfully")
    }
})


app.post("/products/create", isAuth,  async (req, res)=>{
    const {name, description, price} = req.body
    newProduct = new Product({
        name,
        description,
        price
    })
    newProduct.save()
    return res.json(newProduct)
})

app.post("/products/buy", isAuth, async(req, res) =>{
    const {ids } = req.body
    const products = await Product.find({_id: {$in: ids}})
    channel.sendToQueue(
        "ORDER", 
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email
            })
        )
    )

   channel.consume("PRODUCT", (data) =>{
        order = JSON.parse(data.content)
        console.log("COnsuming product queue", order)
        channel.ack(data)

    })

    return res.json(order)
})

async function connect(){
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
    channel.assertQueue("PRODUCT");
}

connect()

app.listen(PORT, () =>{
    console.log(`Product service running on port ${PORT}`)
})