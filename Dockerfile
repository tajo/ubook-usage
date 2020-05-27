FROM uber/web-base-image:10.15.2

WORKDIR /ubook

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY package.json yarn.lock /ubook/
RUN yarn --ignore-scripts

# Copy the current files to the docker image.
COPY . .

