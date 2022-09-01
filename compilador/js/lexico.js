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
      if (caracter == "\t") coluna += 1;
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
        coluna++;
      }
      // Volta um caracter para não perder o próximo caracter
      i--;
      coluna--;

      let token = {
        lexema: tokenNum,
        simbolo: "Snumero",
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
        coluna++;
      }
      // Volta um caracter para não perder o próximo caracter
      i--;
      coluna--;

      let token = {
        lexema: tokenId,
        simbolo: identificaSimbolo(tokenId),
      };
      listaTokens.push(token);
      continue;
    }

    // Se o caracter for ":" trata como atribuição ou dois pontos
    if (caracter == ":") {
      // Se o caracter seguinte for "=", trata como atribuição
      if (data[i + 1] == "=") {
        let token = {
          lexema: ":=",
          simbolo: "Satribuicao",
        };
        listaTokens.push(token);
        i++;
        continue;
      }
      // Se não, trata como dois pontos
      else {
        let token = {
          lexema: ":",
          simbolo: "Sdoispontos",
        };
        listaTokens.push(token);
        continue;
      }
    }

    // Se o caracter for "+", "-", "*" trata como operador aritmético
    if (caracter == "+" || caracter == "-" || caracter == "*") {
      let token;
      if (caracter == "+") {
        token = {
          lexema: "+",
          simbolo: "Smais",
        };
      } else if (caracter == "-") {
        token = {
          lexema: "-",
          simbolo: "Smenos",
        };
      } else if (caracter == "*") {
        token = {
          lexema: "*",
          simbolo: "Smult",
        };
      }
      listaTokens.push(token);
      continue;
    }

    // Se o caracter for "!", "<", ">", "=" trata como operador relacional
    if (
      caracter == "!" ||
      caracter == "<" ||
      caracter == ">" ||
      caracter == "="
    ) {
      let token;
      if (caracter == "!") {
        token = {
          lexema: "!",
          simbolo: "Snao",
        };
      } else if (caracter == "<") {
        token = {
          lexema: "<",
          simbolo: "Smenor",
        };
      } else if (caracter == ">") {
        token = {
          lexema: ">",
          simbolo: "Smaior",
        };
      } else if (caracter == "=") {
        token = {
          lexema: "=",
          simbolo: "Sigual",
        };
      }
      listaTokens.push(token);
      continue;
    }

    // Se o caracter for ";", ",",  "(",  ")", "." trata como pontuação
    if (
      caracter == ";" ||
      caracter == "," ||
      caracter == "(" ||
      caracter == ")" ||
      caracter == "."
    ) {
      let token;
      if (caracter == ";") {
        token = {
          lexema: ";",
          simbolo: "Sponto_virgula",
        };
      } else if (caracter == ",") {
        token = {
          lexema: ",",
          simbolo: "Svirgula",
        };
      } else if (caracter == "(") {
        token = {
          lexema: "(",
          simbolo: "Sabre_parenteses",
        };
      } else if (caracter == ")") {
        token = {
          lexema: ")",
          simbolo: "Sfecha_parenteses",
        };
      } else if (caracter == ".") {
        token = {
          lexema: ".",
          simbolo: "Sponto",
        };
      }
      listaTokens.push(token);
      continue;
    }

    throw new Error(
      `Erro léxico: caracter inválido "${caracter}" na linha ${linha} e coluna ${coluna}`
    );
  }

  return listaTokens;
}

function identificaSimbolo(token) {
  switch (token) {
    case "programa":
      return "Sprograma";
    case "se":
      return "Sse";
    case "entao":
      return "Sentao";
    case "senao":
      return "Ssenao";
    case "enquanto":
      return "Senquanto";
    case "faca":
      return "sfaca";
    case "inicio":
      return "Sinicio";
    case "fim":
      return "Sfim";
    case "leia":
      return "Sleia";
    case "escreva":
      return "Sescreva";
    case "var":
      return "Svar";
    case "inteiro":
      return "Sinteiro";
    case "booleano":
      return "Sbooleano";
    case "verdadeiro":
      return "Sverdadeiro";
    case "falso":
      return "Sfalso";
    case "procedimento":
      return "Sprocedimento";
    case "funcao":
      return "Sfuncao";
    case "div":
      return "Sdiv";
    case "e":
      return "Se";
    case "ou":
      return "Sou";
    case "nao":
      return "Snao";
    default:
      return "Sidentificador";
  }
}

// Exporta o módulo
const lexico = {
  pegaToken,
};
export default lexico;
