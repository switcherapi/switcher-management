import { environment_global } from "./environment.global";

export const environment = {
  production: true,
  version: environment_global.version,
  releaseTime: environment_global.releaseTime,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: 'https://cloud.switcherapi.com/collab/join',
  domainTransferLink: 'https://cloud.switcherapi.com/domain/transfer',
  apiUrl: 'https://switcherapi.com/api',
  skimmingApi: 'https://dance-0m7.begin.app',
  slackUrl: 'https://slack.switcherapi.com/slack/install',
  docsUrl: 'https://raw.githubusercontent.com/switcherapi/switcher-management/master/src/assets/', 
  timeout: environment_global.timeout
};
