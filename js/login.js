
if (!window.supabase) {
    console.error("Supabase não carregou!");
}

async function login() {
    var login = document.getElementById("txtLogin").value;
    var password = document.getElementById("txtPassword").value;
    var msg = document.getElementById("txtMsg");
    var btn = document.getElementById("btnLogin");

    msg.innerText = "";
    btn.disabled = true;

    if (login.trim() !== "" && password.trim() !== "") {

        const usuarioValido = await loginUsuario(login, password);

        if (usuarioValido) {
            sessionStorage.setItem("login", login);
            location.href = 'dashboard.html';
        } else {
            msg.innerText = "Usuário ou senha inválidos";
            btn.disabled = false;
        }

    } else {
        msg.innerText = "Preencha o login e a senha!";
        btn.disabled = false;
    }
}

async function loginUsuario(login, senha) {
    
    const senhaHash = await hashSenha(senha);

    const { data, error } = await db
        .from('Usuarios')
        .select('*')
        .eq('login', login)
        .eq('senha', senhaHash); 

    //console.log("DATA:", data);
    //console.log("ERROR:", error);

    if (error) {
        return false;
    }

    return data.length > 0;
}

function logout() {
    sessionStorage.removeItem("login");
    location.href = "index.html";
}


function recuperaLogin(){
            
    var login = sessionStorage.getItem("login");

    if (login !== '' && login !== null){
        document.getElementById("txtUsuario").innerText ='Bem-Vindo! - ' + login;
    } else {
        location.href = 'index.html';
    }
}

async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}