//
const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: '2012-08-10' });
aws.config.update({region: 'us-east-1'});
var ses = new aws.SES();

exports.handler = function (event, context, callback) {

let payload = event.Records[0].Sns.Message;

let parsePayload = JSON.parse(payload);
let email = parsePayload.Email;
let link = parsePayload.link;
let token = link.split("token=")[1]

let curTime = new Date().getTime();
let ttl = 30 * 30 * 1000;
let expTime = (curTime + ttl).toString();

var emailParams = {
    Destination: {
        ToAddresses: [
            email
        ]
    },
    Message: {
        Body: {
            Html: {
                Data: `<html><head><title>Your Token</title><style>h1{color:#f00;}</style></head><body><h1>Hello,</h1><div>Your Password Reset Token is ${link}</div></body></html>`
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
        TableName: "csye6225",
        Item: {
            id: { S: email },
            ttl: { N: expTime },
            token : { S: token}
        }
    };
    let queryParams = {
        TableName: 'csye6225',
        Key: {
            'id': { S: email }
        },
    };

    ddb.getItem(queryParams, (err,data) => {
        if(err){
            console.log(err)
        }else{

            if(data.Item == undefined){

                ddb.putItem(putParams, (err,data) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log(data);

                        ses.sendEmail(emailParams).promise()
                            .then(function (data) {
                                console.log(data.MessageId);
                            })
                            .catch(function (err) {
                                console.error(err, err.stack);
                            });
                    }
                });
            }else{

                let curr = new Date().getTime();
                let ttl = Number(data.Item.ttl.N);

                if(curr > ttl){

                    ddb.putItem(putParams, (err, data) => {

                        if (err) {
                            console.log(err);
                        } else {

                            ses.sendEmail(emailParams).promise()
                                .then(function (data) {
                                    console.log(data.MessageId);
                                })
                                .catch(function (err) {
                                    console.error(err, err.stack);
                                });
                        }
                    });
                }
            }
        }
    })
};


