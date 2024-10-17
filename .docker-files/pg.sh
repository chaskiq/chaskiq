set +x

# Set PG_MAJOR if not set, default to 14
PG_MAJOR=${PG_MAJOR:-14}

# Update the key and source list to use Bullseye
curl -sSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Update the package list and install dependencies
apt-get update -qq && \
  DEBIAN_FRONTEND=noninteractive apt-get install -yq \
  libpq5 \
  libpq-dev \
  postgresql-client-${PG_MAJOR}