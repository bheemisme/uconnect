import { Construct } from "constructs";
import {SchoolAppProps} from '../../types'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as cdk from 'aws-cdk-lib'

export class SchoolAppConstruct extends Construct {
    schoolApp: amplify.App
    uconnectRepository: codecommit.IRepository;
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string,props: SchoolAppProps ){
        super(scope,id)
        this.schoolApp = new amplify.App(this,"SchoolApp",{
            sourceCodeProvider: props.sourceCodeProvider,
            autoBranchDeletion: true,
            autoBranchCreation: {
                patterns: ['feature/*']
            },
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/school',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })
        this.schoolApp.addBranch('master')
        new cdk.CfnOutput(this,"SchoolAppDomain",{
            value: this.schoolApp.defaultDomain
        })
    }
}
