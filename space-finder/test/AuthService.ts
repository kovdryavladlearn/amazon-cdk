import { Amplify } from "aws-amplify"
import { SignInOutput, fetchAuthSession, signIn } from "@aws-amplify/auth"
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity' 
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers' 

const awsRegion = "eu-north-1"

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: "eu-north-1_kbLV4YOTr",
            userPoolClientId: "5oflr7f04h7dq53v6n7id5s84v",
            identityPoolId: "eu-north-1:fe935b75-1259-4deb-b016-56ad0290486b"
        }
    }
})

export class AuthService{

    public async login(userName: string, password: string){
        const signInOutput: SignInOutput = await signIn({
            username: userName,
            password: password,
            options: {
                authFlowType: "USER_PASSWORD_AUTH"
            }
        })

        return signInOutput;
    }

    public async getIdToken(){
        const authSession = await fetchAuthSession();
        return authSession.tokens?.idToken?.toString();
    }

    public async generateTemporaryCredentials(){
        const idToken = await this.getIdToken();

        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/eu-north-1_kbLV4YOTr`;
    
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                identityPoolId: 'eu-north-1:fe935b75-1259-4deb-b016-56ad0290486b',
                logins:{
                    [cognitoIdentityPool]: idToken
                }
            })
        });

        const credentials = await cognitoIdentity.config.credentials();
        return credentials;
    }
}