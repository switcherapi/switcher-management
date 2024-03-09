import { environment_global } from "./environment.global";

const getEnv = (key: string, defaultValue?: string | boolean) => {
  const value = window["env"][key];
  if (value === undefined || value === "") {
    return defaultValue;
  }

  if (typeof defaultValue === "boolean") {
    return value === "true";
  }

  return value;
}

export const environment = {
  production: true,
  version: environment_global.version,
  releaseTime: getEnv("RELEASE_TIME"),
  recaptchaPublicKey: getEnv("GOOGLE_RECAPTCHA"),
  allowInternalAuth: getEnv("ALLOW_INTERNAL_AUTH", environment_global.allowInternalAuth),
  allowHomeView: getEnv("ALLOW_HOME_VIEW", environment_global.allowHomeView),
  githubApiClientId: getEnv("GITHUB_CLIENTID"),
  bitbucketApiClientId: getEnv("BITBUCKET_CLIENTID"),
  teamInviteLink: `${getEnv('SM_IP', 'localhost')}/collab/join`,
  domainTransferLink: `${getEnv('SM_IP', 'localhost')}/domain/transfer`,
  apiUrl: getEnv('SWITCHERAPI_URL', 'http://localhost:3000'),
  apiSearchDocsUrl: environment_global.apiSearchDocsUrl,
  apiFeatureUrl: environment_global.apiFeatureUrl,
  slackUrl: getEnv('SWITCHERSLACKAPP_URL'),
  docsUrl: 'assets/',
  timeout: 5000
};