
export async function handler(event: any,context: any): Promise<any>{
    console.log(event)
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            'msg': "sucesfully connected"
        }),
        headers: {
            'content-type': 'application/json',
            'sec-websocket-protocol': 'school'
        }
    };
};
