// Author: Iago Lourenço (iagojlourenco@gmail.com) / compilador.js

import { ErroLexico, ErroSemantico, ErroSintatico } from "./erros.js";
// Import dos módulos do compilador
import sintatico from "./sintatico.js";
// Guarda as abas do editor
const tabs = [];
var activeTab = 0;
var editor;

// Import da VM
import { Maquina } from "../../maquina-virtual/js/maquina.js";

var filename = "Novo.lpd";

async function loadLocalFile(files, editor) {
  if (files.length == 1) {
    var reader = new FileReader();
    reader.fileName = files[0].name;
    filename = files[0].name;

    reader.onload = function (e) {
      logar(`Arquivo ${e.target.fileName} carregado com sucesso!`);
      createTab(e.target.fileName);
      editor.setValue(e.target.result);
      document.getElementById("file-input").value = "";
    };
    reader.readAsText(files[0]);
  } else {
    for (var i = 0; i < files.length; i++) {
      var reader = new FileReader();
      reader.fileName = files[i].name;
      filename = files[i].name;

      reader.onload = function (e) {
        createTab(e.target.fileName);
        editor.setValue(e.target.result);
        logar(`Arquivo ${e.target.fileName} carregado com sucesso!`);
        document.getElementById("file-input").value = "";
      };
      reader.readAsText(files[i]);
    }
  }
}

