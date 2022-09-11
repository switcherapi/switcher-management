import { environment_global } from "./environment.global";

export const environment = {
  production: true,
  version: environment_global.version,
  releaseTime: environment_global.releaseTime,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: 'https://switcherapi.github.io/switcher-management/collab/join',
  domainTransferLink: 'https://switcherapi.github.io/switcher-management/domain/transfer',
  apiUrl: 'https://switcher-api.herokuapp.com',
  skimmingApi: 'https://dance-0m7.begin.app',
  slackUrl: 'https://switcher-slack-app.herokuapp.com/slack/install',
  docsUrl: 'https://raw.githubusercontent.com/switcherapi/switcher-management/master/src/assets/', 
  timeout: environment_global.timeout
};
