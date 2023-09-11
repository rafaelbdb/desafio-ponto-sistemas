<?php
function parse_ini_file_multi($file) {
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $return = array();

    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $return[trim($key)] = trim($value);
    }

    return $return;
}


$env = parse_ini_file_multi('.env');
//var_dump($env);
$host = $env['DB_HOST'];
$port = $env['DB_PORT'];
$db = $env['DB_NAME'];
$type = $env['DB_TYPE'];
$user = $env['DB_USER'];
$password = $env['DB_PASSWORD'];

$dsn = "$type:host=$host;port=$port;dbname=$db;user=$user;password=$password;";
