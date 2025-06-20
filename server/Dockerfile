FROM node:slim

RUN apt-get update -y \
&& apt-get install -y openssl

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["sh", "./entrypoint.sh"]