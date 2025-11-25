#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { InfraestructureStack } from '../lib/infraestructure-stack';


const app = new App();
if (!process.env.DEPLOY_ENVIRONMENT) {
  throw new Error('DEPLOY_ENVIRONMENT is not defined.');
}
const {DEPLOY_ENVIRONMENT} = process.env;

new InfraestructureStack(
  app, 
  `${DEPLOY_ENVIRONMENT}-Infraestructure-Stack`, {
  DEPLOY_ENVIRONMENT,
  description: `Stack for the ${DEPLOY_ENVIRONMENT} Infraestructure deployed
  using the CI pipeline. If you need to delete everything involving the ${DEPLOY_ENVIRONMENT}
  environment, delete this stack first, then the CI stack`,
});
