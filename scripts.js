function buscaTodosOsUsuarios() {
    $.ajax({
        type: "POST",
        url: "api.php",
        data: {
            acao: "buscar"
        },
        dataType: "json",
        success: function(usuarios) {
            console.table(usuarios);
            const lista = $("#lista");
            lista.empty();
            $.each(usuarios, function(i, usuario) {
                const registro = $("<tr>");
                registro.append($("<td>").text(usuario.id));
                registro.append($("<td>").text(usuario.nome));
                registro.append($("<td>").text(usuario.email));
                registro.append($("<td>").text(usuario.idade));
                // ações
                registro.append($("<td>").html("<button class='btn btn-warning'><i class='fa-solid fa-pencil' onclick='alteraUsuario()'></i></button>&nbsp;&nbsp;&nbsp;<button class='btn btn-danger'><i class='fa fa-trash' onclick='removeUsuario()'></i></button>"));
                lista.append(registro);
            });
            $('#dados').DataTable();
        }
    });
}

function buscaUsuarioPorId() {
    const id = $("#id").val();
    $.ajax({
        type: "POST",
        url: "api.php",
        data: {
            acao: "buscarPorId",
            id: id
        },
        dataType: "json",
        success: function(usuario) {
            console.table(usuario);
            $("#nome").val(usuario.nome);
            $("#idade").val(usuario.idade);
            $("#email").val(usuario.email);
        }
    });
}

function buscaUsuarioPorEmail(callback) {
    const email = $("#email").val();
    $.ajax({
        type: "POST",
        url: "api.php",
        data: {
            acao: "buscarPorEmail",
            email: email
        },
        dataType: "json",
        success: function(usuario) {
            console.table(usuario);
            $("#nome").val(usuario.nome);
            $("#idade").val(usuario.idade);
            $("#email").val(usuario.email);
            callback(true);
        },
        error: function(status, error) {
            console.error("AJAX Error:", status, error);
            callback(false);
        }
    });
}

function criaUsuario() {
    const nome = $("#nome").val();
    const idade = $("#idade").val();
    const email = $("#email").val();
    $.ajax({
        type: "PUT",
        url: "api.php",
        data: {
            acao: "criar",
            nome: nome,
            idade: idade,
            email: email
        },
        dataType: 'json',
        success: function(usuarioCriado) {
            console.log(usuarioCriado);
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", status, error);
        }
    });
}

function alteraUsuario() {
    const id = $("#id").val();
    const nome = $("#nome").val();
    const idade = $("#idade").val();
    const email = $("#email").val();
    $.ajax({
        type: "PATCH",
        url: "api.php",
        data: {
            acao: "alterar",
            id: id,
            nome: nome,
            idade: idade,
            email: email
        },
        dataType: "json",
        success: function(response) {
            console.warn(response);
        }
    });
}

function removeUsuario() {
    const id = $("#id").val();
    $.ajax({
        type: "DELETE",
        url: `api.php?id=${id}`,
        success: function(response){
            console.error(response);
        }
    })
}

$(document).ready(function(){
    $('#usrForm').submit(function(e){
        e.preventDefault();
        buscaUsuarioPorEmail(function(userExists) {
            if (userExists) {
                alert("Usuário já existe! Ao salvar você irá alterar os dados do usuário.");
                $("button[type='submit']").text("Alterar");
                alteraUsuario();
            } else {
                $("button[type='submit']").text("Criar");
                criaUsuario();
            }
            buscaTodosOsUsuarios();
        });
    });
    buscaTodosOsUsuarios();
});
