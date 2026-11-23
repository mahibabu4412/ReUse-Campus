<?php
/**
 * ReUse Campus - Database connection (PDO singleton).
 *
 * Supports two drivers:
 *   - mysql  (default) : local XAMPP / any MySQL host
 *   - pgsql            : Supabase PostgreSQL / any Postgres host
 *
 * Switch with environment variable DB_DRIVER=pgsql and provide a connection
 * string. See .env.example and SUPABASE.md.
 */
require_once __DIR__ . '/config.php';

// ---- Driver selection -------------------------------------------------
define('DB_DRIVER', strtolower(getenv('DB_DRIVER') ?: 'mysql'));

// MySQL defaults (XAMPP)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'reuse_campus');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

/** Return the shared PDO connection. */
function getDB()
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            if (DB_DRIVER === 'pgsql') {
                // Supabase provides a connection string like:
                // postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
                $url = getenv('DATABASE_URL') ?: '';
                if ($url !== '') {
                    $parts = parse_url($url);
                    if (!$parts || empty($parts['host'])) {
                        throw new RuntimeException('Invalid DATABASE_URL.');
                    }
                    $host = $parts['host'];
                    $port = $parts['port'] ?? 5432;
                    $name = ltrim($parts['path'] ?? '', '/') ?: 'postgres';
                    $user = urldecode($parts['user'] ?? 'postgres');
                    $pass = urldecode($parts['pass'] ?? '');
                } else {
                    $host = getenv('PGHOST') ?: 'localhost';
                    $port = getenv('PGPORT') ?: 5432;
                    $name = getenv('PGDATABASE') ?: 'postgres';
                    $user = getenv('PGUSER') ?: 'postgres';
                    $pass = getenv('PGPASSWORD') ?: '';
                }
                $dsn = "pgsql:host={$host};port={$port};dbname={$name};sslmode=require";
                $pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Required so the shared `?` placeholders in this app work with PDO_PGSQL.
                    PDO::ATTR_EMULATE_PREPARES   => true,
                ]);
                $pdo->exec('SET search_path TO public');
            } else {
                $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_PERSISTENT         => false,
                ]);
            }
        } catch (Throwable $ex) {
            http_response_code(500);
            if (ini_get('display_errors')) {
                die('<div style="font-family:sans-serif;padding:2rem;max-width:700px;margin:auto">' .
                    '<h2>Database connection failed</h2><p>' . htmlspecialchars($ex->getMessage()) . '</p>' .
                    '<p>Check <code>config/database.php</code> and your environment variables, then import ' .
                    '<code>database/schema.sql</code> (MySQL) or run <code>supabase db push</code> (Postgres).</p></div>');
            }
            die('Database connection failed.');
        }
    }
    return $pdo;
}

/**
 * Translate the few MySQL-isms used by this app into PostgreSQL syntax.
 * Everything else (prepared statements, LIMIT/OFFSET, aggregates) is portable.
 */
function normalizeSql($sql)
{
    if (DB_DRIVER !== 'pgsql') return $sql;

    // MySQL accepts double quotes as string literals; Postgres treats them as identifiers.
    $sql = preg_replace_callback('/"([^"]*)"/', function ($m) {
        return "'" . str_replace("'", "''", $m[1]) . "'";
    }, $sql);

    // DATE_FORMAT(col,'%Y-%m') -> to_char(col,'YYYY-MM')
    $sql = preg_replace(
        '/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*[\'"]%Y-%m[\'"]\s*\)/i',
        "to_char($1, 'YYYY-MM')",
        $sql
    );

    // DATE_SUB(NOW(), INTERVAL n MONTH) -> now() - interval 'n months'
    $sql = preg_replace(
        '/DATE_SUB\s*\(\s*NOW\s*\(\s*\)\s*,\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/i',
        "now() - interval '$1 months'",
        $sql
    );

    return $sql;
}

/** Execute a prepared statement and return it. */
function db($sql, $params = [])
{
    $stmt = getDB()->prepare(normalizeSql($sql));
    $stmt->execute($params);
    return $stmt;
}

/** Fetch a single row. */
function dbOne($sql, $params = [])
{
    return db($sql, $params)->fetch();
}

/** Fetch all rows. */
function dbAll($sql, $params = [])
{
    return db($sql, $params)->fetchAll();
}

/** Return the last inserted id (works on both MySQL and Postgres identities). */
function dbId()
{
    $pdo = getDB();
    if (DB_DRIVER === 'pgsql') {
        $id = false;
        try { $id = $pdo->lastInsertId(); } catch (Throwable $e) { $id = false; }
        if (!$id) {
            $id = $pdo->query('SELECT lastval()')->fetchColumn();
        }
        return $id;
    }
    return $pdo->lastInsertId();
}
