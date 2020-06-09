FROM uber/web-base-image:10.16.0

WORKDIR /ubook

RUN cat /proc/version

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY package.json yarn.lock /ubook/
RUN yarn install

# Copy the current files to the docker image.
COPY . .
