FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install bcrypt
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]