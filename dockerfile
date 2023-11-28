FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm build --prod
# EXPOSE 4200
# ENTRYPOINT [ "npm", "run", "start" ]

FROM nginx:alpine
COPY --from=node /app/dist/demo-app /usr/share/nginx/html