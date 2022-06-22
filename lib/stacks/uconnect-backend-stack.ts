import * as cdk from 'aws-cdk-lib'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import {Construct} from 'constructs'
import { SchoolAuthConstruct } from '../custom-constructs/school-auth-construct'
import { UserAuthConstruct } from '../custom-constructs/user-auth-construct'
import {WorkerAuthConstruct} from '../custom-constructs/worker-auth-construct'
import { StatelessApiConstruct } from '../custom-constructs/stateless-api-construct'
import { DBConstruct } from '../custom-constructs/db-construct'
import {SchoolAuthorizerConstruct} from '../custom-constructs/school-authorizer-construct'
import {SchoolWorkerConstruct} from '../custom-constructs/school-worker-construct'
import {SchoolLambdaConstruct} from '../custom-constructs/school-lambda-construct'
import {StatefullApiConstruct} from '../custom-constructs/statefull-api-construct'
import { StatefullLambdaConstruct } from '../custom-constructs/statefull-lambda-construct'
import { StatefullAuthConstruct } from '../custom-constructs/statefull-auth-construct'

export default class UconnectBackendStack extends cdk.Stack{
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    statelessapi: StatelessApiConstruct
    uconnectTable: DBConstruct
    schoolAuth: SchoolAuthConstruct
    userAuth: UserAuthConstruct
    workerAuth: WorkerAuthConstruct
    schoolAuthorizers: SchoolAuthorizerConstruct
    schoolWorkers: SchoolWorkerConstruct;
    schoolLambdaConstruct: SchoolLambdaConstruct;
    uconnectSocketApi: StatefullApiConstruct;
    uconnectSocketLambdas: StatefullLambdaConstruct
    uconnectSocketAuth: StatefullAuthConstruct
    constructor(scope: Construct,id: string, props: cdk.StackProps){
        super(scope,id,props)
        // this.uconnectTable = new DBConstruct(this,`UconnectTable`)
        this.schoolAuth = new SchoolAuthConstruct(this,`SchoolAuthConstruct`)
        this.userAuth =  new UserAuthConstruct(this,`UserAuthConstruct`)
        this.statelessapi = new StatelessApiConstruct(this,`StatelessApiConstruct`)
        this.workerAuth =  new WorkerAuthConstruct(this,`WorkerAuthConstruct`)
        
        this.schoolAuthorizers = new SchoolAuthorizerConstruct(this,`SchoolAuthorizerConstruct`,{
            api: this.statelessapi.uconnectApi,
            client: this.schoolAuth.schoolUserPoolClient,
            school_pool: this.schoolAuth.schoolUserPool,
            region: this.region
        })

        this.schoolWorkers = new SchoolWorkerConstruct(this,"SchoolWorkerConstruct",{
            worker_pool: this.workerAuth.workerUserPool,
            worker_pool_region: this.region,
            region: this.region,
            account: this.account,
            api: this.statelessapi.uconnectApi,
            school_authorizer: this.schoolAuthorizers.schoolAuthorizer
        })



        
        this.workerAuth.workerUserPool.grant(this.schoolWorkers.addWorker,"cognito-idp:*")
        this.workerAuth.workerUserPool.grant(this.schoolWorkers.deleteWorker,"cognito-idp:*")
        this.workerAuth.workerUserPool.grant(this.schoolWorkers.getWorkers,"cognito-idp:*")
        this.uconnectSocketApi = new StatefullApiConstruct(this,"UconnectSocketApiConstruct")
        
        this.uconnectSocketAuth = new StatefullAuthConstruct(this,"UconnectSocketAuthConstruct",{
            api: this.uconnectSocketApi.uconnectSocketApi,
            stage: this.uconnectSocketApi.uconnectSocketStage
        })

        this.uconnectSocketLambdas = new StatefullLambdaConstruct(this,"UconnectSocketLambdas",{
            api: this.uconnectSocketApi.uconnectSocketApi,
            stage: this.uconnectSocketApi.uconnectSocketStage,
            authorizer: this.uconnectSocketAuth.connectAuthorizer
        })

        

        
        
    }
}