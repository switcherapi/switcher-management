import { environment_global } from "./environment.global";

export const environment = {
  production: true,
  version: environment_global.version,
  releaseTime: environment_global.releaseTime,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  allowInternalAuth: environment_global.allowInternalAuth,
  allowHomeView: environment_global.allowHomeView,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: 'https://cloud.switcherapi.com/collab/join',
  domainTransferLink: 'https://cloud.switcherapi.com/domain/transfer',
  apiUrl: 'https://switcherapi.com/api',
  apiSearchDocsUrl: environment_global.apiSearchDocsUrl,
  apiFeatureUrl: environment_global.apiFeatureUrl,
  slackUrl: 'https://slack.switcherapi.com/slack/install',
  docsUrl: 'https://raw.githubusercontent.com/switcherapi/switcher-management/master/src/assets/', 
  timeout: environment_global.timeout
};
