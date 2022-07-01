import { Construct } from "constructs";

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as cdk from 'aws-cdk-lib'

export class UconnectTable extends Construct {
    uconnectTable: dynamodb.Table;
    account: string;
    region: string;
    constructor(scope: Construct, id: string){
        super(scope,id)
        this.uconnectTable = new dynamodb.Table(this,`UconnectTable`,{
            tableName: `<table-name>`,
            partitionKey: {name: 'pk',type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'sk',type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'TTL'
        })

        this.uconnectTable.addGlobalSecondaryIndex({
            indexName: '<from_threads_name>',
            'partitionKey' : {
                'name': 'from',
                'type': dynamodb.AttributeType.STRING
            },
            'sortKey' : {
                'name': 'tid',
                'type' : dynamodb.AttributeType.STRING
            }
        })

        this.uconnectTable.addGlobalSecondaryIndex({
            indexName: '<to_threads_index>',
            'partitionKey' : {
                'name': 'allocated',
                'type': dynamodb.AttributeType.STRING
            },
            'sortKey' : {
                'name': 'tid',
                'type' : dynamodb.AttributeType.STRING
            }
        })
        
        this.uconnectTable.addGlobalSecondaryIndex({
            indexName: 'entities',
            'partitionKey': {
                'name': 'email',
                'type': dynamodb.AttributeType.STRING
            },
            'sortKey': {
                'name': 'type',
                'type': dynamodb.AttributeType.STRING
            },
        })
        
        new cdk.CfnOutput(this,"UconnectTableArn",{value: this.uconnectTable.tableArn})
    }
}
