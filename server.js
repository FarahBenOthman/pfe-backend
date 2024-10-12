
/*const express=require("express");
const app=express()
const mongoose=require("mongoose");
const cors=require("cors");
const cookieParser=require("cookie-parser");

/*const dotenv=require("dotenv").config();*/
/*require("dotenv").config()

app.use(express.json())

//Routes
app.get("/", (req, res) => {
    res.send("Home Page...");
});



const PORT = process.env.PORT || 5000

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err));*/

const express=require("express")
const app=express()


const cors=require("cors");
const cookieParser=require("cookie-parser"); 
const bodyParser = require("body-parser");


const userRoute=require("./routes/userRoute")
const productRoute=require("./routes/productRoute")
const categoryRoute=require("./routes/categoryRoute")
const brandRoute=require("./routes/brandRoute")
const orderRoute=require("./routes/orderRoute")
const errorHandler=require("./middleware/errorMiddleware")

const connectDB=require("./config/connectDB")


require("dotenv").config()

connectDB()



// Error Middleware
app.use(errorHandler)


const PORT = process.env.PORT || 5000


//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false}));
app.use(
    cors(
        {
            origin: ["http://localhost:3000"],
            credentials: true,
        }
    )
)
app.use(bodyParser.json()); // Ensure body is parsed as JSON
app.use(bodyParser.urlencoded({ extended: true }));
//Routes

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/brand", brandRoute);
app.use("/api/order", orderRoute);

app.get("/", (req, res) => {
    res.send("Home Page...")
})


app.listen(PORT, ()=> { console.log("Server is running on Port", + process.env.PORT)})