import { Construct } from "constructs";
import { DBConstructProps } from "../../types";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as cdk from 'aws-cdk-lib'

export class DBConstruct extends Construct {
    uconnectTable: dynamodb.Table;
    account: string;
    region: string;
    constructor(scope: Construct, id: string,props: DBConstructProps){
        super(scope,id)
        this.uconnectTable = new dynamodb.Table(this,`UconnectTable${props.branchName}`,{
            tableName: `uconnect-table${props.branchName}`,
            partitionKey: {name: 'PK',type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'SK',type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: props.branchName == 'Master' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY
        })

        
        new cdk.CfnOutput(this,"UconnectTableArn",{value: this.uconnectTable.tableArn})
    }
}
