import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider'

(async () => {
    const client = new CognitoIdentityProviderClient({
        region: process.env.CLIENT_REGION,
    })

    // let user = new AdminCreateUserCommand({
    //     UserPoolId: "ap-south-1_7zmqK3LGA",
    //     Username: "qowruthoasxrtcinlq@nvhrw.com",
    //     DesiredDeliveryMediums: ['EMAIL'],
    //     UserAttributes: [{
    //         Name: 'email_verified',
    //         Value: 'true'
    //     },{
    //         Name: 'email',
    //         Value: 'qowruthoasxrtcinlq@nvhrw.com'
    //     }]
    // })

    
    await client.send(new AdminDeleteUserCommand({
        UserPoolId: "ap-south-1_7zmqK3LGA",
        Username: "qowruthoasxrtcinlq@nvhrw.com",
    }))

    
})()