/*
  Packages and libs
*/
const http=require("http")
const express=require("express")
const request=require("request")
const path=require("path")
const mysql=require("mysql")
const session=require("express-session") 
var app=express()
const sendMail=require('./mailer')
/*
  Support Code
*/
app.set('view engine', 'pug')
app.use(express.urlencoded({extended: true}))


/*
  Connection to mysql database
*/

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "krypto"
});


// Sending mail when they hit the target

//sendMail()
setInterval(sendMail, 60000);

app.use(session({
  secret: "This is krypto exercise",
  resave: true,
  saveUninitialized: true
}));


/*
  Routes
*/

// Get crud operations:

app.get('/', function(req, res){
    return res.render('log-in');
})

app.get('/log-in', function(req, res){
  return res.render('log-in');
})

app.get('/user/:id', function(req, res){
      
    res.render('userPage', {message: `Welcome ${session.uid}`, formAction: `/user/${session.uid}`},);  
})

app.get('/user/:id/alerts', function(req, res){

    var q=`SELECT * FROM user LEFT JOIN alerts ON user.uid=alerts.uid WHERE user.uid=${session.uid}`;
    con.query(q, function(err, result, fields){
      console.log(result);
      res.send(result);
    })
})


// POST crud operations

app.post('/log-in', function(req, res){
  console.log(req.body);    
  var q="SELECT * FROM user WHERE uid="+req.body.uid;
    con.query(q, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      if((req.body.pwd).localeCompare(result[0].pwd)==0){
        session.uid=req.body.uid;
        var userUrl='/user/'+req.body.uid;
        res.redirect(userUrl);
      }
      else{
        res.render('log-in', {message:'Invalid Credentials'});
      }
    });
})

app.post('/user/:id', function(req, res){
  res.redirect(`/user/${session.uid}/alerts`)
})

/*
  Server
*/
app.listen(3000,()=>{
    console.log("Server Up and Running at port 3000")
})

