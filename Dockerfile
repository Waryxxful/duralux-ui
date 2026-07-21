FROM node:22 AS build
WORKDIR /app

# copy only package files first for better caching
COPY package*.json ./
COPY . .

RUN npm ci
RUN npx vite build --config demo/vite.config.js

FROM nginx:stable-alpine
COPY --from=build /app/demo/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
