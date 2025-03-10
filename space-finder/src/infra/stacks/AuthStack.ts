import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';

interface AuthStackProps extends StackProps{
    photosBucket: IBucket
}

export class AuthStack extends Stack{
    
    public userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private identityPool: CfnIdentityPool;
    private authenticatedRole: Role;
    private guestRole: Role;
    private adminRole: Role;

    constructor(scope: Construct, id: string, props: AuthStackProps) {
        super(scope, id, props);

        this.createUserPool();
        this.creteUserPoolClient();
        this.createIdentityPool();
        this.createRoles(props.photosBucket);
        this.attachRoles();
        this.createAdminsGroup();
    }

    private createUserPool(){
        this.userPool = new UserPool(this, "SpaceUserPool", {
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            }
        })

        new CfnOutput(this, "SpaceUserPoolId", {
            value: this.userPool.userPoolId,
        })
    }

    private creteUserPoolClient(){
        this.userPoolClient = this.userPool.addClient("SpaceUserPoolClient", {
            authFlows:{
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }
        });

        new CfnOutput(this, "SpaceUserPoolClientId", {
            value: this.userPoolClient.userPoolClientId,
        })
    }

    private createAdminsGroup(){
        new CfnUserPoolGroup(this, "SpaceAdmins", {
            userPoolId: this.userPool.userPoolId,
            groupName: "admins",
            roleArn: this.adminRole.roleArn
        });
    }

    private createIdentityPool(){
        this.identityPool = new CfnIdentityPool(this, "IdentityPool", {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                    clientId: this.userPoolClient.userPoolClientId,
                    providerName: this.userPool.userPoolProviderName,
                }
            ]
        })

        new CfnOutput(this, "SpaceIdentityPoolId", {
            value: this.identityPool.ref,
        })
    }

    private createRoles(photosBucket: IBucket){
        this.authenticatedRole = new Role(this, "CognitoDefaultAuthentificatedRole", {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });

        this.guestRole = new Role(this, "CognitoDefaultGuestRole", {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });

        this.adminRole = new Role(this, "CognitoAdminRole", {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });

        this.adminRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [photosBucket.bucketArn + '/*']
        }))
    }
    
    private attachRoles(){
        new CfnIdentityPoolRoleAttachment(this, "RolesAttachement", {
            identityPoolId: this.identityPool.ref,
            roles: {
                'authenticated': this.authenticatedRole.roleArn,
                'unauthenticated': this.guestRole.roleArn
            },
            roleMappings: {
                adminsMappings: {
                    type: "Token",
                    ambiguousRoleResolution: "AuthenticatedRole",
                    identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`
                }
            }
        })
    }
}