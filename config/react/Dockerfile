FROM node:16-alpine as build

WORKDIR /app

ARG REACT_APP_API_URL

ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY ./ui/app/package*.json ./

RUN npm install

COPY ./ui/app/ .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY config/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
