function buscaTodosOsUsuarios() {
    try {
        const data = {
            acao: "buscar"
        };

        $.ajax({
            type: "POST",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                const usuarios = response.resultado;
                console.table(usuarios);
                const lista = $("#lista");
                lista.empty();
                $.each(usuarios, function (i, usuario) {
                    const registro = $("<tr>");
                    registro.append($("<td>").text(usuario.id));
                    registro.append($("<td>").text(usuario.nome));
                    registro.append($("<td>").text(usuario.email));
                    registro.append($("<td>").text(usuario.idade));
                    // ações
                    registro.append($("<td>").html(`
                    <button class="btn btn-warning" onclick="editaUsuario(this)">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                        &nbsp;&nbsp;&nbsp;
                    <button class="btn btn-danger" onclick="removeUsuario(this)">
                        <i class="fa fa-trash"></i>
                    </button>
                `));
                    lista.append(registro);
                });
                $('#dados').DataTable({
                    "processing": true,
                    "language": {
                        "processing": '<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>',
                        "url": "//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json",
                    },
                });
            }, error: function (xhr, status, error) {
                console.error(`buscaTodosOsUsuarios ==>>`, xhr.status, status, error);
            }
        });
    } catch (error) {
        console.error("buscaTodosOsUsuarios ==>>", error);
        throw new Error(error);
    }
}

function buscaUsuarioPorId() {
    try {
        const id = $("#id").val();
        const data = {
            acao: "buscarPorId",
            id: id
        };
        $.ajax({
            type: "POST",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                const usuario = response.resultado;
                console.table(usuario);
                $("#nome").val(usuario.nome);
                $("#idade").val(usuario.idade);
                $("#email").val(usuario.email);
            }, error: function (xhr, status, error) {
                console.error('buscaUsuarioPorId ==>>', xhr.status, status, error);
            }
        });
    } catch (error) {
        console.error("buscaUsuarioPorId ==>>", error);
        throw new Error(error);
    }
}

function buscaUsuarioPorEmail(callback) {
    try {
        const email = $("#email").val();
        const data = {
            acao: "buscarPorEmail",
            email: email
        };
        $.ajax({
            type: "POST",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                const usuario = response.resultado;
                if (!usuario) {
                    callback(false);
                    return;
                }
                console.table(usuario);
                $("#nome").val(usuario.nome);
                $("#idade").val(usuario.idade);
                $("#email").val(usuario.email);
                callback(true);
            }, error: function (xhr, status, error) {
                console.error('buscaUsuarioPorEmail ==>>', xhr.status, status, error);
                callback(false);
            }
        });
    } catch (error) {
        console.error("buscaUsuarioPorEmail ==>>", error);
        throw new Error(error);
    }
}

function criaUsuario() {
    try {
        const nome = $("#nome").val();
        const idade = $("#idade").val();
        const email = $("#email").val();
        console.log(nome, idade, email);
        const data = {
            acao: "criar",
            nome: nome,
            idade: idade,
            email: email
        };
        $.ajax({
            type: "POST",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: 'json',
            success: function (response) {
                const usuarioCriado = response.resultado;
                console.log(usuarioCriado);
                window.location.reload();
            }, error: function (xhr, status, error) {
                console.error('criaUsuario ==>>', xhr.status, status, error);
            }
        });
    } catch (error) {
        console.error("criaUsuario ==>>", error);
        throw new Error(error);
    }
}

function editaUsuario(el) {
    try {
        const row = $(el).closest("tr");
        const id = row.find("td:eq(0)").text();
        const nome = row.find("td:eq(1)").text();
        const email = row.find("td:eq(2)").text();
        const idade = row.find("td:eq(3)").text();
        $("#usrid").val(id);
        $("#nome").val(nome);
        $("#idade").val(idade);
        $("#email").val(email);

        $("button[type='submit']").text("Alterar");
        $("button[type='submit']").attr("onclick", `alteraUsuario()`);
        $("button[type='submit']").removeClass("btn-outline-success");
        $("button[type='submit']").addClass("btn-outline-warning");
    } catch (error) {
        console.error("editaUsuario ==>>", error);
        throw new Error(error);
    }
}

function alteraUsuario() {
    try {
        const id = $("#usrid").val();
        const nome = $("#nome").val();
        const idade = $("#idade").val();
        const email = $("#email").val();
        const data = {
            id: id,
            nome: nome,
            idade: idade,
            email: email
        };

        $.ajax({
            type: "PATCH",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.warn(response.resultado);
                window.location.reload();
            }, error: function (xhr, status, error) {
                console.error('alteraUsuario ==>>', xhr.status, status, error);
            }
        });
    } catch (error) {
        console.error("alteraUsuario ==>>", error);
        throw new Error(error);
    }
}

function removeUsuario(el) {
    try {
        const id = $(el).closest("tr").find('td:first-child').text().trim();
        console.info("removeUsuario ==>>", id);
        const data = {
            id: id
        };

        $.ajax({
            type: "DELETE",
            url: "api.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.warn(response.resultado);
                window.location.reload();
            }, error: function (xhr, status, error) {
                console.error('removeUsuario ==>>', xhr.status, status, error);
            }
        })
    } catch (error) {
        console.error("removeUsuario ==>>", error);
        throw new Error(error);
    }
}

function camposPreenchidos() {
    try {
        const name = $("#nome").val();
        const email = $("#email").val();
        const submitButton = $("button[type='submit']").get(0);
        const color = (submitButton.innerText === "Criar") ? "success" : "warning";
        if (name.trim() !== "" && email.trim() !== "") {
            submitButton.classList.remove(`btn-outline-${color}`);
            submitButton.classList.remove("disabled");
            submitButton.classList.add(`btn-${color}`);
        } else {
            submitButton.classList.remove(`btn-${color}`);
            submitButton.classList.add(`btn-outline-${color}`);
            submitButton.classList.add("disabled");
        }
    } catch (error) {
        console.error("camposPreenchidos ==>>", error);
        throw new Error(error);
    }
}

$(document).ready(function () {
    $("#nome").on("keyup", camposPreenchidos);
    $("#email").on("keyup", camposPreenchidos);
    $('#usrForm').submit(function (e) {
        e.preventDefault();
        buscaUsuarioPorEmail(function (userExists) {
            if (userExists && $("button[type='submit']").text() === "Alterar") {
                if (confirm("Confirma novos dados do usuário?") === true) {
                    alteraUsuario(e);
                }
            } else {
                criaUsuario();
            }
            window.location.reload();
        });
    });
    buscaTodosOsUsuarios();
    $("button[type='reset']").on("click", function () {
        $("button[type='submit']").text("Criar");
        $("button[type='submit']").removeClass("btn-warning");
        $("button[type='submit']").addClass("btn-primary");
    });
});
