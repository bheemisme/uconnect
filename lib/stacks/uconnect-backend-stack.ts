import * as cdk from 'aws-cdk-lib'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import {Construct} from 'constructs'
import { SchoolAuthConstruct } from '../custom-constructs/school-auth-construct'
import { UserAuthConstruct } from '../custom-constructs/user-auth-construct'
import {WorkerAuthConstruct} from '../custom-constructs/worker-auth-construct'
import {CustomStackProps} from '../../types'
export default class UconnectBackendStack extends cdk.Stack{
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string, props: CustomStackProps){
        super(scope,id,props)
        // new DBConstruct(this,`DBConstruct${props.branchName}`,{
        //     account: this.account,
        //     region: this.region,
        //     branchName: props.branchName
        // })

        new SchoolAuthConstruct(this,`SchoolAuthConstruct${props.branchName}`,{
            account: this.account,
            region: this.region,
            branchName: props.branchName
        })

        new UserAuthConstruct(this,`UserAuthConstruct${props.branchName}`,{
            account: this.account,
            region: this.region,
            branchName: props.branchName
        })

        new WorkerAuthConstruct(this,`WorkerAuthConstruct${props.branchName}`,{
            account: this.account,
            region: this.region,
            branchName: props.branchName
        })

    }
}