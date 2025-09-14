import { environment_global } from "./environment.global";

export const environment = {
  production: false,
  version: environment_global.version,
  releaseTime: environment_global.releaseTime,
  recaptchaPublicKey: environment_global.recaptchaPublicKey,
  githubApiClientId: environment_global.githubApiClientId,
  allowInternalAuth: environment_global.allowInternalAuth,
  allowSamlAuth: environment_global.allowSamlAuth,
  allowHomeView: environment_global.allowHomeView,
  bitbucketApiClientId: environment_global.bitbucketApiClientId,
  teamInviteLink: environment_global.teamInviteLink,
  domainTransferLink: environment_global.domainTransferLink,
  apiUrl: environment_global.apiUrl,
  apiSearchDocsUrl: environment_global.apiSearchDocsUrl,
  apiFeatureUrl: environment_global.apiFeatureUrl,
  slackUrl: environment_global.slackUrl,
  timeout: environment_global.timeout,
  docsUrl: 'assets/',
};