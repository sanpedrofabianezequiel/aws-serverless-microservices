const { ddbClient } = require("./ddbClient");
import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ebClient } from "./eventBridgeClient";
exports.handler = async function (event) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  let body;
  try {
    switch (event.http.method) {
      case "GET":
        if (event.pathParameters != null) {
          body = await getBasket(event.pathParameters.userName);
        } else {
          body = await getAllBaskets();
        }
        break;
      case "POST":
        if (event.path == "/basket/checkout") {
          body = await checkoutBasket(event);
        } else {
          body = await createBasket(event);
        }
        break;
      case "DELETE":
        body = await deleteBasket(event.pathParameters.userName);
        break;
      default:
        throw new Error(`Unsupported method "${event.http.method}"`);
    }
    console.log("Response body:", JSON.stringify(body, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify({
        body,
        message: ` ${event.http.method} request to ${event.path} succeeded!`,
      }),
    };
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      message: `Failed to perform operation: ${error.message}`,
      errorMsg: error.message,
      errorStack: error.stack,
    }),
  };
};
const getBasket = async (userName) => {
  console.log("getBasket");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ userName: userName }),
    };
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    console.log("GetItem succeeded:", JSON.stringify(Item, null, 2));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const getAllBaskets = async () => {
  console.log("getAllBaskets");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };
    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log("Scan succeeded:", JSON.stringify(Items, null, 2));
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const createBasket = async (event) => {
  console.log("createBasket");
  try {
    const requestBody = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(requestBody || {}),
    };
    //Example of how to use the DynamoDB client
    /*Item:{
      CUSTOMER_ID: { N: "123" },
      CUSTUMER_NAME: { S: "John Doe" },
    }*/
    const { Item } = await ddbClient.send(new PutItemCommand(params));
    console.log("PutItem succeeded:", JSON.stringify(Item, null, 2));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const deleteBasket = async (userName) => {
  console.log(` deleteBasket ${userName}`);
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ userName: userName }),
    };
    const { Item } = await ddbClient.send(new DeleteItemCommand(params));
    console.log("GetItem succeeded:", JSON.stringify(Item, null, 2));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const checkoutBasket = async (event) => {
  console.log("checkoutBasket");
  try {
    //Publish event to AWS EventBridge  -- EVENT-DRIVEN ARCHITECTURE
    //expected request payload : {userName: swn,attributes[firstName,lastName,email ..]}

    const checkoutRequest = JSON.parse(event.body);
    if (checkoutRequest == null || checkoutRequest.userName == null) {
      throw new Error(`userName should exist in checkoutRequest: ${checkoutBasket}`);
    }

    const basket = await getBasket(checkoutRequest.userName);
    const checkoutPayload = prepareOrderPayload(checkoutRequest, basket);
    const publishedEvent = await publishCheckoutBasketEvent(checkoutPayload);
    console.log("checkoutBasket succeeded:", JSON.stringify(publishedEvent, null, 2));
    //Remove existing basket
    await deleteBasket(checkoutRequest.userName);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const prepareOrderPayload = (checkoutRequest, basket) => {
  console.log("prepareOrderPayload");
  try {
    if (basket == null || basket.items == null) {
      throw new Error(`basket should exist in checkoutRequest: ${checkoutBasket}`);
    }
    //calculate total price
    let totalPrice = 0;
    basket.items.forEach((item) => (totalPrice = totalPrice + item.price));
    checkoutRequest.totalPrice = totalPrice;
    console.log("prepareOrderPayload succeeded add TotalPrice:", JSON.stringify(checkoutRequest, null, 2));

    //copies all properties from basket into checkoutRequest
    Object.assign(checkoutRequest, basket);
    console.log("prepareOrderPayload succeeded:", JSON.stringify(checkoutRequest, null, 2));
    return checkoutRequest;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const publishCheckoutBasketEvent = async (checkoutPayload) => {
  console.log("publishCheckoutBasketEvent");
  try {
    const params = {
      Entries: [
        {
          Source: process.env.EVENT_SOURCE,
          Detail: JSON.stringify(checkoutPayload),
          DetailType: process.env.EVENT_DETAILTYPE,
          Resources: [],
          EventBusName: process.env.EVENT_BUSNAME,
        },
      ],
    };

    const data = await ebClient.send(new PutEventsCommand(params));
    console.log("PutEvents succeeded: requestID: ", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
