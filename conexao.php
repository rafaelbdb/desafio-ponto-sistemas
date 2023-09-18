<?php
declare(strict_types=1);

/**
 * Classe Conexao
 *
 * Gerencia a conexão com o banco de dados
 */
class Conexao {
    private array $env;
    private int $port;
    private string $host, $db, $type, $user, $password;
    public PDO $pdo;
    public string $dsn;

    /**
     * Método construtor
     * Inicializa as variáveis de conexão
     *
     * @return void
     */
    function __construct()
    {
        $this->env = $this->parse_ini_file_multi('.env');
        $this->host = $this->env['DB_HOST'];
        $this->port = $this->env['DB_PORT'];
        $this->db = $this->env['DB_NAME'];
        $this->type = $this->env['DB_TYPE'];
        $this->user = $this->env['DB_USER'];
        $this->password = $this->env['DB_PASSWORD'];
        $this->dsn = "$this->type:host=$this->host;port=$this->port;dbname=$this->db;user=$this->user;password=$this->password;";

        $this->conecta();
    }

    /**
     * Função para ler arquivos .env
     *
     * @param string $file Caminho do arquivo .env
     * @return array Array com as variáveis do arquivo .env
     * @throws Exception Se o arquivo não existir
     */
    private function parse_ini_file_multi($file) {
        try {
            $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $envs = array();

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '=') === false) {
                    continue;
                }

                list($key, $value) = explode('=', $line, 2);
                $envs[trim($key)] = trim($value);
            }

            return $envs;
        } catch (Exception $e) {
            die("Error: ".$e->getMessage());
        }
    }

    /**
     * Função para conectar ao banco de dados
     *
     * @return void
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function conecta(){
        try {
            $this->pdo = new PDO($this->dsn);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Connection failed: ".$e->getMessage());
        }
    }

    /**
     * Função para desconectar do banco de dados
     *
     * @return void
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function fecha(){
        try {
            $this->pdo = null;
        } catch (PDOException $e) {
            die("Connection failed: ".$e->getMessage());
        }
    }
}
