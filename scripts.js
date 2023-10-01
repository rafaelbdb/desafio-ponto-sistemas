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
                    const dataNascimento = moment(usuario.nascimento).locale('pt-br').format('DD/MM/YYYY');

                    const registro = $("<tr>");
                    registro.append($("<td>").text(usuario.id));
                    registro.append($("<td>").text(usuario.nome));
                    registro.append($("<td>").text(dataNascimento));
                    registro.append($("<td>").text(usuario.email));

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
                $("#lista").html("<tr><td colspan='5'>Nenhum usuário cadastrado</td></tr>");
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
                $("#nascimento").val(usuario.nascimento);
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
                callback(usuario);
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
        const nascimento = $("#nascimento").val();
        const email = $("#email").val();
        console.log(nome, nascimento, email);
        const data = {
            acao: "criar",
            nome: nome,
            nascimento: nascimento,
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
        const nascimento = row.find("td:eq(2)").text();
        const email = row.find("td:eq(3)").text();
        const dataFormatada = moment(nascimento, 'DD/MM/YYYY').format('YYYY-MM-DD');

        $("#usrid").val(id);
        $("#nome").val(nome);
        $("#nascimento").val(dataFormatada);
        $("#email").val(email);

        $("#enviar").text("Alterar");
        $("#enviar").removeClass("btn-outline-success");
        $("#enviar").addClass("btn-outline-warning");
    } catch (error) {
        console.error("editaUsuario ==>>", error);
        throw new Error(error);
    }
}

function alteraUsuario(confirma) {
    try {
        if (!confirma) return;
        const id = $("#usrid").val();
        const nome = $("#nome").val();
        const nascimento = $("#nascimento").val();
        const email = $("#email").val();
        const data = {
            id: id,
            nome: nome,
            nascimento: nascimento,
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
        const nome = $(el).closest("tr").find('td:nth-child(2)').text().trim();
        $.confirm({
            title: 'Remover Usuário',
            content: `Confirma REMOVER usuário '${nome}'?`,
            buttons: {
                confirm: {
                    text: 'Sim',
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: function () {
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
                    }
                },
                cancel: {
                    text: 'Não',
                    btnClass: 'btn-danger',
                    keys: ['esc'],
                    action: function () {
                        console.error('Cancelado!');
                    }
                }
            }
        });
    } catch (error) {
        console.error("removeUsuario ==>>", error);
        throw new Error(error);
    }
}

function removeClassesBtnEnviar() {
    try {
        $('#enviar').removeClass(function (index, className) {
            return (className.match(/\S+/g) || []).filter(function (cls) {
                return cls.startsWith('btn-');
            }).join(' ');
        });
        $('#enviar').removeClass("disabled");
    } catch (error) {
        console.error("removeClasses ==>>", error);
        throw new Error(error);
    }
}

function camposPreenchidos() {
    try {
        const name = $("#nome").val();
        const email = $("#email").val();
        const tipo = $('#enviar').innerText;
        const color = (tipo === "Criar") ? "success" : "warning";
        if (name.trim() !== "" && email.trim() !== "") {
            removeClassesBtnEnviar();
            $('#enviar').addClass(`btn-${color}`);
        } else {
            removeClassesBtnEnviar();
            $('#enviar').addClass(`btn-outline-${color}`);
            $('#enviar').addClass("disabled");
        }
    } catch (error) {
        console.error("camposPreenchidos ==>>", error);
        throw new Error(error);
    }
}

$(document).ready(function () {
    $("#nome").on("keyup", camposPreenchidos);
    $("#email").on("keyup", camposPreenchidos);
    buscaTodosOsUsuarios();
    $("#limpar").on("click", function () {
        $("#enviar").text("Criar");
        removeClassesBtnEnviar();
        $("#enviar").addClass("btn-outline-success");
        $("#enviar").addClass("disabled");
    });
    $('#usrForm').submit(function (e) {
        e.preventDefault();
        buscaUsuarioPorEmail(function (usuario) {
            if (usuario !== false && $("#enviar").text() === "Alterar") {
                $.confirm({
                    title: 'Editar Usuário',
                    content: `Confirma novos dados do usuário '${usuario.nome}'?`,
                    buttons: {
                        confirm: {
                            text: 'Sim',
                            btnClass: 'btn-primary',
                            keys: ['enter'],
                            action: function () {
                                alteraUsuario(true);
                            }
                        },
                        cancel: {
                            text: 'Não',
                            btnClass: 'btn-danger',
                            keys: ['esc'],
                            action: function () {
                                console.error('Cancelado!');
                            }
                        }
                    }
                });
            } else {
                criaUsuario();
            }
        });
    });
});