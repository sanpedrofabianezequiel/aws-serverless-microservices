import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnEventBusProps {
  publisherFunction: IFunction;
  targetFunction: IFunction;
}

export class SwnEventBus extends Construct {
  constructor(scope: Construct, id: string, props: SwnEventBusProps) {
    super(scope, id);
    const bus = new EventBus(this, "SwnEventBus", {
      eventBusName: "SwnEventBus",
    });

    const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
      eventBus: bus,
      enabled: true,
      description: "When Basket microservice checkout the basket",
      ruleName: "CheckoutBasketRule",
      eventPattern: {
        source: ["com.swn.basket.checkoutbasket"],
        detailType: ["CheckoutBasket"],
      },
    });

    checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction));
    bus.grantPutEventsTo(props.publisherFunction);//Posible error AccessDeniedException: User: arn:aws:sts::xxxxxxxxxxxx:assumed-role/AwsMicroservicesStack-ApiGatewayServiceRole-1QXZQZQXZQZQZ/xxxxxxxxxxxx is not authorized to perform: events:PutEvents on resource: arn:aws:events:eu-west-1:xxxxxxxxxxxx:event-bus/default
    
  }
}
