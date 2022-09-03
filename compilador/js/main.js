// Author: Iago Lourenço (iagojlourenco@gmail.com) / main.js

function loadLocalFile(files, editor) {
  if (files.length == 1) {
    var reader = new FileReader();
    reader.fileName = files[0].name;
    reader.onload = function (e) {
      editor.setValue(e.target.result);
      document.getElementById(
        "log"
      ).value += `Arquivo ${e.target.fileName} carregado com sucesso!\n`;
    };
    reader.readAsText(files[0]);
  }
}

function saveTextAsFile(textToWrite) {
  var textFileAsBlob = new Blob([textToWrite], {
    type: "text/plain;charset=utf-8",
  });
  var fileNameToSaveAs = "myfile.txt";

  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
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

// Import dos módulos do compilador
import lexico from "./lexico.js";

window.onload = function () {
  var editor = CodeMirror(document.getElementById("codeeditor"), {
    mode: "javascript",
    theme: "dracula",
    tabSize: 5,
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
  editor.on("cursorActivity", function () {
    document.getElementById("posicao").innerHTML = `Ln ${
      editor.getCursor().line + 1
    }, Col ${editor.getCursor().ch + 1}`;
  });

  // Carrega o arquivo local
  document.getElementById("upload").addEventListener("click", function () {
    document.getElementById("file-input").click();
  });
  document.getElementById("file-input").addEventListener("change", function () {
    loadLocalFile(this.files, editor);
  });

  // Compila o código
  document.getElementById("compilar").addEventListener("click", function () {
    var code = editor.getValue();
    var log = document.getElementById("log");
    log.value = "";
    try {
      if (code.length > 0) {
        log.value += `Compilando...\n`;
        // TODO - Implementar captura de tokens
        const listaToken = lexico.pegaToken(code);
        log.value += `Tokens: ${JSON.stringify(listaToken)}\n`;
        console.table(listaToken);
      } else {
        log.value += "Nenhum código para compilar!\n";
      }
    } catch (e) {
      console.error(e);
      // Pega a linha e a coluna da string de erro
      const linha = e.message.match(/linha (\d+)/)[1];
      const coluna = e.message.match(/coluna (\d+)/)[1];

      // Coloca o cursor na linha e coluna do erro
      editor.setCursor(linha - 1, coluna - 1);
      editor.focus();

      log.value += e.message;
    }
  });

  // Salva o arquivo
  document.getElementById("salvar").addEventListener("click", function () {
    saveTextAsFile(editor.getValue());
  });
};
