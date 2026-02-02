let funcionarios = [];
let empresas = [];
let editId = null;
let paginaAtual = 1;
const itensPorPagina = 7;


/* ---------- FORMATOS ---------- */
function formatarCPF(input){
  let v = input.value.replace(/\D/g,'');
  v=v.replace(/(\d{3})(\d)/,'$1.$2');
  v=v.replace(/(\d{3})(\d)/,'$1.$2');
  v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  input.value=v.toUpperCase();
}

function formatarMaiusculo(input){
  input.value = input.value.toUpperCase();
}

function formatarSalario(input){
  let v=input.value.replace(/\D/g,'');
  v=(Number(v)/100).toFixed(2);
  v=v.replace('.',',');
  v=v.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  input.value=v;
}

/* ---------- CLIENTES ---------- */
async function carregarClientes(){
  try {
    const res = await fetch("/dados");
    funcionarios = await res.json();
    ordenar("data"); // mais recentes ao abrir
    carregarEmpresasFiltro();
  } catch(e){
    console.error("Erro ao carregar clientes", e);
  }
}



function mostrar(lista){
  const tbody = document.getElementById("lista");
  if(!tbody) return;

  tbody.innerHTML = "";

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const pagina = lista.slice(inicio, fim);

  pagina.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.empresa}</td>
      <td>R$ ${p.salario}</td>
      <td>${p.cpf || ''}</td>
      <td>${p.data || ''}</td>
      <td class="acoes">
  <button onclick="abrirModal(${p.id})">Editar/Excluir</button>
</td>


    `;
    tbody.appendChild(tr);
  });

  criarPaginacao(lista);
}



function criarPaginacao(lista){
  const pagDiv = document.getElementById("paginacao");
  if (!pagDiv) return;

  pagDiv.innerHTML = "";

  const totalPaginas = Math.ceil(lista.length / itensPorPagina);

  // sempre cria o botão 1
  const btn1 = document.createElement("button");
  btn1.innerText = "1";

  if (paginaAtual === 1) btn1.classList.add("ativo");

  btn1.onclick = () => {
    paginaAtual = 1;
    mostrar(lista);
  };

  pagDiv.appendChild(btn1);

  // se só tem 1 página, para aqui
  if (totalPaginas <= 1) return;

  // cria as outras páginas só se passar de 7
  for (let i = 2; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === paginaAtual) btn.classList.add("ativo");

    btn.onclick = () => {
      paginaAtual = i;
      mostrar(lista);
    };

    pagDiv.appendChild(btn);
  }
}







function buscarClientes(){
  paginaAtual = 1;
  const t = document.getElementById("busca").value.toLowerCase();
  mostrar(funcionarios.filter(p=>p.nome.toLowerCase().includes(t)));
}


function limparCampos(){
  document.getElementById("nome").value='';
  document.getElementById("empresa").value='';
 
  document.getElementById("salario").value='';
  document.getElementById("cpf").value='';
  editId=null;
}

async function editar(id){
  const p = funcionarios.find(f => f.id === id);
  if(!p) return;

  const nome = prompt("Nome:", p.nome);
  if(nome === null) return;

  const empresa = prompt("Empresa:", p.empresa);
  if(empresa === null) return;

  const salario = prompt("Salário:", p.salario);
  if(salario === null) return;

  const cpf = prompt("CPF:", p.cpf || "");
  if(cpf === null) return;

  const atualizado = {
    ...p,
    nome: nome.toUpperCase(),
    empresa: empresa,
    salario: salario,
    cpf: cpf
  };

  await fetch(`/dados/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(atualizado)
  });

  carregarClientes();
}


