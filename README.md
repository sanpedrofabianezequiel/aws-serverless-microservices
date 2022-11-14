# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


# CLI
```
We need to be in the src/<basket>
aws events put-events --entries file://checkoutbasketevents.json
```

```
AWS Event-driven Serverless Microservices using AWS Lambda, API Gateway, EventBridge, SQS, DynamoDB and CDK for IaC

AWS Event-driven Serverless Microservices with using

AWS Lambda,

AWS DynamoDB,

AWS API Gateway,

AWS EventBridge,

AWS SQS which stands for Simple Queue Service,

AWS CDK stands for Cloud Development Kit for IaC - Infrastructure as Code tool and

AWS CloudWatch for monitoring.
```

```
REST API and CRUD endpoints with using (AWS Lambda, API Gateway)

Data persistence with using (AWS DynamoDB)

Decouple microservices with events using (AWS EventBridge)

Message Queues for cross-service communication using (AWS SQS)

Cloud stack development with IaC using (AWS CloudFormation CDK)
```

```
We will use

AWS API Gateway -for- Restful API-Driven Development and Synchronous Event Sources

AWS EventBridge -for- Event-Driven asynchronous Communication between Microservices

AWS SQS -for- Decouple Microservices and processing events asynchronously using queues
```

```
Let me try to introduce Serverless components one by one;

Api Gateway

This is entry point of our microservices.

API Gateway provides Restful API-Driven Development and Synchronous Event Sources.

Synchronous commands are request/response.

API Gateway is a synchronous event source and provides a Serverless API proxy to Lambda.

API Gateway Redirects to CRUD request to internal microservices.

Product Lambda microservices which performs;

CRUD operations using DynamoDB table over the AWS API Gateway

This will cover product table operations fully Serverless in microservices architecture.

Synchronous requests will manage by AWS API Gateway and routing requests to Product Lambda Microservices that perform CRUD operations.

We will write Lambda functions with using AWS SDK for interacting other AWS resources for example in Product case we will interact with AWS Serverless DynamoDB to perform all crud operations.

Basket Lambda microservices which performs;

Add-Remove synchronous basket operations with using AWS API Gateway and DynamoDB

Again synchronous requests will manage by AWS API Gateway and routing requests to Basket Lambda Microservices that perform CRUD operations.

We will write Lambda functions with using AWS SDK for interacting other AWS resources. For example in Basket case we interact with AWS Serverless DynamoDB to perform all crud operations.

But also,

Basket microservice triggers to Event-driven use case which is the Checkout Basket.

When checkout basket, this will publish and create event to Serverless Eventbus which is AWS EventBridge.

So this asynchronous communication will held by Basket Lambda Microservice and AWS EventBridge and consumed by Ordering microservices over the AWS SQS.

AWS Event Bridge

So asynchronous communication held by AWS Serverless Eventbus service which is AWS EventBridge.

We will create Rules and Target definitions for AWS EventBridge from Basket Lambda microservices.

That means we will develop Basket Lambda Microservices when publishing checkout message to AWS EventBridge with using AWS SDK for development purpose.

AWS SQS and Ordering Lambda microservices

So after publishing checkout event to the EventBridge, this event will consume by Ordering part.

EventBridge send to event to AWS SQS in order to gain power of AWS queue.

After that Ordering lambda microservice will consume this event with polling.

That means we will use event source mapping communication type here when consuming events, ordering lambda microservices send polling request and get event from the AWS queue.

After consuming the event from the AWS queue, Ordering lambda microservices process the event with creating order record into its DynamoDB table.

Ordering lambda microservices perform all these operations with developing lambda functions with using AWS SDK.

We have 3 communication types;

Synchronous communication with AWS API Gateway for routing request from client applications to downstream microservices

Asynchronous communication with AWS Serverless Eventbus which is EventBridge for applying Event Driven asynchronous Communication patterns.

And lastly we have Event Source mapping communication when polling queue records from lambda services to AWS SQS-Simple Queue Service for Decouple Microservice and processing events asynchronously.
```