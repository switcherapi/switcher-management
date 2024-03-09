echo "Applying settings..."

if [[ "$1" != "true" ]]; then
    rm "/etc/nginx/nginx-ssl.conf"
    echo "SSL disabled"
else
    rm "/etc/nginx/nginx-no-ssl.conf"
    echo "SSL enabled"
fi

echo "RELEASE_TIME = ${RELEASE_TIME}"
echo "SWITCHERAPI_URL = ${SWITCHERAPI_URL}"
echo "SM_IP = ${SM_IP}"
echo "GOOGLE_RECAPTCHA = ${GOOGLE_RECAPTCHA}"
echo "ALLOW_INTERNAL_AUTH = ${ALLOW_INTERNAL_AUTH}"
echo "ALLOW_HOME_VIEW = ${ALLOW_HOME_VIEW}"
echo "GITHUB_CLIENTID = ${GITHUB_CLIENTID}"
echo "BITBUCKET_CLIENTID = ${BITBUCKET_CLIENTID}"
echo "SWITCHERSLACKAPP_URL = ${SWITCHERSLACKAPP_URL}"
envsubst < "/usr/share/nginx/html/assets/js/env.template.js" > "/usr/share/nginx/html/assets/js/env.js"
nginx -g 'daemon off;'