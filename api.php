<?php
require_once('conexao.php');

try {
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: ".$e->getMessage());
}

function criarUsuario($pdo, $nome, $email, $idade = null){
    try {
        $original = buscaUsuarioPorEmail($pdo, $email);
        if($original != null){
            return json_encode("Erro ao criar usuário: Já existe um usuário com o email '".$original['email']."'");
        }

        $sql = "INSERT INTO usuarios (nome, email";
        $params = [$nome, $email];

        if ($idade !== null) {
            $sql .= ", idade";
            $params[] = $idade;
        }

        $sql .= ") VALUES (".str_repeat("?, ", count($params) - 1)."?)";
        
        $stmt = $pdo->prepare($sql);

        return ($stmt->execute($params)) ? json_encode("Usuário criado com sucesso!") : json_encode("Erro ao criar usuário: ".$stmt->errorInfo()[2]);
    } catch (Exception $e) {
        return json_encode("Erro ao criar usuário: ".$e->getMessage());
    }
}

function buscarTodosOsUsuarios($pdo){
    try {
        $sql = "SELECT * FROM usuarios";
        $stmt = $pdo->query($sql);
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($usuarios);
    } catch (Exception $e) {
        return json_encode("Erro ao buscar usuários: ".$e->getMessage());
    }
}

function buscaUsuarioPorID($pdo, $id){
    try {
        $sql = "SELECT * FROM usuarios WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $ex = $stmt->execute([$id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        return $ex ? $usuario : null;
    } catch (Exception $e) {
        return json_encode("Erro ao buscar usuário: ".$e->getMessage());
    }
}

function buscaUsuarioPorEmail($pdo, $email){
    try {
        $sql = "SELECT * FROM usuarios WHERE email=?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$email]) ? json_encode($stmt->fetch(PDO::FETCH_ASSOC)): null;
    } catch (Exception $e) {
        return json_encode("Erro ao buscar usuário: ".$e->getMessage());
    }
}

function alterarUsuario($pdo, $id, $nome, $idade, $email){
    try {
        $original = buscaUsuarioPorID($pdo, $id);
        $sql = "UPDATE usuarios SET nome = ?, idade = ?, email = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);

        return $stmt->execute([$nome, $idade, $email, $id]) ? json_encode("Usuário '".$original['nome']."' alterado com sucesso!") : json_encode("Erro ao alterar usuário '".$original['nome']."': ".$stmt->errorInfo()[2]);
    } catch (Exception $e) {
        return json_encode("Erro ao alterar usuário: ".$e->getMessage());
    }
}

function removerUsuario($pdo, $id) {
    try {
        $original = buscaUsuarioPorID($pdo, $id);
        if(!json_decode($original)){
            return json_encode("Erro ao remover o usuário: Usuário não encontrado!");
        }
        $sql = "DELETE FROM usuarios WHERE id=?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$id]) ? json_encode("Usuário '".$original['nome']."' removido com sucesso!") : json_encode("Erro ao remover o usuário '".$original['nome']."': ".$stmt->errorInfo()[2]);
    } catch (Exception $e) {
        return json_encode("Erro ao remover o usuário: ".$e->getMessage());
    }
}

switch ($_SERVER['REQUEST_METHOD']) {
case 'DELETE':
    echo isset($_REQUEST['id']) ? removerUsuario($pdo, $_REQUEST['id']) : "ID não informado!";
    break;

case 'PUT':
case 'PATCH':
    echo alterarUsuario($pdo, $_REQUEST['id'], $_REQUEST['nome'], $_REQUEST['idade'], $_REQUEST['email']);
    break;

case 'POST':
    if (!isset($_POST['acao'])) {
        echo "Ação não informada!";
        break;
        }
        switch ($_POST['acao']) {
        case 'criar':
            echo criarUsuario($pdo, $_POST['nome'], $_POST['idade'], $_POST['email']);
            break;
        case 'buscar':
            echo buscarTodosOsUsuarios($pdo);
            break;
        case 'buscarPorEmail':
            echo buscaUsuarioPorEmail($pdo, $_POST['email']);
            break;
        case 'buscarPorId':
            echo buscaUsuarioPorID($pdo, $_POST['id']);
            break;
        default:
            echo "Ação inválida!";
            break;
        }
        break;
default:
    echo "Método de Requisição inválido!";
    break;
}

