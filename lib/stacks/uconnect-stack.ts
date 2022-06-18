import * as cdk from 'aws-cdk-lib'
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import {Construct} from 'constructs'
import {DBConstruct} from '../custom-constructs/db-construct'
import {UconnectProps,CustomAmplifyAppProps} from '../../types'
import { SchoolAuthConstruct } from '../custom-constructs/school-auth-construct'
import { UserAuthConstruct } from '../custom-constructs/user-auth-construct'
import {WorkerAuthConstruct} from '../custom-constructs/worker-auth-construct'
import { SchoolAppConstruct } from "../custom-constructs/school-app-construct";
import { UserAppConstruct } from "../custom-constructs/user-app-construct";
import { WorkerAppConstruct } from "../custom-constructs/worker-app-construct";

export default class UconnectStack extends cdk.Stack{
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string, props: UconnectProps){
        super(scope,id,props)
        new DBConstruct(this,"DBConstruct",{
            account: this.account,
            region: this.region,
            state: props.state
        })

        new SchoolAuthConstruct(this,"SchoolAuthConstruct",{
            account: this.account,
            region: this.region,
            state: props.state
        })

        new UserAuthConstruct(this,"UserAuthConstruct",{
            account: this.account,
            region: this.region,
            state: props.state
        })

        new WorkerAuthConstruct(this,"WorkerAuthConstruct",{
            account: this.account,
            region: this.region,
            state: props.state
        })

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
            state: 'DEVELOPMENT'
        }

        new SchoolAppConstruct(this,"SchoolApp",amplifyProps)

        new UserAppConstruct(this,"UserApp",amplifyProps)

        new WorkerAppConstruct(this,"WorkerApp",amplifyProps)

        
    }
}