import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwnDatabase } from "./database/database";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SwnApiGateway } from "./apigateway/apigateway";
import { SwnEventBus } from "./eventbus";
import { SwnMicroservice } from "./microservice/microservice";
import { SwnQueue } from "./queue";

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, "Database");
    const microservice = new SwnMicroservice(this, "Microservice", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable,
    });
    const _ = new SwnApiGateway(this, "ApiGateway", {
      productMicroservice: microservice.productMicroservice,
      basketMicroservice: microservice.basketMicroservice,
      orderingMicroservice: microservice.orderingMicroservice,
    });

    // queue 
    const queue = new SwnQueue(this, "Queue", {
      consumer: microservice.orderingMicroservice,
    });


    //eventbus
    const eventbus =  new SwnEventBus(this, "EventBus", {
      publisherFunction: microservice.basketMicroservice,
      targetQueue: queue.orderQueue
      //targetFunction:  microservice.orderingMicroservice,
    })

  }
}
