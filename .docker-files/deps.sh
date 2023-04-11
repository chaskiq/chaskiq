set -x

# Install Dependencies
apt-get update -qq \
  && DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
    build-essential \
    gnupg2 \
    curl \
    less \
    git \
    imagemagick \
    zlib1g-dev \ 
    sqlite3 \
    libsqlite3-dev \
    pkg-config \

