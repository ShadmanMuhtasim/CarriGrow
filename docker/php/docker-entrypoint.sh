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
    $sslCa = getenv("MYSQL_ATTR_SSL_CA") ?: null;

    $options = [];
    if ($sslCa) {
      $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
      if (defined("PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT")) {
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
      }
    }

    try {
      new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        $options
      );
    } catch (Throwable $e) {
      fwrite(STDERR, $e->getMessage() . PHP_EOL);
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
sed -ri "s/Listen 80/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \\*:80>/<VirtualHost *:${APACHE_PORT}>/" /etc/apache2/sites-available/000-default.conf

echo "MySQL connection OK"
echo "Apache will listen on port ${APACHE_PORT}"

exec "$@"