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
            tableName: `uconnect-table`,
            partitionKey: {name: 'PK',type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'SK',type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'TTL'
        })

        this.uconnectTable.addGlobalSecondaryIndex({
            indexName: 'from_threads',
            'partitionKey' : {
                'name': 'FROM',
                'type': dynamodb.AttributeType.STRING
            },
            'sortKey' : {
                'name': 'TID',
                'type' : dynamodb.AttributeType.STRING
            }
        })

        this.uconnectTable.addGlobalSecondaryIndex({
            indexName: 'to_threads',
            'partitionKey' : {
                'name': 'TO',
                'type': dynamodb.AttributeType.STRING
            },
            'sortKey' : {
                'name': 'TID',
                'type' : dynamodb.AttributeType.STRING
            }
        })
        
        new cdk.CfnOutput(this,"UconnectTableArn",{value: this.uconnectTable.tableArn})
    }
}
