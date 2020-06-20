import AWS = require("aws-sdk");

const TableName = process.env.TABLE_NAME;
const region = process.env.AWS_REGION;
AWS.config.update({ region: region });

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  const Key = {};
  Key["name"] = event.queryStringParameters.name;

  dynamo.get({ TableName, Key }, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      const response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        body: JSON.stringify(data.Item),
        isBase64Encoded: false,
      };
      callback(null, response);
    }
  });
};
