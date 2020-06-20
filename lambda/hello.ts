exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event));

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello and Welcome to our Serverless Application!\n`,
  };
};
