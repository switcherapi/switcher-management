const writeFile = require('fs');
const targetPath = './src/environments/environment.ts';

require('dotenv').load();

const envConfigFile = `
    export const environment = {
        production: true,
        gitClientId: '${process.env.API_CLIENT_ID}',
        apiUrl: 'https://switcher-load-balance.herokuapp.com',
        skimmingApi: 'https://dance-0m7.begin.app',
        docsUrl: 'https://raw.githubusercontent.com/petruki/switcher-management/master/src/assets/',
        timeout: 5000
    };
`;

writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.ts file generated correctly at ${targetPath}`);
    }
});