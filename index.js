const aws = require("aws-sdk");

aws.config.update({region: 'us-east-1'});
var ses = new aws.SES();

exports.handler = function (event, context, callback) {
var params = {
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
    Source: "passwordreset@prod.chandrakanthchittappa.site"
};

ses.sendEmail(params).promise().then((data) => {
        console.log("email successfully sent");
    })
    .catch((err)=>{
        console.log("error occured"+ err)
    })
}