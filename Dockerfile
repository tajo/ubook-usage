FROM uber/web-base-image:10.16.0

RUN apt-get update && apt-get install -y libdbus-glib-1-2 \
  libxt6

WORKDIR /ubook

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY package.json yarn.lock /ubook/
RUN yarn install

# Copy the current files to the docker image.
COPY . .