function saveTextAsFile(textToWrite) {
  var textFileAsBlob = new Blob([textToWrite], {
    type: "text/plain;charset=utf-8",
  });

  var downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
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

function runCode() {
  var code = editor.getValue();
  let log = document.getElementById("log");
  log.value = "";

  try {
    var start = performance.now();
    if (code.length > 0) {
      let vm = new Maquina(
        editor.getValue(),
        (val) => logar(`[ENTRADA] - ${val}`),
        (val) => logar(`[SAIDA] - ${val}`),
        () => {},
        () => {}
      );
      logar("Executando arquivo...");
      vm.executar();
      logar(`SUCESSO!`);
    } else {
      throw new Error("Nenhum código inserido!");
    }
  } catch (e) {
    console.error(e);
    logar(e.message);
  } finally {
    // Tempo de execução do compilador
    var end = performance.now();
    log.value += `\n\n---\nTempo de execução: ${
      Math.round((end - start) * 100) / 100
    }ms\n`;
  }
}

function compileCode() {
  var code = editor.getValue();
  let log = document.getElementById("log");
  log.value = "";
  try {
    var start = performance.now();
    if (code.length > 0) {
      logar(`Compilando...`);
      // Chamada do sintático para iniciar a análise
      const codigo = sintatico.iniciar(code);
      logar(`SUCESSO!`);
      return codigo;
    } else {
      throw new Error("Nenhum código inserido!");
    }
  } catch (e) {
    console.error(e);
    if (
      e instanceof ErroLexico ||
      e instanceof ErroSintatico ||
      e instanceof ErroSemantico
    ) {
      // Coloca o cursor na linha e coluna do erro
      editor.setCursor(e.linha, e.coluna);
      editor.focus();
    }

    // Printa a mensagem no log
    logar(e.message);
  } finally {
    // Tempo de execução do compilador
    var end = performance.now();
    log.value += `\n\n---\nTempo de compilação: ${
      Math.round((end - start) * 100) / 100
    }ms\n`;
  }
}

// Tabs management functions
function createTab(name) {
  /**
   * Create a tab
   */
  tabs.push({
    doc: CodeMirror.Doc("", "text/x-lpd"),
    name: name,
  });
  reconstructTabs();
  addTabListeners();
  activateTab(tabs.length - 1);
  setTabName(tabs.length - 1, name);
  // Scroll the tab container to the end
  document.getElementById("tabs_container").scrollLeft =
    document.getElementById("tabs_container").scrollWidth;
}

function reconstructTabs() {
  document.getElementById("tabs_container").innerHTML = "";
  for (let i = 0; i < tabs.length; i++) {
    document.getElementById("tabs_container").innerHTML += `
  <div class="tab_c">
    <div class="tab" id="tab${i}">
      <span class="material-icons">code</span>
      <span class="tab_title">${tabs[i].name}</span>
    </div>
    <span  class="material-icons close" id="tab${i}_close">close</span>
  </div>`;
  }

  document.getElementById(
    "tabs_container"
  ).innerHTML += `<div id="new_tab"><span class="material-icons">add</span></div>`;

  document.getElementById("new_tab").addEventListener("click", () => {
    // create a new tab
    createTab("Novo.lpd");
  });
}
function activateTab(index) {
  editor.swapDoc(tabs[index].doc);
  editor.focus();
  document.getElementById("posicao").innerHTML = `Ln ${
    editor.getCursor().line + 1
  }, Col ${editor.getCursor().ch + 1}`;

  for (let j = 0; j < tabs.length; j++) {
    document.getElementById(`tab${j}`).classList.remove("active");
  }
  document.getElementById(`tab${index}`).classList.add("active");
  activeTab = index;
  filename = tabs[index].name;

  // Show run button if the file is a .lpdo, otherwise hide it and show build button
  if (filename.endsWith(".lpdo")) {
    document.getElementById("run").style.display = "flex";
    document.getElementById("compilar").style.display = "none";
  } else {
    document.getElementById("run").style.display = "none";
    document.getElementById("compilar").style.display = "flex";
  }
}
function setTabName(index, name) {
  tabs[index].name = name;
}
function addTabListeners() {
  for (let i = 0; i < tabs.length; i++) {
    document.getElementById(`tab${i}`).addEventListener("click", () => {
      activateTab(i);
    });
    document.getElementById(`tab${i}_close`).addEventListener("click", () => {
      // Ask for confirmation
      closeTab(i);
    });
  }
}

function closeTab(index) {
  // Remove tab
  if (tabs.length > 1) {
    if (tabs[index].doc.getValue().length > 0) {
      if (confirm("Deseja realmente fechar esta aba?")) {
        tabs.splice(index, 1);
        reconstructTabs();
        addTabListeners();
        activateTab(tabs.length - 1);
      }
    } else {
      tabs.splice(index, 1);
      reconstructTabs();
      addTabListeners();
      activateTab(tabs.length - 1);
    }
  } else {
    logar("Não é possível fechar a última aba!");
  }
}

window.onload = function () {
  editor = CodeMirror(document.getElementById("codeeditor"), {
    mode: "text/x-lpd",
    theme: "dracula",
    lineNumbers: true,
    autofocus: true,
    placeholder: "Ctrl-O para abrir um arquivo, ou comece a digitar!",
    viewportMargin: 150,
    extraKeys: {
      F11: function (cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      Esc: function (cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
      },
    },
  });
  tabs.push({ doc: editor.getDoc(), name: "Novo.lpd" });
  reconstructTabs();
  addTabListeners();
  document.getElementById(`tab0`).classList.add("active");

  logar("Bem vindo ao compilador LPD! aka. compi{LPD}lador");
  logar(
    "Para começar, carregue um arquivo ou digite o código no editor acima."
  );

  // Animação do logo
  document.getElementById("logo").addEventListener("mouseover", function () {
    document.getElementsByClassName("logo_snip")[0].innerHTML = "return";
  });

  // Animação do logo
  document.getElementById("logo").addEventListener("mouseout", function () {
    document.getElementsByClassName("logo_snip")[0].innerHTML = "LPD";
  });

  // Atualiza os números da linha e coluna na janela
  editor.on("cursorActivity", function () {
    document.getElementById("compilar").style.transform = "translateX(0px)";
    document.getElementById("salvar").style.transform = "translateX(0px)";

    document.getElementById("posicao").innerHTML = `Ln ${
      editor.getCursor().line + 1
    }, Col ${editor.getCursor().ch + 1}`;
  });

  // Intercepta pressionamento de teclas na página
  document.onkeydown = function (e) {
    // Ctrl + S
    if (e.ctrlKey && e.keyCode == 83) {
      e.preventDefault();
      document.getElementById("salvar").click();
    }
    // F5
    if (e.keyCode == 116) {
      e.preventDefault();
      if (filename.endsWith(".lpdo")) {
        document.getElementById("run").click();
      } else {
        document.getElementById("compilar").click();
      }
    }
    // Ctrl + L
    if (e.ctrlKey && e.keyCode == 76) {
      e.preventDefault();
      document.getElementById("limpar").click();
    }
    // Ctrl + O
    if (e.ctrlKey && e.keyCode == 79) {
      e.preventDefault();
      document.getElementById("abrir").click();
    }
  };

  // Carrega o arquivo local
  document.getElementById("abrir").addEventListener("click", function () {
    document.getElementById("file-input").click();
  });
  document.getElementById("file-input").addEventListener("change", function () {
    loadLocalFile(this.files, editor);
  });

  // Compila o código
  document.getElementById("compilar").addEventListener("click", function () {
    // Se o codigo do editor for .lpo (arquivo compilado) não compila
    if (tabs[activeTab].name.split(".").pop() == "lpdo") {
      logar("Não é possível compilar um arquivo compilado!");
    } else if (editor.getValue().length == 0) {
      logar("Não é possível compilar um arquivo vazio!");
    } else {
      let code = compileCode();
      if (code) {
        createTab(`${tabs[activeTab].name.split(".")[0]}.lpdo`);
        editor.setValue(code);
      }
    }
  });

  document.getElementById("run").addEventListener("click", function () {
    if (tabs[activeTab].name.split(".").pop() == "lpdo") {
      runCode();
    } else {
      logar("Não é possível executar um arquivo não compilado!");
    }
  });

  // Brincadeira....
  window.addEventListener("resize", setupPrank);
  setupPrank();

  // Salva o arquivo
  document.getElementById("salvar").addEventListener("click", function () {
    if (editor.getValue().length > 0) {
      saveTextAsFile(editor.getValue());
    } else {
      logar("Nenhum código para salvar!");
    }
  });
};

function prank() {
  let compilar = document.getElementById("compilar");
  let salvar = document.getElementById("salvar");
  if (editor.getValue().length > 0) {
    compilar.style.transform = "translateX(0px)";
    salvar.style.transform = "translateX(0px)";
  }
  // Both right
  else if (
    compilar.style.transform == "translateX(0px)" &&
    salvar.style.transform == "translateX(0px)"
  ) {
    if (this.id == "compilar") {
      compilar.style.transform = "translateX(-100px)";
    } else {
      compilar.style.transform = "translateX(-100px)";
      salvar.style.transform = "translateX(-100px)";
    }
  }
  // Both left
  else if (
    compilar.style.transform == "translateX(-100px)" &&
    salvar.style.transform == "translateX(-100px)"
  ) {
    if (this.id == "compilar") {
      compilar.style.transform = "translateX(0px)";
      salvar.style.transform = "translateX(0px)";
    } else {
      salvar.style.transform = "translateX(0px)";
    }
  }
  // Compilar right and salvar left
  else if (
    compilar.style.transform == "translateX(-100px)" &&
    salvar.style.transform == "translateX(0px)"
  ) {
    if (this.id == "compilar") {
      compilar.style.transform = "translateX(0px)";
    } else {
      salvar.style.transform = "translateX(-100px)";
    }
  }
}

function setupPrank() {
  let compilar = document.getElementById("compilar");
  let salvar = document.getElementById("salvar");
  compilar.style.transform = "translateX(0px)";
  salvar.style.transform = "translateX(0px)";

  if (window.innerWidth > 768) {
    compilar.addEventListener("mouseenter", prank);
    salvar.addEventListener("mouseenter", prank);
  } else {
    compilar.removeEventListener("mouseenter", prank);
    salvar.removeEventListener("mouseenter", prank);
  }
}
