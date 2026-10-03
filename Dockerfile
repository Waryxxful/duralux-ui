FROM node:22 AS build
WORKDIR /app

# copy only package files first for better caching
COPY package*.json ./
COPY . .

RUN npm ci
# Storybook es el escaparate del design system (la demo Vite queda para desarrollo local).
RUN npm run build-storybook

FROM nginx:stable-alpine
COPY --from=build /app/storybook-static /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
