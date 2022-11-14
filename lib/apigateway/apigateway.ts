import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
  basketMicroservice: IFunction;
  orderingMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);
    this.createProductApiGateway(props.productMicroservice);
    this.createBasketApiGateway(props.basketMicroservice);
    this.createOrderingApiGateway(props.orderingMicroservice);
  }
  
  private createProductApiGateway(productMicroservice: IFunction) {
    //product
    // GET /product
    // GET /product/{id}
    // POST /product
    // PUT /product/{id}
    // DELETE /product/{id}
    const apgw = new LambdaRestApi(this, "productApiGateway", {
      restApiName: "Product Service",
      handler: productMicroservice,
      proxy: false,
    });

    const product = apgw.root.addResource("product");
    product.addMethod("GET"); // GET /product
    product.addMethod("POST"); // POST /product

    const singleProduct = product.addResource("{id}"); // example /product/{id}
    singleProduct.addMethod("GET"); // GET /product/{id}
    singleProduct.addMethod("PUT"); // PUT /product/{id}
    singleProduct.addMethod("DELETE"); // DELETE /product/{id}
  }
  private createBasketApiGateway(basketMicroservice: IFunction) {
    //basket
    // GET /basket
    // GET /basket/{userName}
    // POST /basket
    // PUT /basket/{userName}
    // DELETE /basket/{userName}
    // POST /basket/checkout
    
    const apgw = new LambdaRestApi(this, "basketApiGateway", {
      restApiName: "Basket Service",
      handler: basketMicroservice,
      proxy: false,
    });

    const basket = apgw.root.addResource("basket");
    basket.addMethod("GET"); // GET /basket
    basket.addMethod("POST"); // POST /basket

    const singleBasket = basket.addResource("{userName}"); // example /basket/{userName}
    singleBasket.addMethod("GET"); // GET /basket/{userName}
    singleBasket.addMethod("PUT"); // PUT /basket/{userName}
    singleBasket.addMethod("DELETE"); // DELETE /basket/{userName}
    
    const basketCheckout = basket.addResource("checkout");
    basketCheckout.addMethod("POST"); // POST /basket/checkout
  }

  private createOrderingApiGateway(orderingMicroservice: IFunction) {
    //GET /order
    //GET /order/{userName}
    // expected request: xx/order/swn?orderDate=timestamp
    const apigw = new LambdaRestApi(this, "orderingApiGateway", {
      restApiName: "Ordering Service",
      handler: orderingMicroservice,
      proxy: false,
    });

    const order = apigw.root.addResource("order");
    order.addMethod("GET"); // GET /order

    const singleOrder =  order.addResource("{userName}"); // example /order/{userName}
    singleOrder.addMethod("GET"); // GET /order/{userName}
    return singleOrder
  }
}
