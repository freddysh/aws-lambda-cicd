import * as cdk from 'aws-cdk-lib/core';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class AwsCodepipelineProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDKPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('freddysh/aws-lambda-cicd', 'main', {
          authentication: cdk.SecretValue.secretsManager("github-token")
        }),
        commands: [
          'n 20',    
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      })
    });
  }
}
