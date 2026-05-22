if (!window.supabase) {
    console.error("Supabase não carregou!");
}

async function INSERT_USER(){            
    let nomeCompleto = document.getElementById("txtnomeCompleto").value;
    let login = document.getElementById("txtUsuario").value;
    let senha = document.getElementById("txtSenha").value;
    let email = document.getElementById("txtEmail").value;
    let status = document.getElementById("rdlStatus").value;
    let msg = document.getElementById("msg");

    const senhaHash = await hashSenha(senha);

    if (!nomeCompleto !== '' && login !== ''){
        const { data, error } = await db
                .from('Usuarios')
                .insert([
                    {
                    nomeCompleto: nomeCompleto,
                    login: login,
                    senha: senhaHash,
                    email: email,
                    status: status
                }
                ]);
        msg.innerHTML = 'Usuário Cadastrado com sucesso!';
        PREENCHE_GRID();
        LIMPAR_FORM();
        return 200;
    } else { 
        msg.innerHTML = 'Preencha os campos obrigatórios!';
        return 400; 
    }
}
document.getElementById("btCadastrar").addEventListener('click',INSERT_USER);

async function UPDATE_USER(){
    let id = document.getElementById("hidId").value;
    let nomeCompleto = document.getElementById("txtnomeCompleto").value;
    let login = document.getElementById("txtUsuario").value;
    let senha = document.getElementById("txtSenha").value;
    let email = document.getElementById("txtEmail").value;
    let status = document.getElementById("rdlStatus").value;
    let msg = document.getElementById("msg");    

    const senhaHash = await hashSenha(senha);

    if (Number(id) > 0){
        const { data, error } = await db
            .from('Usuarios')
            .update(
                {
                    nomeCompleto,
                    login,
                    senha: senhaHash,
                    email,
                    status                    
                })
            .eq('id', id);

        if(error){
            console.error(error);
            msg.innerHTML = 'Erro ao alterar o usuário!';
            return 400;
        }

        msg.innerHTML = 'Usuário alterado com sucesso!';
        PREENCHE_GRID();
        LIMPAR_FORM();

        return 200;        
    } 
}
document.getElementById("btGravar").addEventListener('click', UPDATE_USER);

async function DELETE_USER(){
    let id = document.getElementById("hidId").value;
    let msg = document.getElementById("msg");    
    if (Number(id) > 0){
        const { data, error } = await db
            .from('Usuarios')
            .delete()
            .eq('id', id);
        msg.innerHTML = 'Exclusão Efetuada!';
        PREENCHE_GRID();
         if (document.getElementById("btGravar").hidden === true){
                document.getElementById("btCadastrar").hidden = true;
                document.getElementById("btGravar").hidden = false;
                document.getElementById("btExcluir").hidden = false;
            } else {
                document.getElementById("btCadastrar").hidden = false;
                document.getElementById("btGravar").hidden = true;
                document.getElementById("btExcluir").hidden = true;
            }
        LIMPAR_FORM();
        return 200;        
    } else { 
        msg.innerHTML = 'Error ao Excluir!';
        return 400; 
    }
}
document.getElementById("btExcluir").addEventListener('click', DELETE_USER);

const StrStatus = {    
         1 : 'Ativo' ,
         0 : 'Inativo'
}

async function PREENCHE_GRID() {  

    const inicio = paginaAtual * tamanhoPagina;
    const fim = inicio + tamanhoPagina - 1;

    const textoBusca = document
        .getElementById("txtBusca")
        .value
        .trim();

    let query = db
        .from('Usuarios')
        .select('*', { count: 'exact' })
        .order('nomeCompleto');

    if (textoBusca !== '') {

        query = query.or(
            `nomeCompleto.ilike.%${textoBusca}%,login.ilike.%${textoBusca}%,email.ilike.%${textoBusca}%`
        );
    }

    query = query.range(inicio, fim);

    const { data, error, count } = await query;

    if (error) {
        console.error(error);
        return;
    }

    let linhas = '';

    data.forEach(usuario => {

        linhas += `
            <tr data-id="${usuario.id}">
                <td>${usuario.nomeCompleto}</td>
                <td>${usuario.login}</td>
                <td>${usuario.email}</td>
                <td>${StrStatus[usuario.status]}</td>
            </tr>
        `;
    });

    document.getElementById('GridBody').innerHTML = linhas;

    configurarEventosGrid();

    controlarBotoesPaginacao(count);

    atualizarInfoPagina(count);
}



function configurarEventosGrid(){
    document.querySelectorAll('#GridBody tr').forEach(tr => {
        tr.addEventListener('click', async () => {

            const id = tr.dataset.id;

            const { data, error } = await db
                .from('Usuarios')
                .select('*')
                .eq('id', id)
                .single();

                if (error){
                    console.error(error);
                    return;
                }

                selecionaUsuario(data);
                modoEdicao();
        });
    });
}

 function atualizarInfoPagina(totalRegistros){
    const totalPaginas = Math.ceil(totalRegistros / tamanhoPagina);

    document.getElementById("paginaInfo").innerText = 
        `Página ${paginaAtual + 1} de ${totalPaginas}`;
}

async function proximaPagina() {
    paginaAtual++;
    await PREENCHE_GRID();    
}
document.getElementById("btnProximo").addEventListener('click',proximaPagina);

async function paginaAnterior() {
    if (paginaAtual > 0) {
        paginaAtual--;
        await PREENCHE_GRID();        
    }
}
document.getElementById("btnAnterior").addEventListener('click',paginaAnterior);

function controlarBotoesPaginacao(totalRegistros) {

    const btnProximo = document.getElementById("btnProximo");
    const btnAnterior = document.getElementById("btnAnterior");
 
    const totalPaginas = Math.ceil(totalRegistros / tamanhoPagina);

    btnAnterior.disabled = paginaAtual === 0; 
    btnProximo.disabled = paginaAtual + 1 >= totalPaginas;
}

function modoEdicao() {
    document.getElementById("btCadastrar").hidden = true;
    document.getElementById("btGravar").hidden = false;
    document.getElementById("btExcluir").hidden = false;
}

function modoNovo() {
    document.getElementById("btCadastrar").hidden = false;
    document.getElementById("btGravar").hidden = true;
    document.getElementById("btExcluir").hidden = true;
}

function selecionaUsuario(usuario){
    document.getElementById('txtnomeCompleto').value = usuario.nomeCompleto;
    document.getElementById('txtUsuario').value = usuario.login;
    document.getElementById("txtSenha").value = usuario.senha;
    document.getElementById("txtEmail").value = usuario.email;
    document.getElementById("rdlStatus").value = usuario.status;

    document.getElementById("hidId").value = usuario.id;
}

function Cancelar(){
    LIMPAR_FORM();
}
document.getElementById("btCancelar").addEventListener('click', Cancelar);

function LIMPAR_FORM(){
    document.getElementById('txtnomeCompleto').value = '';
    document.getElementById('txtUsuario').value = '';
    document.getElementById("txtSenha").value = '';
    document.getElementById("txtEmail").value = '';
    document.getElementById("rdlStatus").value = 0;

   modoNovo();
}

    let paginaAtual = 0;
    const tamanhoPagina = 10;

window.onload = () => {
    PREENCHE_GRID(); 
    LIMPAR_FORM();
};

async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

document.getElementById("txtBusca").addEventListener("keyup", async () => {
    paginaAtual = 0;
    await PREENCHE_GRID();
});