/* ---------- SALVAR CLIENTE ---------- */
async function salvar(){
  const msgEl = document.getElementById("msg");
  const nome = document.getElementById("nome").value.trim();
  const empresa = document.getElementById("empresa").value;

  const salario = document.getElementById("salario").value.replace(/\D/g,'');
  const cpf = document.getElementById("cpf").value;

  if(!nome || !empresa || (empresa==='OUTRA' && !empresaOutra) || !salario){
    msgEl.innerText="Preencha todos os campos obrigatórios!";
    msgEl.classList.add("erro");
    return;
  }




const pessoa = {
  id: editId ?? Date.now(),
  nome: nome.toUpperCase(),
  empresa: empresa, // <-- ISSO AQUI
  salario: (parseFloat(salario)/100).toFixed(2).replace('.',','),
  cpf: cpf.toUpperCase(),
  data: new Date().toLocaleDateString()
};








  try {
    const res = await fetch(editId ? `/dados/${editId}` : '/dados', {
      method: editId ? 'PUT' : 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pessoa)
    });

    if(res.ok){
      msgEl.innerText = editId ? "Atualizado com sucesso!" : "Funcionário cadastrado!";
      msgEl.classList.remove("erro");
      limparCampos();
      editId=null;
      carregarClientes();
    } else throw new Error("Erro ao salvar!");
  } catch(err){
    msgEl.innerText=err.message;
    msgEl.classList.add("erro");
  }
}

async function excluir(id){
  if(confirm("Excluir este registro?")){
    await fetch(`/dados/${id}`, { method: "DELETE" });
    carregarClientes();
  }
}

/* ---------- EMPRESAS ---------- */
async function carregarEmpresas(){
  try {
    const res = await fetch("/empresas");
    empresas = await res.json();
    const sel = document.getElementById("empresa");
    if(!sel) return;
    sel.innerHTML = '<option value="">Selecione a empresa</option>';
    empresas.forEach(e=>sel.innerHTML+=`<option>${e}</option>`);
   
  } catch(e){
    console.error("Erro ao carregar empresas", e);
  }
}



function carregarEmpresasFiltro(){
  const sel=document.getElementById("filtroEmpresa");
  if(!sel) return;
  sel.innerHTML='<option value="">Todas as empresas</option>';
  empresas.forEach(e=>sel.innerHTML+=`<option>${e}</option>`);
}

function filtrarEmpresa(){
  paginaAtual = 1;
  const sel = document.getElementById("filtroEmpresa");
  const msg = document.getElementById("msgFiltro");
  const val = sel.value;

  if (!val) {
    msg.innerText = "";
    mostrar(funcionarios);
    return;
  }

  const filtrados = funcionarios.filter(f => f.empresa === val);

  if (filtrados.length === 0) {
    msg.innerText = `Nenhum funcionário cadastrado na empresa ${val}.`;
    msg.classList.add("erro");
  } else {
    msg.innerText = "";
    msg.classList.remove("erro");
  }

  mostrar(filtrados);
}


/* ---------- ORDENAR ---------- */
function ordenar(valor){
   paginaAtual = 1;
  let lista = [...funcionarios];

  if (valor === "data") {
    // recentes primeiro
    lista.sort((a,b) =>
      new Date(b.data.split('/').reverse().join('-')) -
      new Date(a.data.split('/').reverse().join('-'))
    );
  }

  if (valor === "data_antiga") {
    // antigos primeiro
    lista.sort((a,b) =>
      new Date(a.data.split('/').reverse().join('-')) -
      new Date(b.data.split('/').reverse().join('-'))
    );
  }

  if (valor === "nome")
    lista.sort((a,b) => a.nome.localeCompare(b.nome));

  if (valor === "empresa")
    lista.sort((a,b) => a.empresa.localeCompare(b.empresa));

  mostrar(lista);
}


/* ---------- EXPORTAR ---------- */
function exportar(){
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(funcionarios);
  XLSX.utils.book_append_sheet(wb, ws, "Funcionarios");
  XLSX.writeFile(wb,"funcionarios.xlsx");
}

/* ---------- ADMIN EMPRESAS ---------- */
async function carregarEmpresasAdmin(){
  try{
    const res = await fetch("/empresas");
    empresas = await res.json();
    const ul=document.getElementById("listaEmpresas");
    if(!ul) return;
    ul.innerHTML='';
    empresas.forEach(e=>{
      const li=document.createElement("li");
      li.textContent = e + ' ';
      const btn = document.createElement("button");
      btn.textContent = "Excluir";
      btn.onclick = async () => {
        await fetch(`/empresas/${encodeURIComponent(e)}`, { method: "DELETE" });
        carregarEmpresasAdmin();
        carregarEmpresas();
      };
      li.appendChild(btn);
      ul.appendChild(li);
    });
  } catch(e){ console.error("Erro ao carregar empresas admin",e); }
}

