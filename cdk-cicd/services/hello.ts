async function handler (enent: any, context: any){
    return {
        statusCode: 200,
        body: "Hello!"
    };
}

export {handler}