export const environment = {
  version: 'v1.2.5',
  production: true,
  recaptchaPublicKey: window["env"]["GOOGLE_RECAPTCHA"] || undefined,
  githubApiClientId: window["env"]["GITHUB_CLIENTID"] || undefined,
  bitbucketApiClientId: window["env"]["BITBUCKET_CLIENTID"] || undefined,
  teamInviteLink: `http://${window["env"]["SM_IP"] || 'localhost'}/collab/join`,
  domainTransferLink: `http://${window["env"]["SM_IP"] || 'localhost'}/domain/transfer`,
  apiUrl: window["env"]["SWITCHERAPI_URL"] || "http://localhost:3000",
  skimmingApi: 'https://dance-0m7.begin.app',
  slackUrl: window["env"]["SWITCHERSLACKAPP_URL"] || undefined,
  docsUrl: 'assets/',
  timeout: 5000
};