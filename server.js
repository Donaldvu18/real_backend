const express= require('express');
const app =express();
const bodyParser=require('body-parser');
const path = require('path');
const cors = require('cors');
const sendGrid = require('@sendGrid/mail');

// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Change later to only allow our server
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// app.get('/api', (req, res, next) => {
//     res.send('API Status: I\'m awesome')
// });

// app.get('/express_backend', (req,res)=> {
//     const axs_customers=[
//         {id:1,firstName:'Don'},
//          {id:2,firstName:'Kalvin'}
//     ];
//     res.json(axs_customers)
//     // res.send({express:'CONNECTED'})
//     // res.sendFile(path.join(__dirname+'/index.html'));
    
// });

// ********************************************* PATH FOR FINDING SALES REP NAME*********************************************
app.get('/findRep',function(req,res){
    const sql=require('mssql');
    const config = {
        user: 'dataedo',
        password: 'password',
        server: 'server', 
        database: 'db',
    }
  
    sql.connect(config,function(err){
        if (err) console.log(err);
    
        let sqlRequest= new sql.Request();
    
        let repletter=req.query.char;
        let sqlQuery='Select rep_last_name,rep_first_name,rep_id from AXSTrans.suite_sales_rep where rep_last_name like \'%'+repletter+'%\' or rep_first_name like \'%'+repletter+'%\''
      
        sqlRequest.query(sqlQuery,function(err,data){
            if (err) console.log(err)
            res.json(data);
            // setTimeout( sql.close(),10000)
        });
    });
});

// **************************************************** PATH FOR FINDING CUSTOMER INFO **********************************************************
app.get('/findClient',function(req,res){
    const sql=require('mssql');
    const config = {
        user: 'dataedo',
        password: 'password',
        server: 'server', 
        database: 'db',
    }
  
    sql.connect(config,function(err){
        if (err) console.log(err);
    
        let sqlRequest= new sql.Request();
    
        let custlettter=req.query.char;
        let sqlQuery='SELECT TOP (10) ISNULL(first_name,\'N/A\') as first_name,ISNULL(last_name,\'N/A\') as last_name, ISNULL(email,\'N/A\') as email,CAST(account_number as nvarchar) as account_number,ISNULL(company_name,\'N/A\') as company_name,CAST(ISNULL(phone1,\'N/A\') as nvarchar) as phone1 FROM [AXSTrans].[customers] where first_name like \'%'+custlettter+'%\' or last_name like \'%'+custlettter+'%\''
      
        sqlRequest.query(sqlQuery,function(err,data){
            if (err) console.log(err)
            res.json(data);
            // setTimeout( sql.close(),10000)
        });
    });
});


// ***************************************************** PATH FOR SENDING EMAIL VIA SENGRID ***************************************************

