<?php
require_once('conexao.php');

try {
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: ".$e->getMessage());
}

function criarUsuario($pdo, $nome, $idade, $email){
    $original = buscaUsuarioPorEmail($pdo, $email);
    if($original != null){
        return json_encode("Erro ao criar usuário: Já existe um usuário com o email '".$original['email']."'");
    }
    $sql = "INSERT INTO usuarios (nome, idade, email) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    return ($stmt->execute([$nome, $idade, $email])) ? json_encode("Usuário criado com sucesso!") : json_encode("Erro ao criar usuário: ".$stmt->errorInfo()[2]);
}

function buscarTodosOsUsuarios($pdo){
    $sql = "SELECT * FROM usuarios";
    $stmt = $pdo->query($sql);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($usuarios);
}

function buscaUsuarioPorID($pdo, $id){
    $sql = "SELECT * FROM usuarios WHERE id=?";
    $stmt = $pdo->prepare($sql);
    return ($stmt->execute([$id]))? json_encode($stmt->fetch(PDO::FETCH_UNIQUE)): null;
}

function buscaUsuarioPorEmail($pdo, $email){
    $sql = "SELECT * FROM usuarios WHERE email=?";
    $stmt = $pdo->prepare($sql);
    return ($stmt->execute([$email]))? json_encode($stmt->fetch(PDO::FETCH_UNIQUE)): null;
}

function alterarUsuario($pdo, $id, $nome, $idade, $email){
    $original = buscaUsuarioPorID($pdo, $id);
    $sql = "UPDATE usuarios SET nome = ?, idade = ?, email = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);

    return ($stmt->execute([$nome, $idade, $email, $id])) ? json_encode("Usuário '".$original['nome']."' alterado com sucesso!") : json_encode("Erro ao alterar usuário '".$original['nome']."': ".$stmt->errorInfo()[2]);
}

function removerUsuario($pdo, $id) {
    $original = buscaUsuarioPorID($pdo, $id);
die(var_dump(json_decode($original)));
    if(!json_decode($original)){
        return json_encode("Erro ao remover o usuário: Usuário não encontrado!");
    }
    $sql = "DELETE FROM usuarios WHERE id=?";
    $stmt = $pdo->prepare($sql);
    return ($stmt->execute([$id])) ? json_encode("Usuário '".$original['nome']."' removido com sucesso!") : json_encode("Erro ao remover o usuário '".$original['nome']."': ".$stmt->errorInfo()[2]);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'DELETE':
        echo (isset($_REQUEST['id'])) ? removerUsuario($pdo, $_REQUEST['id']) : "ID não informado!";
        break;

    case 'PUT':
    case 'PATCH':
        echo alterarUsuario($pdo, $post_vars['id'], $post_vars['nome'], $post_vars['idade'], $post_vars['email']);
        break;

    case 'POST':
        if (!isset($_POST['acao'])) {
            echo "Ação não informada!";
            return false;
        } else {
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
        }
    default:
        echo "Método de Requisição inválido!";
        break;
}

