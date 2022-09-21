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

function analisaComandos() {
  /**
   * <comandos>::= inicio <comando>{;<comando>}[;] fim
   */
  if (lexico.tokenAtual.simbolo == "Sinicio") {
    lexico.proximoToken();
    analisaComandoSimples(); // PROBLEMA!?

    while (lexico.tokenAtual.simbolo != "Sfim") {
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo != "Sfim") {
          analisaComandoSimples();
        }
      } else {
        throw new ErroSintatico(
          "sxs4",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    }
    lexico.proximoToken();
  } else {
    throw new ErroSintatico(
      "sxs7",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
}

function analisaComandoSimples() {
  /**
   * <comando>::=  (<atribuição_chprocedimento>|
   *                         <comando condicional> |
   *                         <comando enquanto> |
   *                         <comando leitura> |
   *                         <comando escrita> |
   *                         <comandos>)
   */
  if (lexico.tokenAtual.simbolo == "Sidentificador") {
    analisaAtribuicaoChprocedimento();
  } else if (lexico.tokenAtual.simbolo == "Sse") {
    analisaComandoCondicional();
  } else if (lexico.tokenAtual.simbolo == "Senquanto") {
    analisaComandoEnquanto();
  } else if (lexico.tokenAtual.simbolo == "Sleia") {
    analisaComandoLeitura();
  } else if (lexico.tokenAtual.simbolo == "Sescreva") {
    analisaComandoEscrita();
  } else {
    analisaComandos();
  }
}

function analisaAtribuicaoChprocedimento() {
  /**
   * <atribuição_chprocedimento>::= (<comando atribuicao>|<chamada de procedimento>)
   */
  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Satribuicao") {
    analisaComandoAtribuicao();
  } else {
    analisaChamadaProcedimento();
  }
}

function analisaComandoAtribuicao() {
  /**
   * <comando atribuicao>::= identificador := <expressao>
   */
  lexico.proximoToken();
  analisaExpressao();
}
function analisaExpressao() {
  /**
   * <expressão>::= <expressão simples> [<operador relacional><expressão simples>]
   */
  analisaExpressaoSimples();
  if (
    lexico.tokenAtual.simbolo == "Smaior" ||
    lexico.tokenAtual.simbolo == "Smaior_igual" ||
    lexico.tokenAtual.simbolo == "Smenor" ||
    lexico.tokenAtual.simbolo == "Smenor_igual" ||
    lexico.tokenAtual.simbolo == "Sigual" ||
    lexico.tokenAtual.simbolo == "Sdiferente"
  ) {
    lexico.proximoToken();
    analisaExpressaoSimples();
  }
}
function analisaExpressaoSimples() {
  /**
   * <expressão simples> ::= [ + | - ] <termo> {( + | - | ou) <termo> }
   */
  if (
    lexico.tokenAtual.simbolo == "Smais" ||
    lexico.tokenAtual.simbolo == "Smenos"
  ) {
    lexico.proximoToken();
    analisaTermo();
  }
  while (
    lexico.tokenAtual.simbolo == "Smais" ||
    lexico.tokenAtual.simbolo == "Smenos" ||
    lexico.tokenAtual.simbolo == "Sou"
  ) {
    lexico.proximoToken();
    analisaTermo();
  }
}
function analisaChamadaProcedimento() {
  /**
   * <chamada de procedimento>::= <identificador>
   */
  lexico.proximoToken();
  // TODO: analisar chamada de procedimento
}
function analisaComandoCondicional() {
  /**
   * <comando condicional>::= se <expressão>
   *                             entao <comando>
   *                             [senao <comando>]
   */
  lexico.proximoToken();
  analisaExpressao();
  if (lexico.tokenAtual.simbolo == "Sentao") {
    lexico.proximoToken();
    analisaComandoSimples();
    if (lexico.tokenAtual.simbolo == "Ssenao") {
      lexico.proximoToken();
      analisaComandoSimples();
    }
  } else {
    throw new ErroSintatico(
      "sxs11",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
}
function analisaTermo() {
  /**
   * <termo>::= <fator> {(\* | div | e) <fator>}
   */
  analisaFator();
  while (
    lexico.tokenAtual.simbolo == "Smult" ||
    lexico.tokenAtual.simbolo == "Sdiv" ||
    lexico.tokenAtual.simbolo == "Se"
  ) {
    lexico.proximoToken();
    analisaFator();
  }
}

function analisaComandoEnquanto() {}

function analisaComandoLeitura() {}

function analisaComandoEscrita() {
  /**
   * <comando escrita> ::= escreva ( <identificador> )
   */
  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      // TODO: semantico
      if (/*pesquisaVariavelFuncao(lexico.tokenAtual.lexema) != null*/ true) {
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
          lexico.proximoToken();
        } else {
          // Fecha parenteses faltando
          throw new ErroSintatico(
            "sxs12",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
          );
        }
      } else {
        // Identificador não declarada
        throw new ErroSintatico(
          "sxs13",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    }
  }
}
function analisaFator() {
  /**
   * <fator> ::= (<variável> |
   *                 <número> |
   *                 <chamada de função> |
   *                 (<expressão>) | verdadeiro | falso |
   *                  nao <fator>)
   *
   */
  if (lexico.tokenAtual.simbolo == "Sidentificador") {
    //semantico
    // if (pesquisaTabela(lexico.tokenAtual.lexema, nível, ind)) {
    //   if (
    //     tabelaSimbolos[ind].tipo == "funcao int" ||
    //     tabelaSimbolos[ind].tipo == "funcao booleano"
    //   ) {
    //     analisaChamadaFuncao();
    //   }else lexico.proximoToken();
    // }
    // else{ ERRO}
  } else if (lexico.tokenAtual.simbolo == "Snumero") {
    lexico.proximoToken();
  } else if (lexico.tokenAtual.simbolo == "Snao") {
    lexico.proximoToken();
    analisaFator();
  } else if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    lexico.proximoToken();
    analisaExpressao();
    if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
      lexico.proximoToken();
    } else {
      throw new ErroSintatico(
        "sxs9",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else if (
    lexico.tokenAtual.simbolo == "Sverdadeiro" ||
    lexico.tokenAtual.simbolo == "Sfalso"
  ) {
    lexico.proximoToken();
  } else {
    throw new ErroSintatico(
      "sxs10",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
}

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

function analisaPrograma() {
  /**
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

// Função de inicialização do sintático
function iniciar(data) {
  /**
   * Inicia o analisador sintático, que orquestra a análise do código fonte chamando os outros módulos
   * @param {string} data Código em LPD a ser analisado.
   * @returns {string} Código em LPD compilado e em linguagem de máquina.
   */

  // Inicia o analisador léxico
  lexico = new Lexico(data);

  // Chamada da regra de entrada do sintático
  analisaPrograma();
}
const sintatico = {
  iniciar,
};
export default sintatico;
