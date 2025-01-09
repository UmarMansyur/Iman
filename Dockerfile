FROM node:20.17

WORKDIR /usr/src/app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./

RUN npm install bcrypt --force
RUN npm install --force

COPY . .

# Generate Prisma client for the correct platform
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD npx prisma migrate dev --name init && npm start