const { ddbClient } = require("./ddbClient");
import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // GET product/1234?category=Phone
  // event.queryStringParameters.category
  let body;
  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.queryStringParameters != null) {
          body = await getProductsByCategory(event);
        } else if (event.pathParameters != null) {
          body = await getProduct(event.pathParameters.id); //Get product/1
        } else {
          body = await getProducts(); //Get product
        }
        break;
      case "POST":
        body = await createProduct(event);
        break;
      case "DELETE":
        body = await deleteProduct(event.pathParameters.id); //Delete product/1
        break;
      case "PUT":
        body = await updateProduct(event); //Update product/1
        break;
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
    console.log("body:", body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        body,
        message: `Successfully processed ${event.httpMethod} request.`,
      }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to perform operation: ${error.message}`,
        errorMsg: error.message,
        errorStack: error.stack,
      }),
    };
  }
};

const getProduct = async (id) => {
  console.log("getProduct");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: id }),
    };
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    console.log("GetItem succeeded:", JSON.stringify(Item, null, 2));
    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.log(error);
  }
};

const getProducts = async () => {
  console.log("getProducts");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };
    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log("Scan succeeded:", JSON.stringify(Items, null, 2));
    return Items ? Items.map((item) => unmarshall(item)) : [];
  } catch (error) {
    console.log(error);
  }
};

const createProduct = async (event) => {
  console.log("createProduct");
  try {
    const productRequest = JSON.parse(event.body);
    const productId = uuidv4();
    productRequest.id = productId;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {}),
    };
    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log("PutItem succeeded:", JSON.stringify(createResult, null, 2));
    return createResult;
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (id) => {
  console.log(` deleteProduct function. productId: ${id}`);
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: id }),
    };
    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
    console.log("DeleteItem succeeded:", JSON.stringify(deleteResult, null, 2));
    return deleteResult;
  } catch (error) {
    console.log(error);
  }
};

const updateProduct = async (event) => {
  console.log(`updateProduct function. event : "${event}"`);
  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);
    console.log(`updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: requestBody[key],
          }),
          {}
        )
      ),
    };
    console.log(`updateProduct function. params : "${params}"`);
    const updateResult = await ddbClient.send(new UpdateItemCommand(params));

    console.log(updateResult);
    return updateResult;
  } catch (e) {
    console.error(` updateProduct function. Error: "${e}"`);
    throw e;
  }
};

const getProductsByCategory = async (event) => {
  console.log(`getProductsByCategory function. category: ${category}`);
  try {
    const productId = event.pathParameters.id;
    const category = event.queryStringParameters.category;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "id = :productId",
      FilterExpression: "contains (category, :category)",
      ExpressionAttributeValues: {
        ":productId": { S: productId },
        ":category": { S: category },
      },
    };
    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log("Query succeeded:", JSON.stringify(Items, null, 2));
    return Items ? Items.map((item) => unmarshall(item)) : [];
  } catch (error) {}
};
