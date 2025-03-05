import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { Bucket, BucketAccessControl, HttpMethods, IBucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3';

export class DataStack extends Stack{
    
    public readonly spacesTable: ITable;
    public readonly photosBucket: IBucket;
    
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        this.photosBucket = new Bucket(this, "SpaceFinderPhotos", {
            bucketName: `space-finder-photos-${suffix}`,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }],
            //accessControl: BucketAccessControl.PUBLIC_READ //currentry doesn't work
            blockPublicAccess:{
                blockPublicAcls: false,
                blockPublicPolicy: true,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
                
            },
            objectOwnership: ObjectOwnership.OBJECT_WRITER
        })

        new CfnOutput(this, "SpaceFinderPhotosBucketName", {
            value: this.photosBucket.bucketName
        });

        this.spacesTable = new Table(this, "SpacesTable", {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING
            },
            tableName: `SpaceTable-${suffix}`
        });
    }
}