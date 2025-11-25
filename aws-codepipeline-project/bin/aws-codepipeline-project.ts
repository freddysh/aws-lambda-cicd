#!/usr/bin/env node

import { PipelineStack } from '../lib/pipeline-stack';
import { App } from 'aws-cdk-lib/core';

const app = new App();
const environments = ['dev','prod'];
const deployEnviroment = app.node.tryGetContext('env');
if (!deployEnviroment||!environments.includes(deployEnviroment)) {
  throw new Error(`Please supply the env context variable: cdk deploy --context env=dev/prod`);
}
let env = app.node.tryGetContext(deployEnviroment);
const infrastructureRepoName=app.node.tryGetContext('infrastructureRepoName');
const repositoryOwner=app.node.tryGetContext('repositoryOwner');
env={
  ...env, 
  infrastructureRepoName,
  repositoryOwner,
  description:`Stack for the ${deployEnviroment} CI pipeline deployed using
    the CDK. If you to delete this stack, delete the ${deployEnviroment} 
    CDK infrastructure stack first`
  }

new PipelineStack(
  app, 
  `${deployEnviroment}-CI-Pipeline-stack`, 
  env);
