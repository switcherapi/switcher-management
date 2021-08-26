export const environment = {
  production: true,
  docker: true,
  recaptchaPublicKey: undefined,
  githubApiClientId: undefined,
  bitbucketApiClientId: undefined,
  teamInviteLink: `http://${window["env"]["SM_IP"] || 'localhost'}/collab/join`,
  domainTransferLink: `http://${window["env"]["SM_IP"] || 'localhost'}/domain/transfer`,
  apiUrl: window["env"]["SWITCHERAPI_URL"] || "http://localhost:3000",
  skimmingApi: 'https://dance-0m7.begin.app',
  slackUrl: undefined,
  docsUrl: 'assets/',
  timeout: 5000
};