import { Construct } from "constructs";
import {WorkerAppProps} from '../../types'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as cdk from 'aws-cdk-lib'

export class WorkerAppConstruct extends Construct {
    WorkerApp: amplify.App
    uconnectRepository: codecommit.IRepository;
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string,props: WorkerAppProps ){
        super(scope,id)

        
        this.WorkerApp = new amplify.App(this,"WorkerApp",{
            sourceCodeProvider: props.sourceCodeProvider,
            autoBranchDeletion: true,
            autoBranchCreation: {
                patterns: ['feature/*']
            },
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/worker',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })

        this.WorkerApp.addBranch('master')
        
        new cdk.CfnOutput(this,"WorkerAppDomain",{
            value: this.WorkerApp.defaultDomain
        })

    }   
}
