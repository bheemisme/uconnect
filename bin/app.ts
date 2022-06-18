#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import UconnectStack from '../lib/stacks/uconnect-stack';
const app = new cdk.App()
import branch from 'git-branch'

new UconnectStack(app, "UconnectStack", {
  env: {
    account: "750330112562",
    region: "ap-south-1",
  },
  state: 'PRODUCTION',
  stackName: `uconnect-stack-${branch.sync()}`
})





