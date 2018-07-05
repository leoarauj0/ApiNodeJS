FROM node:8.11.1

ENV HOME=/home/app

COPY package.json package-lock.json npm-shrinkwrap.json $HOME/node_docker/

WORKDIR $HOME/node_docker

RUN npm install --silent --progress=false

COPY . $HOME/node_docker

CMD ["npm", "start"]