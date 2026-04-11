#!/usr/bin/env bash
set -e

wait_for_mysql() {
  echo "Waiting for MySQL at ${DB_HOST:-db}:${DB_PORT:-3306}..."
  until php -r '
    $host = getenv("DB_HOST") ?: "db";
    $port = getenv("DB_PORT") ?: "3306";
    $database = getenv("DB_DATABASE") ?: "";
    $username = getenv("DB_USERNAME") ?: "";
    $password = getenv("DB_PASSWORD") ?: "";
    try {
      new PDO("mysql:host={$host};port={$port};dbname={$database}", $username, $password);
    } catch (Throwable $exception) {
      fwrite(STDERR, $exception->getMessage() . PHP_EOL);
      exit(1);
    }
  ' >/dev/null 2>&1; do
    sleep 2
  done
}

if [ "${DB_CONNECTION:-mysql}" = "mysql" ]; then
  wait_for_mysql
fi

APACHE_PORT="${PORT:-10000}"

sed -i "s/Listen 80/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${APACHE_PORT}>/" /etc/apache2/sites-available/000-default.conf
sed -i "s/:80>/:${APACHE_PORT}>/" /etc/apache2/sites-available/default-ssl.conf 2>/dev/null || true

echo "Apache will listen on port ${APACHE_PORT}"
echo "Database-first mode enabled; relying on SQL init files in /docker-entrypoint-initdb.d."

exec "$@"