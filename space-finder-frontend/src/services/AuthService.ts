import { Amplify } from "aws-amplify";
import { SignInOutput, fetchAuthSession, signIn } from "@aws-amplify/auth";
import { AuthStack } from '../../../space-finder/outputs.json'
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers' 

const awsRegion = 'eu-north-1';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: AuthStack.SpaceUserPoolId,
            userPoolClientId: AuthStack.SpaceUserPoolClientId,
            identityPoolId: AuthStack.SpaceIdentityPoolId
        }
    }
})

export class AuthService{

    private user: SignInOutput | undefined;
    private userName: string | '' = "";
    private jwtToken: string | undefined = "";
    private temporaryCredentials: object | undefined;

    public async isAuthorized(){
        if(this.user){
            return true;
        }

        return false;
    }
    
    public async login(userName: string, password: string) : Promise<object | undefined> {
        
        try{
            const signInResult = await signIn({
                username: userName,
                password: password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH'
                }
            });

            this.user = signInResult;
            this.userName = userName;
            await this.generateIdToken();

            return this.user;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
    
    public async getTemporaryCredentials() {
        if(this.temporaryCredentials){
            return this.temporaryCredentials;
        }   

        this.temporaryCredentials = await this.generateTemporaryCredentials();
        return this.temporaryCredentials;
    }

    private async generateTemporaryCredentials(){
        
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;

        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                clientConfig: {
                    region: awsRegion
                },
                identityPoolId: 'eu-north-1:fe935b75-1259-4deb-b016-56ad0290486b',
                logins:{
                    [cognitoIdentityPool]: this.jwtToken!
                }
            })
        });

        const credentials = await cognitoIdentity.config.credentials();
        return credentials;
    }

    public async generateIdToken(){
        this.jwtToken = (await fetchAuthSession())?.tokens?.idToken?.toString();
    }

    public getIdToken(){
        return this.jwtToken;
    }

    public getUserName(){
        return this.userName;
    }
}