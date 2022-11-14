exports.handler = async function (event) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: ` ${event} request to succeeded!`,
    }),
    headers: { "Content-Type": "application/json" },
  };
};
