import * as cdk from 'aws-cdk-lib'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import {Construct} from 'constructs'
import {DBConstruct} from '../custom-constructs/db-construct'
import { SchoolAuthConstruct } from '../custom-constructs/school-auth-construct'
import { UserAuthConstruct } from '../custom-constructs/user-auth-construct'
import {WorkerAuthConstruct} from '../custom-constructs/worker-auth-construct'
import branch from 'git-branch'

export default class UconnectBackendStack extends cdk.Stack{
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string, props: cdk.StackProps){
        super(scope,id,props)
        
        new DBConstruct(this,`DBConstruct${branch.sync()}`,{
            account: this.account,
            region: this.region,
        })

        new SchoolAuthConstruct(this,`SchoolAuthConstruct${branch.sync()}`,{
            account: this.account,
            region: this.region,
        })

        new UserAuthConstruct(this,`UserAuthConstruct${branch.sync()}`,{
            account: this.account,
            region: this.region,
        })

        new WorkerAuthConstruct(this,`WorkerAuthConstruct${branch.sync()}`,{
            account: this.account,
            region: this.region,
        })

    }
}