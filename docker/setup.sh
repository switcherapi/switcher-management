echo "Applying settings..."
echo "SWITCHERAPI_URL = ${SWITCHERAPI_URL}"
echo "SM_IP = ${SM_IP}"
echo "GOOGLE_RECAPTCHA = ${GOOGLE_RECAPTCHA}"
echo "GITHUB_CLIENTID = ${GITHUB_CLIENTID}"
echo "BITBUCKET_CLIENTID = ${BITBUCKET_CLIENTID}"
echo "SWITCHERSLACKAPP_URL = ${SWITCHERSLACKAPP_URL}"
envsubst < "/usr/share/nginx/html/assets/js/env.template.js" > "/usr/share/nginx/html/assets/js/env.js"
nginx -g 'daemon off;'