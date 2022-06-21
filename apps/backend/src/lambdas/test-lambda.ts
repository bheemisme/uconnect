import { APIGatewayProxyEventV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2 } from 'aws-lambda'
export async function handler(event: any, context: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> {

        console.log(context)
        console.log(event)
        console.log(event.requestContext.authorizer.jwt.claims)
        return {
            body: JSON.stringify({ "message": "Succesfull request" }),
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            }
        }
}