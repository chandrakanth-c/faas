const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: '2012-08-10' });
aws.config.update({region: 'us-east-1'});
var ses = new aws.SES();

exports.handler = function (event, context, callback) {

let email = event.Records[0].Sns.Message;;
let curTime = new Date().getTime();
let ttl = 60 * 60 * 1000;
let expTime = (curTime + ttl).toString();

var emailParams = {
    Destination: {
        ToAddresses: [
            email
        ]
    },
    Message: {
        Body: {
            Text: {
                Charset: "UTF-8",
                Data:  "Hi"
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: "Password Reset Link"
        }
    },
    Source: "passwordlink@prod.chandrakanthchittappa.site"
};

    ses.sendEmail(emailParams).promise()
    .then(function (data) {
        console.log(data.MessageId);
    })
    .catch(function (err) {
        console.error(err, err.stack);
    });


    let putParams = {
        TableName: "emailrequest",
        Item: {
            id: { S: email },
            ttl: { N: expirationTime }
        }
    };
    let queryParams = {
        TableName: 'emailrequest',
        Key: {
            'id': { S: email }
        },
    };


    ddb.putItem(putParams, (err,data) => {
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    })


};


