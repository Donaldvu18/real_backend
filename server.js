const express= require('express');
const app =express();
const bodyParser=require('body-parser');
const path = require('path');
const cors = require('cors');
const sendGrid = require('@sendGrid/mail');

// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Change later to only allow our server
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/api', (req, res, next) => {
    res.send('API Status: I\'m awesome')
});

app.get('/express_backend', (req,res)=> {
    const axs_customers=[
        {id:1,firstName:'Don'},
         {id:2,firstName:'Kalvin'}
    ];
    res.json(axs_customers)
    res.send({express:'CONNECTED'})
    // res.sendFile(path.join(__dirname+'/index.html'));
});

app.post('/api/email', (req, res, next) => {

    console.log(req.body);

    sendGrid.setApiKey('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');
    const msg = {
        to: 'donaldvu18@yahoo.com',
        cc:'donaldvu18@gmail.com',
        from: req.body.email,
        subject: 'Website Contact',
        html: '<div>Sup: '+req.body.billing_address.toString()+'<br/>NextLine <p><strong>bold test</strong></p> <p style=\'background-color:yellow;\'>highlight'+req.body.billing_city+'</p></div>'
    }
 
    sendGrid.send(msg)
        .then(result => {

            res.status(200).json({
                success: true
            });

        })
        .catch(err => {

            console.log('error: ', err);
            res.status(401).json({
                success: false
            });

        });
});

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*'); // Change later to only allow our server
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });


// app.get('/api', (req, res,) => {
//     res.send('API Status: I\'m awesome')
// });
// THIS USED TOW ORK
// app.get('/api/:code',function(req,res){
//     const sql=require('mssql');
//     const config = {
//         user: 'dataedo',
//         password: 'c9OK*K8&t7So',
//         server: 'clippersbi.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
//         database: 'TpanPersonalDB',
//     }
    
//     sql.connect(config,function(err){
//         if (err) console.log(err);
    
//         let sqlRequest= new sql.Request();
    
//         let rating=req.body.emprating;
//         console.log(rating)
        
//         let sqlQuery='Select * from AXSTrans.price_levels where price_level_id='+req.params.code
//         sqlRequest.query(sqlQuery,function(err,data){
//             if (err) console.log(err)
                
//                 // console.log(data);
//                 // console.log(data.recordset);
//                 // console.log(data.rowsAffected);
//                 // console.log(data.recordset[0]);
//             res.send(data);
//             sql.close();
//         });
//     });
//     });



// app.post('/Employees',function(req,res){
// const sql=require('mssql');
// const config = {
//     user: 'dataedo',
//     password: 'c9OK*K8&t7So',
//     server: 'clippersbi.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
//     database: 'TpanPersonalDB',
// }

// sql.connect(config,function(err){
//     if (err) console.log(err);

//     let sqlRequest= new sql.Request();

//     let rating=req.body.emprating;
//     console.log(rating)
//     let sqlQuery='Select * from AXSTrans.price_levels where price_level_id=' +rating

//     sqlRequest.query(sqlQuery,function(err,data){
//         if (err) console.log(err)
            
//             // console.log(data);
//             // console.log(data.recordset);
//             // console.log(data.rowsAffected);
//             // console.log(data.recordset[0]);
//         res.send(data);
//         sql.close();
//     });
// });
// });
const webserver= app.listen(5000,function(){
    console.log('Web server is running on port 5000');
})