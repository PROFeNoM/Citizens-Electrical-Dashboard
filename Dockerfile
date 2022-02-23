FROM node:16-alpine
WORKDIR /home/node
COPY /app/ ./
USER node
ENV NODE_ENV=production
EXPOSE 80
CMD node --enable-source-maps build/main.js
