const express = require("express")
const nodemailer = require('nodemailer');
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

const fs = require("fs")
const bcrypt = require('bcrypt');
const session =require("express-session")
const flash=require('express-flash-messages') 
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const mongoose = require("mongoose")
const User = require("./models/user")
const PORT = process.env.PORT || 3003
const database =`Nodemail`
const dbURI = `mongodb+srv://sean:badnewzzmp23@nodemailer.glt2i.mongodb.net/${database}?retryWrites=true&w=majority`


const app = express() 

mongoose.connect(dbURI,{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false })
.then((result) =>app.listen(PORT,() => {
    console.log("listening port 3003")
  }))
 .catch((err) => {
   console.log(err)
 })


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));





app.use(flash());
     app.use(session({ secret:"secret",resave:false,saveUninitialized:true}))
    // resave:false,
    // saveUninitialized:false
    // }));
    







// ========== GET ===============

app.get("/", (req,res) => {
    
    res.render("pages/login")
})

app.get("/login", (req,res) => {
  
    

    
    res.render("pages/login",{email:req.query.valid,id:req.query.id})
})

app.get("/register", (req,res) => {
  
    res.render("pages/register")
})


app.post("/secret",async (req,res) => {
User.find()
.then((result) => {
    console.log(result)
    if(  result.some( elt => elt['email'] === req.body.email && bcrypt.compareSync(req.body.password,elt.password) && elt.status==="active")){
        console.log("email correct & password correct")
     res.render("pages/secret")
    }else if(result.some( elt => elt['email'] === req.body.email && bcrypt.compareSync(req.body.password,elt.password) && elt.status==="pending")){
      let user =  result.find( elt => elt['email'] === req.body.email && bcrypt.compareSync(req.body.password,elt.password) && elt.status==="pending")
      console.log(user)
        const emailString = encodeURIComponent(user.email);
        const idString = encodeURIComponent(user._id)
        req.flash("errorPending","confirm mail")
        // const resendMail = req.body.email
        // res.redirect("/login/?email="+req.body.email)
         res.redirect("/login?valid=" + emailString + "&id=" + idString)
        //  res.redirect("/login")
    }else if(result.some( elt => elt['email'] === req.body.email && !bcrypt.compareSync(req.body.password,elt.password))){
     
        req.flash("errorMail","not correct")
        res.redirect("/login",)
    }else if(result.some( elt => elt['email'] !== req.body.email  )){
     
        // req.flash("errorMail","not correct")
        req.flash("register","not correct")
        res.redirect("/register",)
    }
    
    else{
        req.flash("error","not correct")
    res.redirect("/login")
// return done({message:"password or email incorrect"})

    }
})

   
   

//    req.flash("error","not correct")
//     res.redirect("/login")
})




app.post('/send', async (req, res) => {
  

    
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "nodemailer2022@gmail.com",
            pass: "supercode"
        }
    });






    const user = new User({
               firstname: req.body.firstname,
           lastname: req.body.lastname,
           email: req.body.email,
           status: "pending",
        //    confirmationCode: confirmCode,
           password: hashedPassword
    })


    user.save()
    .then((result) => {
      console.log(result.firstname)
      const confirmCode ="https://pacific-ridge-22963.herokuapp.com/confirm/"+result._id

          let info = transporter.sendMail({
        from: '"Super Sean 👻" <YourEmail>', // sender address
        to: result.email, // list of receivers
        subject: "SUPER BOY ✔", // Subject line
        text: "DU BIST SUPER?", // plain text body
        html: `<p>please confirm your registration with this link </p> <br> <a href=${confirmCode}>Click here to confirm Email</a>`,
        

    }, (err, info) => {
        if (err) {throw err
        }else{}
        });
    })



    res.render('pages/registrationSent')
})


//=============== RESEND ====================

app.get("/resend/:email/:id",(req,res) => {
    console.log(req.body.email,"here")
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "nodemailer2022@gmail.com",
            pass: "supercode"
        }
    });
    const confirmCode ="https://pacific-ridge-22963.herokuapp.com/confirm/"+req.params.id
      let info =  transporter.sendMail({
          from: '"Super Sean 👻" <YourEmail>', // sender address
          to: req.params.email, // list of receivers
          subject: "SUPER BOY ✔", // Subject line
          text: "Hello world?", // plain text body
          html: `<p>please confirm your registration with this link </p> <br> <a href=${confirmCode}>Click here to confirm Email</a>`,
        }, (err, info) => {
            if (err) {throw err
            }else{


        
                res.render("pages/registrationSent")    
            }
         } )
         
         
        
})


 //==========Confirm request =========== //
app.get("/confirm/:id",(req,res) => {

const id = req.params.id
console.log(id)
User.findByIdAndUpdate(id,{"status":"active"},(err,result) => {
  
    if(err){
        res.send(err)
    }
    else{
        res.render("pages/confirmed")
    }
})



//     fs.readFile("./data/Users.json","utf-8", (err,data) => {

//         if(err) {throw err
//         }else{
//          const infoo =JSON.parse(data)
//          const pendingUser  = infoo.find((elt) => {
//           return elt.id === req.params.id                     
//           })
//           console.log(pendingUser,"pendingUser")
//           pendingUser.status = "active"
//           const pendingOutfiltered = infoo.filter((elt) => {
//             return elt.id !== req.params.id
//           })
//           pendingOutfiltered.push(pendingUser)

//           fs.writeFile("./data/Users.json", JSON.stringify(pendingOutfiltered), err =>{
//             if(err){ throw err
//             }else{
//                 console.log("file written")
//             }
//         })
//         //   console.log(JSON.stringify(pendingOutfiltered))
//         }
//     })

// console.log(req.params.id)
//   res.render("pages/confirmed")
})