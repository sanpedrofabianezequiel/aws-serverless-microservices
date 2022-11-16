import { PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "../basket/ddbClient";

exports.handler = async function (event) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.Records != null) {
    await sqsInvocation(event);
  } else if (event["detail-type"] !== undefined) {
    await eventBridgeInvocation(event);
  } else {
    //Api gateway Invocation --return sync response
    return await apiGatewayInvocation(event);
  }
};
const eventBridgeInvocation = async (event) => {
  console.log("Received event from EventBridge:", JSON.stringify(event, null, 2));
  const basket = await createOrder(event.detail);
};
const apiGatewayInvocation = async (event) => {
  //GET  /order
  //GET /order/{userName}
  try {
    let body = undefined;
    switch (event.httpMethod) {
      case "GET":
        if (event.pathParameters != null) {
          body = await getOrder(event);
        } else {
          body = await getAllOrders();
        }
        break;
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
    console.log("body:", JSON.stringify(body, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello from Lambda!", body }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating order",
        errorMsg: error.message,
        errorStack: error.stack,
      }),
    };
  }
};
const createOrder = async (basketCheckoutEvent) => {
  try {
    console.log("Creating order for basket:", JSON.stringify(basketCheckoutEvent, null, 2));
    const orderDate = new Date().toISOString();
    basketCheckoutEvent.orderDate = orderDate;
    console.log("Order created:", JSON.stringify(basketCheckoutEvent, null, 2));
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(basketCheckoutEvent || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log("PutItem succeeded:", JSON.stringify(createResult, null, 2));
    return createResult;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
const getOrder = async (event) => {
  console.log("getOrder:", JSON.stringify(event, null, 2));
  try {
    //expected request : xxx/order/swn?orderDate=timestamp
    const userName = event.pathParameters.userName;
    const orderDate = event.queryStringParameters.orderDate;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "userName = :userName and orderDate = :orderDate",
      ExpressionAttributeValues: {
        ":userName": { S: userName },
        ":orderDate": { S: orderDate },
      },
    };
    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log("Query succeeded:", JSON.stringify(Items, null, 2));
    return Items.map((item) => unmarshall(item));
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getAllOrders = async () => {
  console.log("getAllOrders");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log("Scan succeeded:", JSON.stringify(Items, null, 2));
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const sqsInvocation = async (event) => {
  console.log("Received event from SQS:", JSON.stringify(event, null, 2));
  event.Records.forEach(async (record) => {
    console.log("SQS record:", JSON.stringify(record, null, 2));
    const basketCheckoutEvent = JSON.parse(record.body);
    await createOrder(basketCheckoutEvent.detail);
  });
};
