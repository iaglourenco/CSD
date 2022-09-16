// Author: Iago Lourenço (iagojlourenco@gmail.com) / sintatico.js

import { ErroSintatico } from "./erros.js";
import Lexico from "./lexico.js";

let lexico;

// Regras de produção:
function analisaBloco() {
  /**
   * <bloco>::= [<etapa de declaração de variáveis>]
   *            [<etapa de declaração de sub-rotinas>]
   *            <comandos>
   */
  lexico.proximoToken();
  analisaDeclaracaoVariaveis();
  analisaSubrotinas();
  analisaComandos();
}

function analisaDeclaracaoVariaveis() {
  /**
   * <etapa de declaração de variáveis>::= var <declaração de variáveis>;
   *                                      {<declaração de variáveis>;}
   */
  if (lexico.tokenAtual.simbolo == "Svar") {
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      analisaVariaveis();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        lexico.proximoToken();
      } else {
        throw new ErroSintatico(
          "sxs4",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      throw new ErroSintatico(
        "sxs3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  }
}
function analisaSubrotinas() {}
function analisaComandos() {}
function analisaTipo() {
  /**
   * <tipo> ::= (inteiro | booleano)
   */
  if (
    lexico.tokenAtual.simbolo != "Sinteiro" &&
    lexico.tokenAtual.simbolo != "Sbooleano"
  ) {
    throw new ErroSintatico(
      "sxs6",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  } else {
    // colocaTipo(lexico.tokenAtual.lexema);
    lexico.proximoToken();
  }
}
function analisaVariaveis() {
  /**
   *<declaração de variáveis>::= <identificador> {, <identificador>} : <tipo>
   */
  while (lexico.tokenAtual.simbolo != "Sdoispontos") {
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      // TODO condicional de duplicidade de variável
      // if(pesquisaVariavel(lexico.tokenAtual.lexema)){  /* Pesquisa na tabela de simbolos se a variável já foi declarada */

      //insereTabelaSimbolos(lexico.tokenAtual.lexema, "variavel", "", ""); /* Insere na tabela de simbolos */
      lexico.proximoToken();
      if (
        lexico.tokenAtual.simbolo == "Svirgula" ||
        lexico.tokenAtual.simbolo == "Sdoispontos"
      ) {
        if (lexico.tokenAtual.simbolo == "Svirgula") {
          lexico.proximoToken();
          if (lexico.tokenAtual.simbolo == "Sdoispontos") {
            // Lança um erro pois é esperado um identificador
            throw new ErroSintatico(
              "sxs3",
              lexico.tokenAtual.lexema,
              lexico.tokenAtual.linha,
              lexico.tokenAtual.coluna
            );
          }
        }
      } else {
        // Lança um erro pois é esperado o simbolo Sdoispontos ou Svirgula
        throw new ErroSintatico(
          "sxs5",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }

      // TODO Fim do condicional de duplicidade de variavel
      // }else{
      //   // Lança um erro pois a variável já foi declarada
      // ...
      // }
    } else {
      throw new ErroSintatico(
        "sxs3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  }
  lexico.proximoToken();
  analisaTipo();
}

// Função de inicialização do sintático, a partir daqui todas as outras funções de análise são chamadas
function iniciar(data) {
  /**
   * Inicia o analisador sintático.
   * @param {string} data Código em LPD a ser analisado.
   * @returns {string} Código em LPD compilado e em linguagem de máquina.
   */

  // Inicia o analisador léxico
  lexico = new Lexico(data);

  /**
   * Inicia o analisador sintático
   * <programa>::= programa <identificador> ; <bloco> .
   */

  // let rotulo = 1; // A ser usado pelo gerador de código
  // Desempilha o primeiro token
  lexico.proximoToken();

  if (lexico.tokenAtual && lexico.tokenAtual.simbolo == "Sprograma") {
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      // insereTabelaSimbolos(lexico.tokenAtual.lexema, "nomeDePrograma","",""); /* Insere na tabela de simbolos */
      lexico.proximoToken();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        // Chamada da função de análise do bloco
        analisaBloco();

        if (lexico.tokenAtual.simbolo == "Sponto") {
          if (lexico.listaToken.length == 0) {
            // Caso não haja mais simbolos na lista de tokens, o código está correto
            return "Compilado com sucesso!";
          } else {
            // Caso haja mais simbolos na lista de tokens, apóes o ponto, lança um erro
            throw new ErroSintatico(
              "sxs1",
              lexico.tokenAtual.lexema,
              lexico.tokenAtual.linha,
              lexico.tokenAtual.coluna
            );
          }
        }
      } else {
        throw new ErroSintatico(
          "sxs4",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      throw new ErroSintatico(
        "sxs3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else {
    throw new ErroSintatico(
      "sxs2",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
}
const sintatico = {
  iniciar,
};
export default sintatico;
