// Author: Iago Lourenço (iagojlourenco@gmail.com) / lexico.js
import { ErroLexico } from "./erros.js";

class Lexico {
  constructor(data) {
    this.listaToken = this.tokenizar(data);
    this.tokenAtual = null;
  }
  tokenizar(data) {
    /**
     * Identifica tokens.
     * @param {string} data Código em LPD a ser identificado.
     * @returns {list({lexema:string,simbolo:string})} uma lista de tokens identificados em data
     * @throws {ErroLexico} Caso encontre um caractere estranho indicando a linha e coluna do erro
     */

    // Controlador de comentário, incrementa a cada "{" lido e decrementa a cada "}" lido
    let isComment = 0;
    let lista = [];
    let linha = 1;
    let coluna = 1;
    let ultimoComentario = { linha: 0, coluna: 0 }; // Armazena a linha e coluna do último comentário aberto
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
      // Se o caracter atual for o início do comentário, incrementa o bloco de comentário
      if (caracter == "{") {
        isComment++;
        ultimoComentario = { linha, coluna };
        continue;
      } else if (caracter == "}") {
        // Se o caracter atual for o final do comentário, decrementa o bloco de comentário
        if (isComment == 0) {
          throw new ErroLexico("lxl1", caracter, linha, coluna);
        }
        isComment--;
        continue;
      }

      // Se o bloco de comentário estiver ativo, ignora o caracter
      if (isComment > 0) {
        continue;
      } else {
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
            linha,
            coluna,
            lexema: tokenNum,
            simbolo: "Snumero",
          };
          lista.push(token);
          continue;
        }

        // Se o caracter for uma letra, trata como identificador ou palavra reservada
        if (caracter.match(/[a-zA-Z]/)) {
          let tokenId = "";
          // Enquanto for letra, "_" ou número
          while (caracter != undefined && caracter.match(/[a-zA-Z0-9_]/)) {
            tokenId += caracter;
            caracter = data[++i];
            coluna++;
          }
          // Volta um caracter para não perder o próximo caracter
          i--;
          coluna--;

          let token = {
            linha,
            coluna,
            lexema: tokenId,
            simbolo: this.identificaSimbolo(tokenId),
          };
          lista.push(token);
          continue;
        }

        // Se o caracter for ":" trata como atribuição ou dois pontos
        if (caracter == ":") {
          // Se o caracter seguinte for "=", trata como atribuição
          if (data[i + 1] == "=") {
            let token = {
              linha,
              coluna,
              lexema: ":=",
              simbolo: "Satribuicao",
            };
            lista.push(token);
            i++;
            continue;
          }
          // Se não, trata como dois pontos
          else {
            let token = {
              linha,
              coluna,
              lexema: ":",
              simbolo: "Sdoispontos",
            };
            lista.push(token);
            continue;
          }
        }

        // Se o caracter for "+", "-", "*" trata como operador aritmético
        if (caracter == "+" || caracter == "-" || caracter == "*") {
          let token;
          if (caracter == "+") {
            token = {
              linha,
              coluna,
              lexema: "+",
              simbolo: "Smais",
            };
          } else if (caracter == "-") {
            token = {
              linha,
              coluna,
              lexema: "-",
              simbolo: "Smenos",
            };
          } else if (caracter == "*") {
            token = {
              linha,
              coluna,
              lexema: "*",
              simbolo: "Smult",
            };
          }
          lista.push(token);
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
            // Se o caracter seguinte for "=", trata como operador relacional
            if (data[i + 1] == "=") {
              token = { linha, coluna, lexema: "!=", simbolo: "Sdiferente" };
              i++;
            } else {
              token = { linha, coluna, lexema: "!", simbolo: "Snao" };
            }
          } else if (caracter == "<") {
            // Se o caracter seguinte for "=", trata como operador relacional
            if (data[i + 1] == "=") {
              token = {
                linha,
                coluna,
                lexema: "<=",
                simbolo: "Smenorig",
              };
              i++;
            } else {
              token = {
                linha,
                coluna,
                lexema: "<",
                simbolo: "Smenor",
              };
            }
          } else if (caracter == ">") {
            // Se o caracter seguinte for "=", trata como operador relacional
            if (data[i + 1] == "=") {
              token = {
                linha,
                coluna,
                lexema: ">=",
                simbolo: "Smaiorig",
              };
              i++;
            } else {
              token = {
                linha,
                coluna,
                lexema: ">",
                simbolo: "Smaior",
              };
            }
          } else if (caracter == "=") {
            token = {
              linha,
              coluna,
              lexema: "=",
              simbolo: "Sigual",
            };
          }
          lista.push(token);
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
              linha,
              coluna,
              lexema: ";",
              simbolo: "Sponto_virgula",
            };
          } else if (caracter == ",") {
            token = {
              linha,
              coluna,
              lexema: ",",
              simbolo: "Svirgula",
            };
          } else if (caracter == "(") {
            token = {
              linha,
              coluna,
              lexema: "(",
              simbolo: "Sabre_parenteses",
            };
          } else if (caracter == ")") {
            token = {
              linha,
              coluna,
              lexema: ")",
              simbolo: "Sfecha_parenteses",
            };
          } else if (caracter == ".") {
            token = {
              linha,
              coluna,
              lexema: ".",
              simbolo: "Sponto",
            };
          }
          lista.push(token);
          continue;
        }

        throw new ErroLexico("lxl2", caracter, linha, coluna);
      }
    }

    // Se o bloco de comentário não estiver fechado, lança um erro
    if (isComment > 0) {
      throw new ErroLexico(
        "lxl3",
        undefined,
        ultimoComentario.linha,
        ultimoComentario.coluna
      );
    }

    if (lista.length == 0) {
      // Se não foi encontrado nenhum token, retorna uma lista somente com a localização do cursor
      lista.push({
        linha,
        coluna,
      });
    }
    return lista;
  }

  identificaSimbolo(token) {
    /**
     * Identifica o símbolo do token
     * @param {string} token
     * @returns {string} simbolo
     * @default "Sidentificador"
     */
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
  proximoToken() {
    /**
     * Retorna o próximo token da lista de tokens ou o ultimo token lido com sucesso
     * Atualiza o token atual e o ultimo token lido com sucesso
     * @returns {object} token
     * */

    if (this.listaToken.length == 0) {
      // Retorna simbolo de final de arquivo, que não é reconhecido pelo analisador sintático causando a falha,
      // Podemos futuramente tratar isso de outra forma, lançando um erro específico sobre, por exemplo
      this.tokenAtual = {
        simbolo: "Sfim_arquivo",
        lexema: "fim_arquivo",
        linha: this.tokenAtual.linha,
        coluna: this.tokenAtual.coluna,
      };
    } else this.tokenAtual = this.listaToken.shift();
    return this.tokenAtual;
  }
}

// Exporta o módulo
export default Lexico;
