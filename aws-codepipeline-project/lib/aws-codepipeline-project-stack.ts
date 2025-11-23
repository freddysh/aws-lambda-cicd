import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class AwsCodepipelineProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDKPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('freddysh/aws-lambda-cicd', 'main', {
          authentication: SecretValue.secretsManager("github-token")
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      })
    });
  }
}
