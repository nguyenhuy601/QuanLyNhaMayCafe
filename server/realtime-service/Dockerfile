FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Cài cả devDependencies để có nodemon
RUN npm install

COPY . .

EXPOSE 4100

# Sử dụng node làm default, nodemon sẽ được dùng qua command trong docker-compose
CMD ["node", "index.js"]

