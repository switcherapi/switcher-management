import { environment_global } from "./environment.global";

export const environment = {
  version: environment_global.version,
  production: false,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: 'http://localhost:4200/collab/join',
  domainTransferLink: 'http://localhost:4200/domain/transfer',
  apiUrl: 'http://localhost:3000',
  skimmingApi: 'https://dance-0m7-staging.begin.app',
  slackUrl: 'https://switcher-slack-app.herokuapp.com/slack/install',
  docsUrl: 'assets/',
  timeout: environment_global.timeout
};