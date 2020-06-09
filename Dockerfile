FROM node:12.18.0-buster

RUN yarn global add yarn@1.19.1

# Add our xvfb script
RUN apt-get update && apt-get -y install jq libxi-dev libgl1-mesa-dev xvfb
ENV DISPLAY :99

# Install Chrome
RUN apt-get update && apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /src/*.deb \
  && npx node-gyp@4 install

RUN apt-get update && apt-get install -y libwoff1 \
  libopus0 \
  libwebp6 \
  libwebpdemux2 \
  libenchant1c2a \
  libgudev-1.0-0 \
  libsecret-1-0 \
  libhyphen0 \
  libgdk-pixbuf2.0-0 \
  libegl1 \
  libnotify4 \
  libxslt1.1 \
  libevent-2.1-6 \
  libgles2 \
  libvpx5 \
  libjpeg62-turbo

RUN apt-get update && apt-get install -y libdbus-glib-1-2 \
  libxt6

WORKDIR /ubook

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY package.json yarn.lock /ubook/
RUN yarn install

# Copy the current files to the docker image.
COPY . .
