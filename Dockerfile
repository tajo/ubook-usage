FROM ubuntu:bionic

# 1. Install node12
RUN apt-get update && apt-get install -y curl && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get install -y nodejs

# 2. Install WebKit dependencies
RUN apt-get install -y libwoff1 \
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
  libvpx5

# 3. Install Chromium dependencies

RUN apt-get install -y libnss3 \
  libxss1 \
  libasound2

# 4. Install Firefox dependencies

RUN apt-get install -y libdbus-glib-1-2 \
  libxt6

# 5. Install ffmpeg to bring in audio and video codecs necessary for playing videos in Firefox.

RUN apt-get install -y ffmpeg

# 6. Add user so we don't need --no-sandbox in Chromium
RUN groupadd -r pwuser && useradd -r -g pwuser -G audio,video pwuser \
  && mkdir -p /home/pwuser/Downloads \
  && mkdir -p /home/pwuser/ubook \
  && mkdir -p /home/pwuser/ubook/artifacts \
  && chown -R pwuser:pwuser /home/pwuser \
  && chmod -R 777 /home/pwuser/ubook/artifacts

# 7. (Optional) Install XVFB if there's a need to run browsers in headful mode
RUN apt-get install -y xvfb

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt update && apt-get install -y yarn

WORKDIR /home/pwuser/ubook
USER pwuser

# Copy manifests and install dependencies.
# Doing this before a build step can more effectively leverage Docker caching.
COPY --chown=pwuser:pwuser package.json yarn.lock /home/pwuser/ubook/
RUN yarn install

# Copy the current files to the docker image.
COPY --chown=pwuser:pwuser . .
RUN yarn ubook:build
#RUN mkdir -p "/ubook/artifacts" && chown -R pwuser:pwuser "/ubook/artifacts"

# Run everything after as non-privileged user.