app.post('/api/email', (req, res, next) => {

 

    sendGrid.setApiKey("key");
    const {clientAccount,rep,delivery_method,clientName,clientCompany,clientEmail,discountList,event,eventdate,price_ga,price_sro,rowSeat,cardNumber,billing_address,billing_city,billing_zipcode,billing_state,expiry,ra,comments,discount,discount_comment,total,subtotal}=req.body

    htm='<div> <strong>ACCOUNT: ' + clientAccount.toString() + '</strong> <br/>'+
    '<strong>REP: </strong>' + rep + ' <br/>' + 
    '<strong>ORDER #: </strong> TBD' + 'br/>' + 
    '<strong>DELIVERY METHOD: </strong>' + delivery_method + '<br/>' + 
    '<br/>' + 
    '<strong>CLIENT NAME/COMPANY: ' + clientName + clientCompany!==''?'/':null + clientCompany + '</strong> <br/>' + 
    '<strong>EMAIL ADDRESS: <a href=\'mailto:' + clientEmail + '\'>' + clientEmail + '</a> </strong> <br/>' +
    // rowSeat.map(suite=> {return(
    //     '<span style=\'background-color:yellow;\'><strong>EVENT: </strong>' + event + '</span> <br/>' + 
    // '<strong>DATE: </strong>' + eventdate + '<br/>' +
    // '<strong>LOCATION: </strong>' + suite.name + '<br/>' + 
    // '<strong>ROW/SEAT: </strong>GA1-' + suite.GA + suite.SRO>0 ? ' SRO1-' + suite.SRO :null + '<br/>' +
    // '<strong>CHARGE BREAKDOWN: </strong>' + '$'+price_ga +'/GA ' + suite.SRO>0 ? '$' + price_sro + '/SRO' :null + '<br/><br/>'
    //  )}) +
     '<br/>' + 
     '<strong>TOTAL CHARGE: </strong></div>'
     
    comp=clientCompany!==''?'/':null 
    suitelist=rowSeat.map(suite=> {return(
        '<span style=\'background-color:yellow;\'><strong>EVENT: </strong>' + event.slice(0,-8) + '</span> <br/>' + 
    '<strong>DATE: </strong>' + eventdate + '<br/>' +
    '<strong>LOCATION: </strong>' + suite.name + '<br/>' + 
    '<strong>ROW/SEAT: </strong>GA1-' + suite.GA + (parseInt(suite.SRO)>0 ? ' SRO1-' + suite.SRO :"" )+ '<br/>' +
    '<strong>CHARGE BREAKDOWN: </strong>' + '$'+price_ga +'/GA ' + (parseInt(suite.SRO)>0 ? '$' + price_sro + '/SRO' :'') + '<br/><br/>'
     )})
     suitelist=suitelist.join('')
     disc=discount>0 ? '$'+discount.toString() : 'N/A'

     disc_com=discount_comment!==null ? discount_comment : 'N/A'
    discountchunk=discountList.map(disc=>{return(
        '<strong>DISCOUNT: </strong><span style=\'color:red;\'>-$' + disc.discount + '</span><br/>' +
        '<strong>DISCOUNT COMMENTS: </strong>' + disc.comment + '<br/><br/>' 
    )})
    discountchunk=discountchunk.join('')

    const msg = {
        to: 'dvu@clippers.com',
        cc:'donaldvu18@gmail.com',
        from: 'no-reply@clippers.com',
        subject: event.slice(0,8) + ' - Order # tbd - ' + clientName + comp + clientCompany,
        html: '<div> <strong>ACCOUNT: ' + clientAccount.toString() + '</strong> <br/>'+
        '<strong>REP: </strong>' + rep + ' <br/>' + 
        '<strong>ORDER #: </strong> TBD' + '<br/>' + 
        '<strong>DELIVERY METHOD: </strong>' + delivery_method + '<br/>' + 
        '<strong>CLIENT NAME/COMPANY:</strong> ' + clientName + comp + clientCompany + ' <br/>' + 
        '<strong>EMAIL ADDRESS: <a href=\'mailto:' + clientEmail + '\'>' + clientEmail + '</a> </strong> <br/><br/>' +
        suitelist + 
        '<strong>SUBTOTAL: </strong> $' + subtotal+ '<br/><br/>' + 
        discountchunk+
        // '<strong>DISCOUNT: </strong>' + disc + '<br/>' +
        // '<strong>DISCOUNT Comments: </strong>' + disc_com + '<br/>' +
         '<strong>TOTAL CHARGE: </strong> $' + total + '<br/><br/>' + 
         '<strong>PAYMENT METHOD: </strong> AMEX*' + cardNumber.toString().slice(-4,) + ' exp. ' + expiry.toString() + '<br/>' + 
         '<strong>BILLING ADDRESS: </strong>' + billing_address + '.' + billing_city + ', ' + billing_state + ' ' + billing_zipcode + '<br/>' + 
         '<strong>RA: </strong>' + ra + '<br/>' + 
         '<strong>COMMENTS: </strong>' + comments +'</div>'
        
        // '<div>Round3: '+req.body.billing_address.toString()+'<br/>NextLine <p><strong>bold test</strong></p> <p style=\'background-color:yellow;\'>highlight'+req.body.billing_city+'</p></div>'
    }

  
    // return(<option value={game}>{game}</option>)
    // '<span style=\'background-color:yellow;\'><strong>EVENT: </strong>' + event + '</span> <br/>' + 
    // '<strong>DATE: </strong>' + eventdate + '<br/>' +
    // '<strong>LOCATION: </strong>' + suite.name + '<br/>' + 
    // '<strong>ROW/SEAT: </strong>GA1-' + suite.GA + suite.SRO>0 ? ' SRO1-' + suite.SRO :null + '<br/>'
    // '<strong>CHARGE BREAKDOWN: </strong>' + '$'+price_ga +'/GA ' + suite.SRO>0 ? '$' + price_sro + '/SRO' :null + '<br/>'




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