async function adicionarEmpresa(){
  const nome = document.getElementById("novaEmpresa").value.trim();
  if(!nome) return alert("Digite o nome da empresa");
  try{
    const res = await fetch("/empresas",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({nome})
    });
    if(res.ok){
      document.getElementById("novaEmpresa").value='';
      carregarEmpresasAdmin();
      carregarEmpresas();
    } else alert("Erro ao adicionar empresa");
  } catch(e){ console.error("Erro ao adicionar empresa", e); }
}

/* ---------- BOTÃO BACK TO TOP ---------- */
const backToTopButton = document.getElementById("backToTop");
window.onscroll = function(){
  if(document.body.scrollTop>200 || document.documentElement.scrollTop>200){
    backToTopButton.style.display="block";
  } else backToTopButton.style.display="none";
};
backToTopButton?.addEventListener("click",()=>{ window.scrollTo({top:0,behavior:"smooth"}); });

/* ---------- INICIALIZAÇÃO ---------- */
window.onload = async () => {
  await carregarEmpresas();
  await carregarClientes();
};


function acao(id){
  const escolha = prompt(
    "Digite:\n1 - Editar\n2 - Excluir"
  );

  if(escolha === "2"){
    confirmarExclusao(id);
    return;
  }

  if(escolha === "1"){
    editarCliente(id);
    return;
  }
}

async function confirmarExclusao(id){
  if(confirm("Tem certeza que deseja excluir este registro?")){
    await fetch(`/dados/${id}`, { method: "DELETE" });
    carregarClientes();
  }
}

async function editarCliente(id){
  const p = funcionarios.find(f => f.id === id);
  if(!p) return;

  const nome = prompt("Nome:", p.nome);
  if(nome === null) return;

  const empresa = prompt("Empresa:", p.empresa);
  if(empresa === null) return;

  const salario = prompt("Salário:", p.salario);
  if(salario === null) return;

  const cpf = prompt("CPF:", p.cpf || "");
  if(cpf === null) return;

  if(!confirm("Tem certeza que deseja salvar as alterações?")) return;

  const atualizado = {
    ...p,
    nome: nome.toUpperCase(),
    empresa,
    salario,
    cpf
  };

  await fetch(`/dados/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(atualizado)
  });

  carregarClientes();
}

let clienteSelecionado = null;

function abrirModal(id){
  clienteSelecionado = funcionarios.find(f => f.id === id);
  if(!clienteSelecionado) return;

  m_nome.value = clienteSelecionado.nome;
  m_empresa.value = clienteSelecionado.empresa;
  m_salario.value = clienteSelecionado.salario;
  m_cpf.value = clienteSelecionado.cpf || "";

  modal.style.display = "flex";
}

function fecharModal(){
  modal.style.display = "none";
  clienteSelecionado = null;
}

async function salvarEdicao(){
  if(!confirm("Tem certeza que deseja salvar as alterações?")) return;

  clienteSelecionado.nome = m_nome.value.toUpperCase();
  clienteSelecionado.empresa = m_empresa.value;
  clienteSelecionado.salario = m_salario.value;
  clienteSelecionado.cpf = m_cpf.value;

  await fetch(`/dados/${clienteSelecionado.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clienteSelecionado)
  });

  fecharModal();
  carregarClientes();
}

async function excluirEdicao(){
  if(!confirm("Tem certeza que deseja excluir este registro?")) return;

  await fetch(`/dados/${clienteSelecionado.id}`, {
    method: "DELETE"
  });

  fecharModal();
  carregarClientes();
}


function limparBusca(){
  const input = document.getElementById("busca");
  const filtroEmpresa = document.getElementById("filtroEmpresa");
  const msg = document.getElementById("msgFiltro");

  input.value = "";
  filtroEmpresa.value = "";
  msg.innerText = "";

  paginaAtual = 1;
  mostrar(funcionarios);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT);
