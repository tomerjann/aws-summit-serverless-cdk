#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsSummitServerlessCdkStack } from '../lib/aws-summit-serverless-cdk-stack';

const app = new cdk.App();
new AwsSummitServerlessCdkStack(app, 'AwsSummitServerlessCdkStack');
