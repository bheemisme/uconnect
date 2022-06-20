#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import UconnectBackendStack from '../lib/stacks/uconnect-backend-stack';
import UconnectWebStack from '../lib/stacks/uconnect-web-stack';
const app = new cdk.App()


new UconnectBackendStack(app, `UconnectBackendStackMaster`, {
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  branchName: 'Master',
  stackName: `uconnect-backend-stack-master`
})


new UconnectBackendStack(app, `UconnectBackendStackAuth`, {
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  branchName: 'Auth',
  stackName: `uconnect-backend-stack-auth`
})

new UconnectWebStack(app,"UconnectWebStack",{
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  stackName: `uconnect-web-stack`
})
