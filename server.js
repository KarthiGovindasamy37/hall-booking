const express=require("express")
const app=express()
const mongodb=require("mongodb")
const mongoclient=mongodb.MongoClient
const dotenv=require("dotenv").config()

let URL=process.env.URL
let DB=process.env.DB

app.use(express.json())

app.post("/createroom",async(req,res)=>{

try {
    let connection= await mongoclient.connect(URL);

let db=connection.db(DB);

await db.collection("rooms").insertOne(req.body);

await connection.close();

res.json({message:"Room Created"});
} catch (error) {
    console.log(error);
    res.status(500).json({message:"Something Went Wrong,Try Again"});
}
})

app.post("/book",async(req,res)=>{
    try {
        let connection=await mongoclient.connect(URL);

        let db=connection.db(DB); 

        let room=await db.collection("booked rooms").findOne({roomId:req.body.roomId,date:req.body.date});


        await db.collection("booked rooms").insertOne(req.body);

        await db.collection("rooms").findOneAndUpdate({roomId:req.body.roomId},{$set:{status:"booked"}})

        await connection.close();

        res.json({message:"Room booked"})
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong,Try Again"})
        
    }
})

app.get("/bookeddata",async(req,res)=>{
    try {
        let connection=await mongoclient.connect(URL);

        let db=connection.db(DB);

        let data=await db.collection("rooms").aggregate([
            {
              '$lookup': {
                'from': 'booked rooms', 
                'localField': 'roomId', 
                'foreignField': 'roomId', 
                'as': 'bookedDetails'
              }
            },{
                '$unwind': { 
                'path': "$bookedDetails", 
                'preserveNullAndEmptyArrays': true 
              }
            },{
              '$project': {
                '_id':0,
                'name': 1, 
                'status':1,
                'bookedDetails.date': 1, 
                'bookedDetails.customerName': 1, 
                'bookedDetails.startTime':1,
                'bookedDetails.endTime':1

              }
            }
          ]).toArray()

        await connection.close()

        res.json(data);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong,Try Again"})
    }
})

app.get("/customerdata",async(req,res)=>{
    try {
        let connection=await mongoclient.connect(URL);

        let db=connection.db(DB);

        let customer=await db.collection("booked rooms").find({},{_id:0}).toArray();

        await connection.close();

        res.json(customer)
    } catch (error) {
        res.status(500).json({mesage:"Something Went Wrong,Try Again"})
    }
})




app.listen(process.env.PORT || 3000)