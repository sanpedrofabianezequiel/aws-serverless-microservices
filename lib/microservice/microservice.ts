import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroserviceProps {
  productTable: ITable;
  basketTable: ITable;
  orderTable: ITable;
}

export class SwnMicroservice extends Construct {
  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;
  public readonly orderingMicroservice: NodejsFunction;
  
  constructor(scope: Construct, id: string, props: SwnMicroserviceProps) {
    super(scope, id);

    this.productMicroservice = this.createProductMicroservice(props.productTable);
    this.basketMicroservice = this.createBasketMicroservice(props.basketTable);
    this.orderingMicroservice = this.createOrderingMicroservice(props.orderTable);
  }

  private createProductMicroservice(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    }

    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, "../../src/product/index.js"),
      ...nodeJsFunctionProps,
    });

    productTable.grantReadWriteData(productFunction);
    return productFunction; 
  }

  private createBasketMicroservice(basketTable: ITable): NodejsFunction {
    const basketFuntionProps :NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMODB_TABLE_NAME: basketTable.tableName,
        EVENT_SOURCE: "com.swn.basket.checkoutbasket",
        EVENT_DETAILTYPE:"CheckoutBasket",
        EVENT_BUSNAME:"SwnEventBus"
      },
      runtime: Runtime.NODEJS_16_X,
    }
    const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
      entry: join(__dirname, "../../src/basket/index.js"),
      ...basketFuntionProps,
    });
    basketTable.grantReadWriteData(basketFunction);
    return basketFunction;
  }

  private createOrderingMicroservice(orderTable: ITable): NodejsFunction {
    const orderingFunctionProps : NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        SORT_KEY: "orderDate",
        DYNAMODB_TABLE_NAME: orderTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    }
    const orderFunction = new NodejsFunction(this, "orderingLambdaFunction", {
      entry: join(__dirname, "../../src/ordering/index.js"),
      ...orderingFunctionProps,
    });
    orderTable.grantReadWriteData(orderFunction);
    return orderFunction;
  }



}
