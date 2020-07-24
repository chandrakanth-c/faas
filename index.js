const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: '2012-08-10' });
aws.config.update({region: 'us-east-1'});
var ses = new aws.SES();

exports.handler = function (event, context, callback) {
var emailParams = {
    Destination: {
        ToAddresses: [
            'chittappa.c@northeastern.edu'
        ]
    },
    Message: {
        Body: {
            Text: {
                Charset: "UTF-8",
                Data:  "hi there !! this ie generated email"
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: "Password Reset Link"
        }
    },
    Source: "passwordlink@prod.chandrakanthchittappa.site"
};

let putParams = {
    TableName : "PasswordLink",
    Item : {
        id : { S:email },
        ttl : { N : expirationTime }
    }
};

let queryParams = {
    TableName : "PasswordLink",
    Key : {
        'id' : { S:email }
    }
};

ddb.getItem(queryParams, (err,data) => {

    if(err){
        console.log(err);
    }else{

        if(data.Item == undefined){

            ddb.putItem(putParams, (err,data) => {

                if(err){
                    console.log(err)
                }else{
                    ses.sendEmail(emailParams).promise().then((data) => {
                        console.log("email successfully sent");
                    })
                    .catch((err)=>{
                        console.log("error occured"+ err)
                    })
                }

            });
        }else{

            let curr = new Date().getTime();

            let ttl = Number(data.Item.ttl.N);

            if(curr > ttl){

                ddb.putItem(putParams, (err,data) => {

                    if(err){
                        console.log(err)
                    }else{
                        ses.sendEmail(emailParams).promise().then((data) => {
                            console.log("email successfully sent");
                        })
                        .catch((err)=>{
                            console.log("error occured"+ err)
                        })
                    }
    
                });

            }else{
                console.log('Email already sent in the last 60 mins for user ::'+email);
            }

        }

    }

});
};


