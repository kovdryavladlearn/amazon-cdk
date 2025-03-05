import * as cdk from 'aws-cdk-lib';
import { CfnOutput, CfnParameter, Duration } from 'aws-cdk-lib';
import { Bucket, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

class L3Bucket extends Construct{
  constructor(scope: Construct, id: string, expirationInDays: number) {
    super(scope, id);

    new Bucket(this, "MyL3Bucket", {
      lifecycleRules: [{
        expiration: Duration.days(expirationInDays)
      }]
    });
  }
}

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //L1
    new CfnBucket(this, "MyL1Bucket", {
      lifecycleConfiguration: {
        rules: [{
          expirationInDays: 1,
          status: "Enabled"
        }]
      }
    })

    //L2
    const duration = new CfnParameter(this, "duration", {
      default: 6,
      minValue: 1,
      maxValue: 10,
      type: 'Number',
    });

    const myL2Bucket = new Bucket(this, "MyL2Bucket", {
      lifecycleRules: [{
        expiration: Duration.days(duration.valueAsNumber)
      }]
    });

    new CfnOutput(this, "MyL2BucketName", {
      value: myL2Bucket.bucketName
    });

    //L3
    new L3Bucket(this, "MyL3Bucket", 3);
  }
}
