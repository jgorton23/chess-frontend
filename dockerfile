FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=0 /app/dist/frontend /usr/share/nginx/html