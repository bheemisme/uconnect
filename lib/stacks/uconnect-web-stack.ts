import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as cdk from 'aws-cdk-lib'
import { Construct } from "constructs";


export default class UconnectWebStack extends cdk.Stack{
    sourceCodeProvider: any;
    schoolApp: amplify.App;
    userApp: amplify.App;
    workerApp: amplify.App;

    constructor(scope: Construct,id: string,props: cdk.StackProps){
        super(scope,id)
        this.sourceCodeProvider = new amplify.CodeCommitSourceCodeProvider({
            repository: codecommit.Repository.fromRepositoryArn(
                this, 
                "uconnectRepository", 
                "<codecommit-arn>"
            )
        })

        this.schoolApp = new amplify.App(this,"SchoolApp",{
            sourceCodeProvider: this.sourceCodeProvider,
            autoBranchDeletion: true,
            
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/school',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })

        this.schoolApp.addBranch('master')
        
        


        this.userApp = new amplify.App(this,"UserApp",{
            sourceCodeProvider: this.sourceCodeProvider,
            autoBranchDeletion: true,
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/user',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })

        this.userApp.addBranch('master')
        
        

        this.workerApp = new amplify.App(this,"WorkerApp",{
            sourceCodeProvider: this.sourceCodeProvider,
            autoBranchDeletion: true,
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/worker',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })

        this.workerApp.addBranch('master')
        
        new cdk.CfnOutput(this,"SchoolAppDomain",{
            value: this.schoolApp.defaultDomain
        })
        new cdk.CfnOutput(this,"UserAppDomain",{
            value: this.userApp.defaultDomain
        })
        new cdk.CfnOutput(this,"WorkerAppDomain",{
            value: this.workerApp.defaultDomain
        })
    }
}