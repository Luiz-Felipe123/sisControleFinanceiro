const chave_transcoes_ls = "transacoes";
const form = document.getElementById("form");
const descInput = document.getElementById("descricao");
const valorInput = document.querySelector("#montante");
const balancoH1 = document.getElementById("balanco");
const receitaP = document.querySelector("#din-positivo");
const despesaP = document.querySelector("#din-negativo");
const transacoesUL = document.getElementById("transacoes");

let transacoesSalvas;
try {
  transacoesSalvas = JSON.parse(localStorage.getItem(chave_transcoes_ls));
} catch (erro) {
  transacoesSalvas = null;
}

if (transacoesSalvas == null) {
  transacoesSalvas = [];
}

document.getElementById("tipo").addEventListener("change", function() {
  console.log("Tipo de transação alterado:", this.value);
  var valorInput = document.getElementById("montante");
  var tipo = this.value;
  if (tipo === "despesa") {
    valorInput.dataset.type = "despesa";
  } else {
    valorInput.dataset.type = "receita";
  }
});

function changePlaceholder() {
  const tipoTransacao = document.getElementById("tipo").value;
  const inputMontante = document.getElementById("montante");
  if (tipoTransacao === "despesa") {
    inputMontante.setAttribute("placeholder", "Valor da Despesa em R$");
  } else {
    inputMontante.setAttribute("placeholder", "Valor da Transação em R$");
  }
}


let nextId = 0;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const descTransacao = descInput.value.trim();
  let valorTransacao = valorInput.value.trim();

  const tipoTransacao = document.getElementById("tipo").value;

  if (tipoTransacao === "despesa") {
    valorTransacao = -Math.abs(parseFloat(valorTransacao));
  } else {
    valorTransacao = Math.abs(parseFloat(valorTransacao)); 
  }

  if (descTransacao == "") {
    alert("Informe a descrião da transação!");
    descInput.focus();
    return;
  }
  if (valorTransacao == "") {
    alert("Informe o valor da transação!");
    valorInput.focus();
    return;
  }

  const transacao = {
    id: nextId++,
    desc: descTransacao,
    valor: parseFloat(valorTransacao),
    tipo: tipoTransacao
  };

  somaAoSaldo(transacao);
  somaRecitaDespesa(transacao);
  addTransacaoAoDOM(transacao);

  // Adiconando ao vetor de transações
  transacoesSalvas.push(transacao);
  // Salvando no Local Storage
  localStorage.setItem(chave_transcoes_ls, JSON.stringify(transacoesSalvas));

  descInput.value = "";
  valorInput.value = "";

  console.log("ID da última transação:", nextId - 1);
});

function somaAoSaldo(transacao) {
  let valorBalanco = balancoH1.innerHTML.trim();
  valorBalanco = valorBalanco.replace("R$", "");

  valorBalanco = parseFloat(valorBalanco);
  valorBalanco += transacao.valor;

  balancoH1.innerHTML = `R$${valorBalanco.toFixed(2)}`;
}

function somaRecitaDespesa(transacao) {
  const tipoTransacao = document.getElementById("tipo").value;
  const elemento = tipoTransacao === "receita" ? receitaP : despesaP;
  const substituir = tipoTransacao === "receita" ? "+ R$" : "- R$";
  let valor = elemento.innerHTML.replace(substituir, "");
  valor = parseFloat(valor);
  valor += Math.abs(transacao.valor);

  elemento.innerHTML = `${substituir}${valor.toFixed(2)}`;
}


function addTransacaoAoDOM(transacao) {
  const tipoTransacao = document.getElementById("tipo").value;
  const cssClass = transacao.valor > 0 ? "positivo" : "negativo";

  const currency = tipoTransacao === "receita" ? "R$" : "-R$";

  const liElement = document.createElement("li");
  liElement.classList.add(cssClass);
  liElement.setAttribute("data-id", transacao.id);

  liElement.innerHTML = `
    <span>${transacao.desc}</span>
    <span>${currency}${Math.abs(transacao.valor)}</span>
    <button class="delete-btn" onclick="deletaTransacao(${transacao.id})">X</button>
  `;

  transacoesUL.append(liElement);
}


function carregarDados() {
  transacoesUL.innerHTML = "";
  balancoH1.innerHTML = "R$0.00";
  receitaP.innerHTML = "+ R$0.00";
  despesaP.innerHTML = "- R$0.00";

  for (let i = 0; i < transacoesSalvas.length; i++) {
    let transacao = transacoesSalvas[i];
    somaAoSaldo(transacao);
    somaRecitaDespesa(transacao);
    addTransacaoAoDOM(transacao);
  }
}

function deletaTransacao(id) {
  const transacaoIndex = transacoesSalvas.findIndex(
    (transacao) => transacao.id == id
  );

  if (transacaoIndex === -1) {
    console.error("Transação não encontrada");
    return;
  }

  const transacaoRemovida = transacoesSalvas.splice(transacaoIndex, 1)[0];

  const liRemover = document.querySelector(`#transacoes li[data-id="${id}"]`);
  liRemover.remove();

  if (transacaoRemovida.tipo === "receita") {
    const valorReceita = parseFloat(receitaP.innerHTML.replace("+ R$", ""));
    receitaP.innerHTML = `+ R$${(valorReceita - transacaoRemovida.valor).toFixed(2)}`;
  } else if (transacaoRemovida.tipo === "despesa") {
    const valorDespesa = parseFloat(despesaP.innerHTML.replace("- R$", ""));
    despesaP.innerHTML = `- R$${(valorDespesa - Math.abs(transacaoRemovida.valor)).toFixed(2)}`;
  } else {
    console.error("Tipo de transação inválido:", transacaoRemovida.tipo);
  }

  let saldo = 0;
  transacoesSalvas.forEach((transacao) => {
    saldo += transacao.valor;
  });
  balancoH1.innerHTML = `R$${saldo.toFixed(2)}`;

  localStorage.removeItem(chave_transcoes_ls);
}


carregarDados();
