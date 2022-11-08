// Author: Iago Lourenço (iagojlourenco@gmail.com) / maquina.js

var filename = "Novo.lpdo";
var maquina;
var code = "";

async function loadLocalFile(files) {
  var reader = new FileReader();
  reader.fileName = files[0].name;
  filename = files[0].name;

  reader.onload = function (e) {
    code = e.target.result;
    try {
      load2Table(code);
      logar(`Arquivo ${filename} carregado com sucesso!`);
      addListenersBreakpoints();
    } catch (e) {
      logar(`Falha ao carregar ${filename}: ${e.message}`);
    }

    document.getElementById("executar").style.transform = "translateX(0px)";
    document.getElementById("debug").style.transform = "translateX(0px)";
  };
  reader.readAsText(files[0]);
}

// Exibe mensagens no log com a hora
function logar(msg) {
  document.getElementById(
    "log"
  ).value += `[${new Date().toLocaleString()}] ${msg}\n`;
  // Faz o scroll na textarea para o fim
  document.getElementById("log").scrollTop =
    document.getElementById("log").scrollHeight;
}

function input(message) {
  document.getElementById("input").value += `${message}\n`;
}

function output(message) {
  document.getElementById("output").value += `${message}\n`;
}

function updateMemory(memory) {
  document.getElementById("memory_table").innerHTML = "";
  document.getElementById("memory_table").innerHTML = `<tr id="mem_addresses">
            <th>Endereço</th>
          </tr>
          <tr id="mem_values">
            <th>Valor</th>
          </tr>`;

  const tableAddr = document.getElementById("mem_addresses");
  const tableValues = document.getElementById("mem_values");
  for (let i = 0; i < memory.length; i++) {
    tableAddr.innerHTML += `<td>${i}</td>`;
    tableValues.innerHTML += `<td>${memory[i]}</td>`;
  }
  document.getElementById("mem_size").innerHTML = `${memory.length} valores`;
}

window.onload = function () {
  logar("Bem vindo à máquina virtual LPD!");
  logar(
    "Para começar, carregue um arquivo .lpdo clicando no botão 'Carregar' acima ou arrastando o arquivo."
  );

  // Animação do logo
  document.getElementById("logo").addEventListener("mouseover", function () {
    document.getElementsByClassName("logo_snip")[0].innerHTML = "return";
  });

  // Animação do logo
  document.getElementById("logo").addEventListener("mouseout", function () {
    document.getElementsByClassName("logo_snip")[0].innerHTML = "LPD";
  });

  // Intercepta pressionamento de teclas na página
  document.onkeydown = function (e) {
    // Ctrl + F5
    if (e.ctrlKey && e.keyCode == 116) {
      e.preventDefault();
      document.getElementById("debug").click();
    }
    // F5
    if (e.keyCode == 116) {
      e.preventDefault();
      document.getElementById("executar").click();
    }
    // Ctrl + L
    if (e.ctrlKey && e.keyCode == 76) {
      e.preventDefault();
      document.getElementById("log").value = "";
    }
    // Ctrl + O
    if (e.ctrlKey && e.keyCode == 79) {
      e.preventDefault();
      document.getElementById("abrir").click();
    }
  };

  document.getElementById("executar").addEventListener("click", () => {
    updateMemory([2, 3, 4, 1, "banana"]);
    // maquina.executar();
  });
  document
    .getElementById("debug")
    .addEventListener("click", () => maquina.executar());

  // Drag and drop
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    document
      .getElementsByClassName("drag_and_drop")[0]
      .classList.add("hovered");
  });
  document.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    document
      .getElementsByClassName("drag_and_drop")[0]
      .classList.remove("hovered");
  });
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadLocalFile(e.dataTransfer.files);
    document
      .getElementsByClassName("drag_and_drop")[0]
      .classList.remove("hovered");
  });

  document.getElementById("fechar").addEventListener("click", closeDoc);

  window.addEventListener("resize", setupPrank);
  setupPrank();

  // Carrega o arquivo local
  document.getElementById("abrir").addEventListener("click", function () {
    document.getElementById("file-input").click();
  });
  document.getElementById("file-input").addEventListener("change", function () {
    loadLocalFile(this.files);
  });
};

