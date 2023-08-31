set +x

# Add PostgreSQL to sources list
curl -sSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
  && echo 'deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main' $PG_MAJOR > /etc/apt/sources.list.d/pgdg.list

# Install PostgreSQL client and libs
apt-get update -qq && \
  DEBIAN_FRONTEND=noninteractive apt-get install -yq libpq-dev \
  postgresql-client-$PG_MAJOR
