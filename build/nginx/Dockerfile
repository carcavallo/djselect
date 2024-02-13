FROM node:21.4-slim as build
WORKDIR /app
RUN npm install
FROM nginx:1.25.3-alpine-slim
ARG ENVIRONMENT
COPY /build/nginx/startup.${ENVIRONMENT}.sh /data/startup.sh
COPY /config/nginx/nginx.conf.${ENVIRONMENT} /data/nginx.conf
RUN apk add npm=9.6.6-r0
RUN chown nginx:nginx /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
CMD ["/bin/sh", "/data/startup.sh"]