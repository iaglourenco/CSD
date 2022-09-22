// Author: Iago Lourenço (iagojlourenco@gmail.com) / main.js

var filename = "myfile.txt";

function loadLocalFile(files, editor) {
  if (files.length == 1) {
    var reader = new FileReader();
    reader.fileName = files[0].name;
    filename = files[0].name;
    document.getElementById("filename").innerHTML = filename;
    reader.onload = function (e) {
      editor.setValue(e.target.result);
      logar(`Arquivo ${e.target.fileName} carregado com sucesso!`);
    };
    reader.readAsText(files[0]);
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
}

import { ErroLexico, ErroSemantico, ErroSintatico } from "./erros.js";
// Import dos módulos do compilador
import sintatico from "./sintatico.js";

window.onload = function () {
  var editor = CodeMirror(document.getElementById("codeeditor"), {
    mode: "text/x-lpd",
    theme: "dracula",
    lineNumbers: true,
    autofocus: true,

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

  // Atualiza os números da linha e coluna na janela
  editor.on("cursorActivity", function () {
    if (document.getElementById("filename").value == "") {
      document.getElementById("filename").value = filename;
    }
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
      document.getElementById("compilar").click();
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
        // logar(`Tokens: ${JSON.stringify(listaToken)}`);
        // console.table(listaToken);
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
        editor.setCursor(e.linha - 1, e.coluna - 1);
        editor.focus();
      }

      // Printa a mensagem no log
      logar(e.message);
    } finally {
      // Tempo de execução do compilador
      var end = performance.now();
      log.value += `\n\n---\nTempo de execução: ${
        Math.round((end - start) * 100) / 100
      }ms\n`;
    }
  });

  // Salva o arquivo
  document.getElementById("salvar").addEventListener("click", function () {
    if (editor.getValue().length > 0) {
      saveTextAsFile(editor.getValue());
    } else {
      logar("Nenhum código para salvar!");
    }
  });
};
