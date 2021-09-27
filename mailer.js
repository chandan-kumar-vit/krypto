const http=require("http")
const request=require("request")
const mysql=require("mysql")
const nodemailer = require('nodemailer') 

var price=0;
/*
  Connection to mysql database
*/

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "krypto"
  });



module.exports= function sendMail(){
      
      request('https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=1&sparkline=false', function(e, res, body){
          if(!e && res.statusCode==200){
              ob=JSON.parse(body);
              price=ob[0].current_price;
              
          }
          
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'alphacomrade18@gmail.com',
              pass: ''
            }
          });
          
          var alert_details=`SELECT * FROM user LEFT JOIN alerts ON user.uid=alerts.uid`;
          con.query(alert_details, function(err, result, fields){
            console.log(price);
            for(var i=0; i<result.length; i++){
              if((result[i].status=='created') && (result[i].target_price+100<=price || result[i].target_price-100>=price)){
                  var mailOptions = {
                    from: 'alphacomrade18@gmail.com',
                    to: `${result[i].email}`,
                    subject: 'Bitcoin prices hits your target',
                    html: `<h2> Krypto </h2> <br> Hi ${result[i].name}, <br><p>Congrats!! you have hit the bulls eye. Prices have come to your target price. Today the price is ${price}<br></p> <p>Regards Krypto</p>`
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });


                  var change_status=`UPDATE alerts SET status="triggered" WHERE alert_id=${result[i].alert_id}`;
                  con.query(change_status, function(err, op, fields){
                    console.log(op);
                  })
              }
            }
          })
      
      });


}