function prank() {
  let executar = document.getElementById("executar");
  let debug = document.getElementById("debug");
  if (code.length > 0) {
    executar.style.transform = "translateX(0px)";
    debug.style.transform = "translateX(0px)";
  }
  // Both right
  else if (
    executar.style.transform == "translateX(0px)" &&
    debug.style.transform == "translateX(0px)"
  ) {
    if (this.id == "executar") {
      executar.style.transform = "translateX(-100px)";
    } else {
      executar.style.transform = "translateX(-100px)";
      debug.style.transform = "translateX(-100px)";
    }
  }
  // Both left
  else if (
    executar.style.transform == "translateX(-100px)" &&
    debug.style.transform == "translateX(-100px)"
  ) {
    if (this.id == "executar") {
      executar.style.transform = "translateX(0px)";
      debug.style.transform = "translateX(0px)";
    } else {
      debug.style.transform = "translateX(0px)";
    }
  }
  // executar right and debug left
  else if (
    executar.style.transform == "translateX(-100px)" &&
    debug.style.transform == "translateX(0px)"
  ) {
    if (this.id == "executar") {
      executar.style.transform = "translateX(0px)";
    } else {
      debug.style.transform = "translateX(-100px)";
    }
  }
}

function load2Table(code) {
  // Carrega o código para a tabela na coluna de instruções
  // com a primeira coluna sendo um checkbox, a segunda o code e a terceira a descrição
  maquina = new Maquina(code, input, output, updateMemory);

  let table = document.getElementById("code_table_body");
  table.innerHTML = "";
  for (let i = 0; i < maquina.instrucoes.length - 1; i++) {
    let ins = maquina.instrucoes[i];
    let row = table.insertRow(i);
    let cell = row.insertCell(0);
    // zero fill left
    cell.innerHTML = `${(i + 1)
      .toString()
      .padStart(2, "0")} <input type="checkbox" id="checkbox${i}">`;
    cell = row.insertCell(1);
    cell.innerHTML = ins.codigo;
    cell = row.insertCell(2);
    cell.innerHTML = ins.descricao(ins);
  }
  document.getElementsByClassName("drag_and_drop")[0].classList.add("hidden");
  document.getElementsByClassName("code")[0].classList.remove("hidden");
}

function addListenersBreakpoints() {
  // Adiciona listeners aos checkboxes
  for (let i = 0; i < maquina.instrucoes.length - 1; i++) {
    document
      .getElementById(`checkbox${i}`)
      .addEventListener("change", function () {
        if (this.checked) {
          maquina.breakpoints.push(i);
        } else {
          maquina.breakpoints.splice(maquina.breakpoints.indexOf(i), 1);
        }
      });
  }
}

function setupPrank() {
  let executar = document.getElementById("executar");
  let debug = document.getElementById("debug");
  executar.style.transform = "translateX(0px)";
  debug.style.transform = "translateX(0px)";

  if (window.innerWidth > 768) {
    executar.addEventListener("mouseenter", prank);
    debug.addEventListener("mouseenter", prank);
  } else {
    executar.removeEventListener("mouseenter", prank);
    debug.removeEventListener("mouseenter", prank);
  }
}

function closeDoc() {
  code = "";
  document.getElementById("code_table_body").innerHTML = "";
  document.getElementById("input").value = "";
  document.getElementById("output").value = "";
  document.getElementById("log").value = "";
  document.getElementById("file-input").value = "";
  document
    .getElementsByClassName("drag_and_drop")[0]
    .classList.remove("hidden");
  document.getElementsByClassName("code")[0].classList.add("hidden");

  logar("Bem vindo à máquina virtual LPD!");
  logar(
    "Para começar, carregue um arquivo .lpdo clicando no botão 'Carregar' acima ou arrastando o arquivo."
  );
}
