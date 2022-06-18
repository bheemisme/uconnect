import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as cdk from 'aws-cdk-lib'
import { Construct } from "constructs";
import { CustomAmplifyAppProps } from "../../types";
import { SchoolAppConstruct } from "../custom-constructs/school-app-construct";
import { UserAppConstruct } from "../custom-constructs/user-app-construct";
import { WorkerAppConstruct } from "../custom-constructs/worker-app-construct";


export default class UconnectWebStack extends cdk.Stack{
    sourceCodeProvider: any;
    constructor(scope: Construct,id: string,props: cdk.StackProps){
        super(scope,id)
        this.sourceCodeProvider = new amplify.CodeCommitSourceCodeProvider({
            repository: codecommit.Repository.fromRepositoryArn(
                this, 
                "uconnectRepository", 
                "arn:aws:codecommit:ap-south-1:750330112562:uconnect"
            )
        })

        const amplifyProps: CustomAmplifyAppProps = {
            account: this.account,
            region: this.region,
            sourceCodeProvider: this.sourceCodeProvider,
        }

        new SchoolAppConstruct(this,"SchoolApp",amplifyProps)

        new UserAppConstruct(this,"UserApp",amplifyProps)

        new WorkerAppConstruct(this,"WorkerApp",amplifyProps)

    }
}