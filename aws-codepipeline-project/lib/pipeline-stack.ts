import { RemovalPolicy, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { Pipe } from 'stream';
import { CompositePrincipal, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';

interface PipelineStackProps extends StackProps {
  envName: string;
  infrastructureRepoName: string;
  infrastructureBranchName: string;
  repositoryOwner: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    console.log('Creating pipeline stack with props:', props);
    const { 
      envName, 
      infrastructureRepoName, 
      infrastructureBranchName, 
      repositoryOwner 
    } = props;
    const gitHubToken = SecretValue.secretsManager("github-token");
    const infrastructureDeployRole=new Role(
      this, 
      'InfrastructureDeployRole', 
      {
        assumedBy: new CompositePrincipal(
          new ServicePrincipal('codebuild.amazonaws.com'),
          new ServicePrincipal('codepipeline.amazonaws.com'),
      ),
      inlinePolicies: {
        CdkDeployPermissions: new PolicyDocument(
          {
          statements: [
            new PolicyStatement({
              actions: ["sts:AssumeRole"],
              resources: [`arn:aws:iam::*:role/cdk-*`],
            }),
          ],
        }),
      },
  });

  const artifactBucket = new Bucket(
    this, 
    'ArtifactBucket', 
    {
      bucketName: `silvahf-${envName}-codepipeline-artifact-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })  ;
  const infrastructureSourceOutput = new Artifact('InfrastructureSourceOutput');
  const infrastructureBuildProject = new PipelineProject(
    this, 
    'InfrastructureProject', 
    {
      role: infrastructureDeployRole,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      environmentVariables: {
        DEPLOY_ENVIRONMENT: {
          value: envName
        }
      },
      buildSpec:BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '20.x'
            },
            commands: [
              'npm install -g aws-cdk',
              'cd infraestructure',
              'npm install'
            ]
          },
          build: {
            commands: [
              `cdk deploy --context env=${envName}`
            ]
          }
        }
      })
    });
    const pipeline = new Pipeline(
      this,
      'CIPipeline',
      {
        pipelineName: `${envName}-CI-Pipeline`,
        role: infrastructureDeployRole,
        artifactBucket
        }
      );
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'InfrastructureSource',
          owner: repositoryOwner,
          repo: infrastructureRepoName,
          branch: infrastructureBranchName,
          oauthToken: gitHubToken,
          output: infrastructureSourceOutput,
        }),
      ],
    });
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CodeBuildAction({
          actionName: 'DeployCdkInfrastructure',
          project: infrastructureBuildProject,
          input: infrastructureSourceOutput,
          role: infrastructureDeployRole,
        }),
      ],
    });
  }
}
