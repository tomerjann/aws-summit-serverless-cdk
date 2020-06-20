import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { AwsSummitServerlessCdkStack } from "../lib/aws-summit-serverless-cdk-stack";

const app = new cdk.App();

new AwsSummitServerlessCdkStack(app, "prod", {
  prod: true,
  env: {
    region: "eu-west-1",
  },
});

new AwsSummitServerlessCdkStack(app, "stg", {
  prod: false,
  env: {
    region: "eu-west-1",
  },
});
