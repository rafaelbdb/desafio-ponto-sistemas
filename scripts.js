function buscaTodosOsUsuarios() {
    $.ajax({
        type: "POST",
        url: "api.php",
        data: {
            acao: "buscar"
        },
        dataType: "json",
        success: function(response) {
            const usuarios = response['resultado'];
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
                registro.append($("<td>").html(`
                    <button class="btn btn-warning" onclick="alteraUsuario(this)">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                        &nbsp;&nbsp;&nbsp;
                    <button class="btn btn-danger" onclick="removeUsuario(this)">
                        <i class="fa fa-trash"></i>
                    </button>
                `));
                lista.append(registro);
            });
            $('#dados').DataTable();
        }, error: function(xhr, status, error) {
            console.error(`buscaTodosOsUsuarios ==>>`, xhr.status, status, error);
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
        success: function(response) {
            const usuario = response['resultado'];
            console.table(usuario);
            $("#nome").val(usuario.nome);
            $("#idade").val(usuario.idade);
            $("#email").val(usuario.email);
        }, error: function(xhr, status, error) {
            console.error('buscaUsuarioPorId ==>>', xhr.status, status, error);
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
        success: function(response) {
            const usuario = response['resultado'];
            if (!usuario) {
                callback(false);
                return;
            }
            console.table(usuario);
            $("#nome").val(usuario.nome);
            $("#idade").val(usuario.idade);
            $("#email").val(usuario.email);
            callback(true);
        }, error: function(xhr, status, error) {
            console.error('buscaUsuarioPorEmail ==>>', xhr.status, status, error);
            callback(false);
        }
    });
}

function criaUsuario() {
    const nome = $("#nome").val();
    const idade = $("#idade").val();
    const email = $("#email").val();
    console.log(nome, idade, email);
    $.ajax({
        type: "POST",
        url: "api.php",
        data: {
            acao: "criar",
            nome: nome,
            idade: idade,
            email: email
        },
        dataType: 'json',
        success: function(response) {
            const usuarioCriado = response['resultado'];
            console.log(usuarioCriado);
        }, error: function(xhr, status, error) {
            console.error('criaUsuario ==>>', xhr.status, status, error);
        }
    });
}

function alteraUsuario(el) {
    const row = $(el).closest("tr");
    const id = row.find("td:eq(0)").text();
    const nome = row.find("td:eq(1)").text();
    const email = row.find("td:eq(2)").text();
    const idade = row.find("td:eq(3)").text();
    $("#id").val(id);
    $("#nome").val(nome);
    $("#idade").val(idade);
    $("#email").val(email);

    $("button[type='submit']").text("Alterar");
    $("button[type='submit']").removeClass("btn-primary");
    $("button[type='submit']").addClass("btn-warning");
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
        }, error: function(xhr, status, error) {
            console.error('alteraUsuario ==>>', xhr.status, status, error);
        }
    });
}

function removeUsuario(el) {
    const row = $(el).closest("tr");
    const id = row.find("td:eq(0)").text();

    $.ajax({
        type: "DELETE",
        url: `api.php?id=${id}`,
        success: function(response){
            console.warn(response);
        }, error: function(xhr, status, error) {
            console.error('removeUsuario ==>>', xhr.status, status, error);
        }
    })
}

function camposPreenchidos() {
    const name = $("#nome").val();
    const email = $("#email").val();
    const submitButton = $("button[type='submit']").get(0);

    if (name.trim() !== "" && email.trim() !== "") {
        submitButton.classList.remove("btn-secondary");
        submitButton.classList.add("btn-success");
        submitButton.removeAttribute("disabled");
    } else {
        submitButton.classList.remove("btn-success");
        submitButton.classList.add("btn-secondary");
        submitButton.setAttribute("disabled", "true");
    }
}

$(document).ready(function(){
    $("#nome").on("keyup", camposPreenchidos);
    $("#email").on("keyup", camposPreenchidos);
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
    $("button[type='reset']").on("click", function() {
        $("button[type='submit']").text("Criar");
        $("button[type='submit']").removeClass("btn-warning");
        $("button[type='submit']").addClass("btn-primary");
    });
});
