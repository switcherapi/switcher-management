import { environment_global } from "./environment.global";

export const environment = {
  production: false,
  version: environment_global.version,
  releaseTime: environment_global.releaseTime,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: 'http://localhost:4200/collab/join',
  domainTransferLink: 'http://localhost:4200/domain/transfer',
  apiUrl: 'https://switcherapi.com/api',
  skimmingApi: 'https://dance-0m7-staging.begin.app',
  slackUrl: 'https://slack.switcherapi.com/slack/install',
  docsUrl: 'assets/',
  timeout: environment_global.timeout
};