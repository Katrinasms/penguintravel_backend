FROM node:22.11-bullseye-slim

WORKDIR /server
COPY package.json ./
RUN npm install
COPY . .
CMD npm start