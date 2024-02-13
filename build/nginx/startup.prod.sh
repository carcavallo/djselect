#!/bin/sh

cp /data/nginx.conf /etc/nginx/nginx.conf
cd /usr/share/nginx/html || exit

npm run build &
nginx -g 'daemon off;'