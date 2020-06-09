FROM 027047743804.dkr.ecr.us-west-1.amazonaws.com/web-code-base@sha256:f7e89ce610a9abfd16ca2b478c8930f4d1a147a65094157474d269bbf620e215

RUN apt-get update && apt-get install -y libdbus-glib-1-2 \
  libxt6

WORKDIR /ubook

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY package.json yarn.lock /ubook/
RUN yarn install

# Copy the current files to the docker image.
COPY . .
