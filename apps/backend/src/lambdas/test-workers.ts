import { CognitoIdentityProviderClient, AdminCreateUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'

(async () => {

    const client = new CognitoIdentityProviderClient({
        region: "ap-south-1",
    })

    const workers = await client.send(new ListUsersCommand({
        UserPoolId: "ap-south-1_Or2hc2woU",
        AttributesToGet: ['email','custom:semail'],
        Filter: `cognito:user_status=\"CONFIRMED\"`
    }))

    if(workers.Users){
        console.log(workers.Users[0].Attributes)
    }
    
})()
