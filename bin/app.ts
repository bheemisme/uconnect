#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import UconnectBackendStack from '../lib/stacks/uconnect-backend-stack';
import UconnectWebStack from '../lib/stacks/uconnect-web-stack';
const app = new cdk.App()


new UconnectBackendStack(app, `UconnectBackendStack`, {
  env: {
    account: "<account-no>",
    region: "<region>",
  },
  stackName: `uconnect-backend-stack`
})



new UconnectWebStack(app,"UconnectWebStack",{
  env: {
    account: "<account-no>",
    region: "<region>",
  },
  stackName: `uconnect-web-stack`
})
