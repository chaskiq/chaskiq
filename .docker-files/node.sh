set -x

# Add NodeJS to sources list
curl -sL https://deb.nodesource.com/setup_$NODE_MAJOR.x | bash -

# Add Yarn to the sources list
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo 'deb http://dl.yarnpkg.com/debian/ stable main' > /etc/apt/sources.list.d/yarn.list

# Install NodeJS, Yarn
apt-get update -qq && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq nodejs \
    yarn=$YARN_VERSION-1
