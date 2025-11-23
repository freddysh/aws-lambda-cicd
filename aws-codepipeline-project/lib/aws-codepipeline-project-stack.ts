import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

export class AwsCodepipelineProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDKPipeline',
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.gitHub('freddysh/aws-lambda-cicd', 'main', {
          authentication: SecretValue.secretsManager("github-token")
        }),
        commands: [
          'npm install --package-lock-only',
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ],
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_7_0   // Node 20 + npm compatible
        }
      })
    });
  }
}
