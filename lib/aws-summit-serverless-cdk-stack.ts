import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

interface EnvStackProps extends cdk.StackProps {
  prod: boolean;
}

const envVars = (prod: boolean) => {
  const prodEnvs = {
    dynamoDbReadWrite: 200,
    apiGatewayName: "PROD_cdk_api",
    tableName: "PROD_cdk_users",
    lambdaVars: { TABLE_NAME: "PROD_cdk_users" },
    concurrency: 100,
  };

  const stgEnvs = {
    dynamoDbReadWrite: 200,
    apiGatewayName: "STG_cdk_api",
    tableName: "STG_cdk_users",
    lambdaVars: { TABLE_NAME: "STG_cdk_users" },
    concurrency: 100,
  };

  return prod ? prodEnvs : stgEnvs;
};

export class AwsSummitServerlessCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: EnvStackProps) {
    super(scope, id, props);

    const environmentVars = envVars(props?.prod ?? false);

    // --- the dynamo db ---
    const table = new dynamodb.Table(this, "people", {
      partitionKey: { name: "name", type: dynamodb.AttributeType.STRING },
      tableName: environmentVars.tableName,
      readCapacity: environmentVars.dynamoDbReadWrite,
      billingMode: dynamodb.BillingMode.PROVISIONED,
    });

    // --- api gateway ---
    const api = new apigw.RestApi(this, environmentVars.apiGatewayName);

    // --- greeter lambda ---
    const welcomeLambda = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      environment: environmentVars.lambdaVars,
      reservedConcurrentExecutions: environmentVars.concurrency,
      handler: "hello.handler",
    });

    // greeter lambda integration
    const apiHelloInteg = new apigw.LambdaIntegration(welcomeLambda);
    const apiHello = api.root.addResource("hello");
    apiHello.addMethod("GET", apiHelloInteg);

    // --- user input lambda ---
    const createLambda = new lambda.Function(this, "CreateHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      environment: environmentVars.lambdaVars,
      reservedConcurrentExecutions: environmentVars.concurrency,
      handler: "createUser.handler",
    });

    // user input lambda integration
    const apiCreateInteg = new apigw.LambdaIntegration(createLambda);
    const apiCreate = api.root.addResource("create");
    apiCreate.addMethod("POST", apiCreateInteg);

    // --- table permissions ---
    table.grantReadWriteData(createLambda);

    // --- user read lambda ---
    const readLambda = new lambda.Function(this, "ReadHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      environment: environmentVars.lambdaVars,
      reservedConcurrentExecutions: environmentVars.concurrency,
      handler: "readUser.handler",
    });

    // user read lambda integration
    const apiReadInteg = new apigw.LambdaIntegration(readLambda);
    const apiRead = api.root.addResource("read");
    apiRead.addMethod("GET", apiReadInteg);

    // --- table permissions ---
    table.grantReadData(readLambda);
  }
}
