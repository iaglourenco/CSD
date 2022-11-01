// Author: Iago Lourenço (iagojlourenco@gmail.com) / maquina.js
var filename = "Novo.lpdo";

async function loadLocalFile(files) {
  var reader = new FileReader();
  reader.fileName = files[0].name;
  filename = files[0].name;

  reader.onload = function (e) {
    logar(`Arquivo ${e.target.fileName} carregado com sucesso!`);
    // editor.setValue(e.target.result);
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
      document.getElementById("limpar").click();
    }
    // Ctrl + O
    if (e.ctrlKey && e.keyCode == 79) {
      e.preventDefault();
      document.getElementById("abrir").click();
    }
  };

  // Drag and drop
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById("drag_and_drop").classList.add("hovered");
  });

  document.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById("drag_and_drop").classList.remove("hovered");
  });

  document.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadLocalFile(e.dataTransfer.files);
    document.getElementById("drag_and_drop").classList.remove("hovered");
  });

  // Carrega o arquivo local
  document.getElementById("abrir").addEventListener("click", function () {
    document.getElementById("file-input").click();
  });
  document.getElementById("file-input").addEventListener("change", function () {
    loadLocalFile(this.files);
  });
};
