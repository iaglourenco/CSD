// Author: Iago Lourenço (iagojlourenco@gmail.com) / sintatico.js

import { ErroSintatico } from "./erros.js";
import lexico from "./lexico.js";

// Lista de token gloval
let listaToken = [];
// Guarda o ultimo token lido com sucesso
let lastToken = null;

// Regras de produção:
function analisaBloco() {
  /**
   * <bloco>::= [<etapa de declaração de variáveis>]
   *            [<etapa de declaração de sub-rotinas>]
   *            <comandos>
   */
  let token = listaToken.shift() ?? lastToken;
  lastToken = token;
  analisaDeclaracaoVariaveis();
  analisaSubrotinas();
  analisaComandos();
}

function analisaDeclaracaoVariaveis() {}
function analisaSubrotinas() {}
function analisaComandos() {}

// Função de inicialização do sintático, a partir daqui todas as outras funções de análise são chamadas
function iniciar(data) {
  /**
   * Inicia o analisador sintático.
   * @param {string} data Código em LPD a ser analisado.
   * @returns {string} Código em LPD compilado e em linguagem de máquina.
   */

  // Inicia o analisador léxico
  listaToken = lexico.tokenizar(data);

  /**
   * Inicia o analisador sintático
   * <programa>::= programa <identificador> ; <bloco> .
   */

  // let rotulo = 1; // A ser usado pelo gerador de código
  // Desempilha o primeiro token
  let token = listaToken.shift();
  lastToken = token;
  if (token && token.simbolo == "Sprograma") {
    token = listaToken.shift() ?? lastToken;
    lastToken = token;
    if (token && token.simbolo == "Sidentificador") {
      // insereTabelaSimbolos(token.lexema, "nomeDePrograma","",""); /* Insere na tabela de simbolos */
      token = listaToken.shift() ?? lastToken;
      lastToken = token;
      if (token && token.simbolo == "Sponto_virgula") {
        // Chamada da função de análise do bloco
        analisaBloco();

        if (token && token.simbolo == "Sponto") {
          if (listaToken.length == 0) {
            // Caso não haja mais simbolos na lista de tokens, o código está correto
            return "Compilado com sucesso!";
          } else {
            // Caso haja mais simbolos na lista de tokens, apóes o ponto, lança um erro
            throw new ErroSintatico(
              "sxs1",
              token.lexema,
              token.linha,
              token.coluna
            );
          }
        }
      } else {
        throw new ErroSintatico(
          "sxs4",
          token.lexema,
          token.linha,
          token.coluna
        );
      }
    } else {
      throw new ErroSintatico("sxs3", token.lexema, token.linha, token.coluna);
    }
  } else {
    throw new ErroSintatico("sxs2", token.lexema, token.linha, token.coluna);
  }
}
const sintatico = {
  iniciar,
};
export default sintatico;
