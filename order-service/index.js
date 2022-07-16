const express = require("express")
const mongoose = require ("mongoose")
const amqp = require("amqplib")
const PORT = process.env.PORT || 7090
const Order =  require("./models/order")
const product = require("../product-service/models/product")

const app = express()
app.use(express.json())

var channel, connection

mongoose.connect("mongodb://127.0.0.1/oems-order-service-db",{ useNewUrlParser: true, useUnifiedTopology: true }, 
(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("connected to order service db")
    }
})


function createOrder(products, userEmail){
    let total_price = 0
    for(let i = 0; i < products.length; ++i){
        total_price += products[i].price
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price
    })
    newOrder.save()
    return newOrder

}


async function connect() {
    connection = await amqp.connect("amqp://localhost:5672")
    channel = await connection.createChannel();
    channel.assertQueue("ORDER");
}

connect().then(() =>{
    channel.consume("ORDER", data =>{
        let {products, userEmail} = JSON.parse(data.content)
        console.log("consuming ORDER queue", products)
        const newOrder = createOrder(products, userEmail)
        channel.ack(data)
        channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify(newOrder)))
    })
})

app.listen(PORT, () =>{
    console.log(`Order service is up and running on port ${PORT}`)
})