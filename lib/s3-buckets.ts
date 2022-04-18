import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

// you'll need to make this file, and don't commit it anywheres...
import { PROJECT_NAME } from '../config/cdk-env-vars'

export class S3BucketStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const staticS3BucketName = `${PROJECT_NAME}-${this.region}-static-assets`

        const staticS3Bucket = new Bucket(this, 'StaticS3Bucket', {
            bucketName: staticS3BucketName,
            removalPolicy: RemovalPolicy.DESTROY,  // this makes restacking way easier; if it has objects, it won't die anyway
            accessControl: BucketAccessControl.PRIVATE,
            encryption: BucketEncryption.S3_MANAGED
        });
        
        const staticS3BucketParam = new StringParameter(this, 'StaticS3BucketParam', {
            stringValue: staticS3BucketName
        })
    }
}