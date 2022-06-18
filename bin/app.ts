#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import UconnectBackendStack from '../lib/stacks/uconnect-backend-stack';
import UconnectWebStack from '../lib/stacks/uconnect-web-stack';
const app = new cdk.App()
import branch from 'git-branch'

new UconnectBackendStack(app, "UconnectBackendStack", {
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  stackName: `uconnect--backend-stack-${branch.sync()}`
})

new UconnectWebStack(app,"UconnectWebStack",{
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  stackName: `uconnect-web-stack`
})
