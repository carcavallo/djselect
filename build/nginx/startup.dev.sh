#!/bin/sh

cp /data/nginx.conf /etc/nginx/nginx.conf
cd /usr/share/nginx/html || exit

npm start &
nginx -g 'daemon off;'