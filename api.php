<?php
require_once('conexao.php');

/**
 * Classe API
 *
 * Gerencia as requisições da API
 */
class API
{
    private Conexao $con;
    private PDO $pdo;
    public string $metodo;
    public ?string $acao, $nome, $email;
    public ?int $id, $idade;

    /**
     * Método construtor
     * Inicializa as variáveis de conexão
     *
     * @param string $acao Ação a ser executada
     * @param int $id ID do usuário
     * @param string $nome Nome do usuário
     * @param string $email Email do usuário
     * @param int $idade Idade do usuário
     * @return void
     */
    function __construct()
    {
        $this->metodo = $_SERVER['REQUEST_METHOD'];
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        if ($data) {
            $this->acao = $data->acao ?? null;
            $this->id = $data->id ?? null;
            $this->nome = $data->nome ?? null;
            $this->email = $data->email ?? null;
            $this->idade = $data->idade ?? null;
        }

        if ($this->metodo == 'POST' && !isset($this->acao)) {
            throw new Exception('Ação não informada!', 400);
        }

        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido!', 400);
        }

        if ($this->idade && !is_numeric($this->idade)) {
            throw new Exception('Idade inválida!', 400);
        }

        try {
            $this->con = new Conexao();
            $this->pdo = $this->con->pdo;
        } catch (PDOException $e) {
            throw new Exception('Falha na conexão: ' . $e->getMessage(), 500);
        } catch (Exception $e) {
            throw new Exception('Erro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Função para retornar erros
     *
     * @param string $erro Mensagem de erro
     * @param int $tipo Código do erro
     * @return string JSON com o erro
     */
    public function retornaErro($erro, $tipo = 400)
    {
        http_response_code($tipo);
        if ($this->con) {
            $this->con->fecha();
        }
        return json_encode(['status' => 0, 'erro' => $erro]);
    }

    /**
     * Função para retornar sucesso
     *
     * @param string $resultado Mensagem de sucesso
     * @param int $tipo Código do sucesso
     * @return string JSON com o sucesso
     */
    private function retornaSucesso($resultado, $tipo = 200)
    {
        http_response_code($tipo);
        $this->con->fecha();
        return json_encode(['status' => 1, 'resultado' => $resultado]);
    }

    /**
     * Função para criar um usuário
     *
     * @return string JSON com o resultado da criação
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function criarUsuario()
    {
        $sucesso = false;
        try {
            $original = $this->buscaUsuarioPorEmail();
            $original = json_decode($original, true);
            $email = $original['resultado']['email'] ?? null;
            if ($email) {
                return $this->retornaErro("Erro ao criar usuário: Já existe um usuário com o email '{$email}'");
            }

            $sql = "INSERT INTO usuarios (nome, email";
            $params = [$this->nome, $this->email];

            if ($this->idade) {
                $sql .= ", idade";
                $params[] = $this->idade;
            }

            $sql .= ") VALUES (" . str_repeat("?, ", count($params) - 1) . "?)";

            $stmt = $this->pdo->prepare($sql);
            $sucesso = $stmt->execute($params);
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao criar usuário: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso('Usuário criado com sucesso!', 201) : $this->retornaErro('Erro ao criar usuário: ' . $stmt->errorInfo()[2]);
    }

    /**
     * Função para buscar todos os usuários
     *
     * @return string JSON com os usuários
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function buscarTodosOsUsuarios()
    {
        $sucesso = false;
        try {
            $sql = "SELECT * FROM usuarios";
            $stmt = $this->pdo->query($sql);
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sucesso = count($usuarios) > 0;
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao buscar usuários: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso($usuarios) : $this->retornaErro('Nenhum usuário encontrado!', 404);
    }

    /**
     * Função para buscar um usuário por ID
     *
     * @return string JSON com o usuário
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function buscaUsuarioPorID()
    {
        $sucesso = false;
        try {
            $sql = "SELECT * FROM usuarios WHERE id=?";
            $stmt = $this->pdo->prepare($sql);
            $ex = $stmt->execute([$this->id]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            $sucesso = $ex && $usuario != null;
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao buscar usuário: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso($usuario) : $this->retornaErro('Usuário não encontrado!', 404);
    }

    /**
     * Função para buscar um usuário por email
     *
     * @return string JSON com o usuário
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function buscaUsuarioPorEmail()
    {
        $sucesso = false;
        try {
            $sql = "SELECT * FROM usuarios WHERE email=?";
            $stmt = $this->pdo->prepare($sql);
            $ex = $stmt->execute([$this->email]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            $sucesso = $ex && $usuario != null;
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao buscar usuário: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso($usuario) : $this->retornaErro('Usuário não encontrado!', 404);
    }

    /**
     * Função para alterar um usuário
     *
     * @return string JSON com o resultado da alteração
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function alterarUsuario()
    {
        $sucesso = false;
        try {
            $original = $this->buscaUsuarioPorID();
            $original = json_decode($original, true);
            if (!$original['status']) {
                return $this->retornaErro("Erro ao alterar o usuário: Usuário não encontrado!");
            }
            $sql = "UPDATE usuarios SET nome = ?, idade = ?, email = ? WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $alterado = $stmt->execute([$this->nome, $this->idade, $this->email, $this->id]);
            $sucesso = $alterado && $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao alterar usuário: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso('Usuário alterado com sucesso!') : $this->retornaErro('Erro ao alterar o usuário: ' . $stmt->errorInfo()[2]);
    }

    /**
     * Função para remover um usuário
     *
     * @return string JSON com o resultado da remoção
     * @throws PDOException Se a conexão falhar
     * @throws Exception Se a conexão falhar
     */
    public function removerUsuario()
    {
        $sucesso = false;
        try {
            $original = $this->buscaUsuarioPorID();
            $original = json_decode($original, true);
            if (!$original['status']) {
                return $this->retornaErro("Erro ao remover o usuário: Usuário não encontrado!");
            }
            $sql = "DELETE FROM usuarios WHERE id=?";
            $stmt = $this->pdo->prepare($sql);
            $sucesso = $stmt->execute([$this->id]);
        } catch (Exception $e) {
            return $this->retornaErro('Erro ao remover usuário: ' . $e->getMessage(), 500);
        } finally {
            $this->con->fecha();
        }

        return $sucesso ? $this->retornaSucesso('Usuário removido com sucesso!') : $this->retornaErro('Erro ao remover o usuário: ' . $stmt->errorInfo()[2]);
    }
}

$api = new API();

switch ($api->metodo) {
    case 'DELETE':
        echo isset($_REQUEST['id']) ? $api->removerUsuario() : "ID não informado!";
        break;
    case 'PUT':
    case 'PATCH':
        echo $api->alterarUsuario();
        break;
    case 'POST':
        if (!$api->acao) {
            echo "Ação não informada!";
            break;
        } else {
            switch ($api->acao) {
                case 'criar':
                    echo $api->criarUsuario();
                    break;
                case 'buscar':
                    echo $api->buscarTodosOsUsuarios();
                    break;
                case 'buscarPorEmail':
                    echo $api->buscaUsuarioPorEmail();
                    break;
                case 'buscarPorId':
                    echo $api->buscaUsuarioPorID();
                    break;
                default:
                    echo "Ação inválida!";
                    break;
            }
        }
        break;
    default:
        echo "Método de Requisição inválido!";
        break;
}
