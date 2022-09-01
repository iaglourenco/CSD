function pegaToken(data) {
  let isComment = false;
  let listaTokens = [];
  let linha = 1;
  let coluna = 1;
  for (let i = 0; i < data.length; i++) {
    let caracter = data[i];
    coluna++;

    // Ignora espaços em branco
    if (caracter == " " || caracter == "\t") {
      continue;
    }
    // Ignora quebra de linha e incrementa a linha
    if (caracter == "\n") {
      linha++;
      coluna = 1;
      continue;
    }

    // Se o bloco de comentário estiver ativo, ignora o caracter
    if (isComment) {
      // Se o caracter atual for o final do comentário, desativa o bloco de comentário
      if (caracter == "}") {
        isComment = false;
        continue;
      } else {
        continue;
      }
    }

    // Se o caracter atual for o início do comentário, ativa o bloco de comentário
    if (caracter == "{" && !isComment) {
      isComment = true;
      continue;
    }

    // Se o caracter for um dígito, trata como número
    if (caracter.match(/[0-9]/)) {
      let tokenNum = "";
      while (caracter != undefined && caracter.match(/[0-9]/)) {
        tokenNum += caracter;
        caracter = data[++i];
      }

      let token = {
        lexema: tokenNum,
        simbolo: "NUM",
      };
      listaTokens.push(token);
      continue;
    }

    // Se o caracter for uma letra ou "_", trata como identificador
    if (caracter.match(/[a-zA-Z]/)) {
      let tokenId = "";
      while (caracter != undefined && caracter.match(/[a-zA-Z0-9_]/)) {
        tokenId += caracter;
        caracter = data[++i];
      }

      let token = {
        lexema: tokenId,
        simbolo: identificaSimbolo(tokenId),
      };
      listaTokens.push(token);
      continue;
    }
  }

  return listaTokens;
}

function identificaSimbolo(token) {
  switch (token) {
    case "programa":
      return "SPROGRAMA";
    case "se":
      return "SSE";
    case "entao":
      return "SENTAO";
    case "senao":
      return "SSENAO";
    case "enquanto":
      return "SENQUANTO";
    case "faca":
      return "SFACA";
    case "inicio":
      return "SINICIO";
    case "fim":
      return "SFIM";
    case "leia":
      return "SLEIA";
    case "escreva":
      return "SESCREVA";
    case "var":
      return "SVAR";
    case "inteiro":
      return "SINTEIRO";
    case "booleano":
      return "SBOOLEANO";
    case "verdadeiro":
      return "SVERDADEIRO";
    case "falso":
      return "SFALSO";
    case "procedimento":
      return "SPROCEDIMENTO";
    case "funcao":
      return "SFUNCAO";
    case "div":
      return "SDIV";
    case "e":
      return "SE";
    case "ou":
      return "SOU";
    case "nao":
      return "SNAO";

    default:
      return "SIDENTIFICADOR";
  }
}

// Exporta o módulo
const lexico = {
  pegaToken,
};
export default lexico;
