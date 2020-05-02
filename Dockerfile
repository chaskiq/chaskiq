ARG RUBY_VERSION
FROM ruby:$RUBY_VERSION-slim-buster

ARG APP_ENV

ARG PG_MAJOR
ARG NODE_MAJOR
ARG BUNDLER_VERSION
ARG YARN_VERSION

# Copy Installers
RUN mkdir -p /docker-files
COPY .docker-files/ /docker-files
RUN chmod +x /docker-files/*.sh

# Install Dependencies
RUN /docker-files/deps.sh

# Install PostgreSQL
RUN /docker-files/pg.sh

# Install NodeJS, Yarn
RUN /docker-files/node.sh

# Configure bundler
ENV LANG=C.UTF-8 BUNDLE_JOBS=4 BUNDLE_RETRY=3

# Uncomment this line if you want to run binstubs without prefixing with `bin/` or `bundle exec`
# ENV PATH=/app/bin:$BUNDLE_BIN:$PATH

# Upgrade RubyGems and install required Bundler version
RUN gem update --system && \
    gem install bundler:$BUNDLER_VERSION

# Change permissions for GEM_HOME
RUN chmod -R 777 $GEM_HOME

# Add docker user
RUN adduser --disabled-password --gecos "" docker && adduser docker staff

# Create and change app directory permissions
RUN mkdir /usr/src/app
RUN chown -R docker:docker /usr/src/app

# Bundler install gems
WORKDIR /tmp
COPY Gemfile Gemfile.lock /tmp/
RUN bundle install -j ${BUNDLE_JOBS} --retry ${BUNDLE_RETRY}

# Clean up APT when done
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    truncate -s 0 /var/log/*log

# Change user and set workdir
USER docker
WORKDIR /usr/src/app

# Copy app source into container
COPY --chown=docker:docker . /usr/src/app/

# Precompile assets - production only
# Clean up temp files and Yarn cache folder
RUN NODE_ENV=${APP_ENV} NODE_OPTIONS="--max-old-space-size=2048" \
    SECRET_KEY_BASE=`bin/rake secret` RAILS_ENV=${APP_ENV} \
    bundle exec rails assets:precompile \
    && rm -rf /usr/src/app/node_modules /usr/src/app/tmp/cache/* /tmp/* \
    && yarn cache clean

