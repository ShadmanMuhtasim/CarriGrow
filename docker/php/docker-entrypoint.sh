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

run_schema_sync_patch() {
  local patch_file="/opt/carrigrow-patches/2026-04-11_schema_sync.sql"

  if [ "${AUTO_SCHEMA_SYNC:-true}" = "false" ]; then
    echo "Schema sync patch skipped (AUTO_SCHEMA_SYNC=false)"
    return
  fi

  if [ ! -f "${patch_file}" ]; then
    echo "Schema sync patch not found at ${patch_file}, skipping"
    return
  fi

  echo "Applying schema sync patch: ${patch_file}"

  if ! PATCH_FILE="${patch_file}" php -r '
    $patchFile = getenv("PATCH_FILE") ?: "";
    if ($patchFile === "" || !is_file($patchFile)) {
      fwrite(STDERR, "Schema sync patch file not found." . PHP_EOL);
      exit(1);
    }

    $sql = file_get_contents($patchFile);
    if ($sql === false) {
      fwrite(STDERR, "Failed to read schema sync patch." . PHP_EOL);
      exit(1);
    }

    $host = getenv("DB_HOST") ?: "db";
    $port = getenv("DB_PORT") ?: "3306";
    $database = getenv("DB_DATABASE") ?: "";
    $username = getenv("DB_USERNAME") ?: "";
    $password = getenv("DB_PASSWORD") ?: "";
    $sslCa = getenv("MYSQL_ATTR_SSL_CA") ?: null;

    $options = [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ];

    if ($sslCa) {
      $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
      if (defined("PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT")) {
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
      }
    }

    $pdo = new PDO(
      "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
      $username,
      $password,
      $options
    );

    $statements = preg_split("/;\\s*(?:\\R|$)/", $sql) ?: [];
    $applied = 0;

    foreach ($statements as $statement) {
      $statement = trim($statement);
      if ($statement === "") {
        continue;
      }

      $pdo->exec($statement);
      $applied++;
    }

    fwrite(STDOUT, "Schema sync statements executed: {$applied}" . PHP_EOL);
  '; then
    echo "Schema sync patch failed; continuing startup without blocking Apache"
  fi
}

if [ "${DB_CONNECTION:-mysql}" = "mysql" ]; then
  wait_for_mysql
  run_schema_sync_patch
fi

APACHE_PORT="${PORT:-10000}"
sed -ri "s/Listen 80/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \\*:80>/<VirtualHost *:${APACHE_PORT}>/" /etc/apache2/sites-available/000-default.conf

echo "MySQL connection OK"
echo "Apache will listen on port ${APACHE_PORT}"

exec "$@"
