import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy, Stack,StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface InfraestructureStackProps extends StackProps {
  DEPLOY_ENVIRONMENT: string;
} 
export class InfraestructureStack extends Stack {
  constructor(scope: Construct, id: string, props: InfraestructureStackProps) {
    super(scope, id, props);
    const {DEPLOY_ENVIRONMENT} = props;
    console.log(`${DEPLOY_ENVIRONMENT} Deploying Infraestructure Stack for environment: ${DEPLOY_ENVIRONMENT}`);
    const infrastructureBucket=new Bucket(
      this,
      `InfrastructureBucket`,{
      bucketName:`silvahf-${DEPLOY_ENVIRONMENT}-infrastructure-bucket`,
      removalPolicy:RemovalPolicy.DESTROY,
    });

  }
}
