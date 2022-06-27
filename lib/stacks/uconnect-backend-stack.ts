import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { StatelessApi } from '../custom-constructs/stateless-api'
import { UconnectTable } from '../custom-constructs/uconnect-table'
import { StatefullApi } from '../custom-constructs/statefull-api'
import { UserPools } from '../custom-constructs/user-pools'
import { SchoolAuthTriggers } from '../custom-constructs/school-auth-triggers'
import { UserAuthTriggers } from '../custom-constructs/user-auth-triggers'
import {CustomAuthorizers} from '../custom-constructs/custom-authorizers'
import { CommonRoutesStateless } from '../custom-constructs/common-routes-stateless'
import { SchoolRoutes } from '../custom-constructs/school-routes'
import {WorkerAuthTriggers} from '../custom-constructs/worker-auth-triggers'
import * as iam from 'aws-cdk-lib/aws-iam'

export default class UconnectBackendStack extends cdk.Stack {
    uconnectStatelessapi: StatelessApi;
    uconnectTable: UconnectTable;
    userPools: UserPools
    uconnectStatefullApi: StatefullApi;
    schoolAuthTriggers: SchoolAuthTriggers;
    userAuthTriggers: UserAuthTriggers;
    customAuthorizers: CustomAuthorizers;
    commonRoutesStateless: CommonRoutesStateless;
    schoolRoutes: SchoolRoutes;
    workerAuthTriggers: WorkerAuthTriggers
    
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props)
        this.uconnectTable = new UconnectTable(this, `UconnectTable`)
        this.uconnectStatelessapi = new StatelessApi(this, `UconnectStatelessApi`)
        
        
        this.schoolAuthTriggers = new SchoolAuthTriggers(this,"SchoolAuthTriggers",{
            table: this.uconnectTable.uconnectTable,
            
        })
        
        this.userAuthTriggers = new UserAuthTriggers(this,"UserAuthTriggers",{
            table: this.uconnectTable.uconnectTable,
        })

        this.workerAuthTriggers = new WorkerAuthTriggers(this,"WorkerAuthTriggers",{
            table: this.uconnectTable.uconnectTable
        })
        this.userPools = new UserPools(this, 'UserPools')

        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolAuthTriggers.preSignUpTrigger)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolAuthTriggers.preAuthTrigger)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolAuthTriggers.postConfirmTrigger) 

        this.uconnectTable.uconnectTable.grantReadWriteData(this.userAuthTriggers.preSignUpTrigger)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.userAuthTriggers.preAuthTrigger)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.userAuthTriggers.postConfirmTrigger)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.workerAuthTriggers.postAuthTrigger)
        
        this.userPools.schoolUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.PRE_SIGN_UP,this.schoolAuthTriggers.preSignUpTrigger)
        this.userPools.schoolUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.POST_CONFIRMATION,this.schoolAuthTriggers.postConfirmTrigger)
        this.userPools.schoolUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.PRE_AUTHENTICATION,this.schoolAuthTriggers.preAuthTrigger)
        this.userPools.userUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.PRE_SIGN_UP,this.userAuthTriggers.preSignUpTrigger)
        this.userPools.userUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.POST_CONFIRMATION,this.userAuthTriggers.postConfirmTrigger)
        this.userPools.userUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.PRE_AUTHENTICATION,this.userAuthTriggers.preAuthTrigger)

        this.userPools.workerUserPool.addTrigger(cdk.aws_cognito.UserPoolOperation.POST_AUTHENTICATION,this.workerAuthTriggers.postAuthTrigger)

        this.customAuthorizers = new CustomAuthorizers(this,"Authorizers",{
            api: this.uconnectStatelessapi.uconnectApi,
            user_pool: this.userPools.userUserPool,
            school_pool: this.userPools.schoolUserPool,
            worker_pool: this.userPools.workerUserPool,
            user_pool_client: this.userPools.userUserPoolClient,
            school_pool_client: this.userPools.schoolUserPoolClient,
            worker_pool_client: this.userPools.workerUserPoolClient,
            table: this.uconnectTable.uconnectTable
        })


        this.commonRoutesStateless= new CommonRoutesStateless(this,"CommonRoutesStateless",{
            api: this.uconnectStatelessapi.uconnectApi,
            table: this.uconnectTable.uconnectTable,
            authorizer: this.customAuthorizers.customAuthorizer
        })


        this.schoolRoutes = new SchoolRoutes(this,"SchoolRoutes",{
            table: this.uconnectTable.uconnectTable,
            api: this.uconnectStatelessapi.uconnectApi,
            school_pool: this.userPools.schoolUserPool,
            school_pool_client: this.userPools.schoolUserPoolClient,
            worker_pool: this.userPools.workerUserPool
        })

        this.userPools.workerUserPool.grant(this.schoolRoutes.addWorker,'cognito-idp:*')
        this.uconnectTable.uconnectTable.grantReadWriteData(this.commonRoutesStateless.getTokenFunction)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.commonRoutesStateless.getSchools)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolRoutes.addWorker)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolRoutes.deleteWorker)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.schoolRoutes.getWorkers)

        this.uconnectStatefullApi = new StatefullApi(this, "UconnectStatefullApi",{
            table: this.uconnectTable.uconnectTable
        })

        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.customAuthorizerFunctionStatefull)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.connectFunction)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.disconnectFunction)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.sendMessageFunction)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.getThreadsFunction)
        this.uconnectTable.uconnectTable.grantReadWriteData(this.uconnectStatefullApi.terminateThreadFunction)
        
        
    }
}
