echo "Applying settings..."
echo "SWITCHERAPI_URL = ${SWITCHERAPI_URL}"
echo "SM_IP = ${SM_IP}"
envsubst < "/usr/share/nginx/html/assets/js/env.template.js" > "/usr/share/nginx/html/assets/js/env.js"
nginx -g 'daemon off;'