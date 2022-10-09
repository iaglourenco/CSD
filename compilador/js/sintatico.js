// Author: Iago Lourenço (iagojlourenco@gmail.com) / sintatico.js

import { ErroSemantico, ErroSintatico } from "./erros.js";
import Lexico from "./lexico.js";
import Semantico from "./semantico.js";
import TabelaSimbolos from "./tabelaSimbolos.js";

let lexico;
let semantico = new Semantico([]);
let tabelaSimbolos = new TabelaSimbolos();

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
      while (lexico.tokenAtual.simbolo == "Sidentificador") {
        analisaVariaveis();
        if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
          lexico.proximoToken();
        } else {
          // Ponto e virgula esperado
          throw new ErroSintatico(
            "stc4",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
          );
        }
      }
    } else {
      // Identificador esperado
      throw new ErroSintatico(
        "stc3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  }
}

function analisaVariaveis() {
  /**
   *<declaração de variáveis>::= <identificador> {, <identificador>} : <tipo>
   */
  while (lexico.tokenAtual.simbolo != "Sdoispontos") {
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      // Pesquisa na tabela de simbolos se a variável já foi declarada
      if (!semantico.pesquisaIdentificador(lexico.tokenAtual.lexema)) {
        /* Insere na tabela de simbolos */
        tabelaSimbolos.pushSimbolo(
          lexico.tokenAtual.lexema,
          "Svariavel",
          "NOMEM"
        );
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
                "stc3",
                lexico.tokenAtual.lexema,
                lexico.tokenAtual.linha,
                lexico.tokenAtual.coluna
              );
            }
          }
        } else {
          // Lança um erro pois é esperado o simbolo Sdoispontos ou Svirgula
          throw new ErroSintatico(
            "stc5",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
          );
        }
      } else {
        // Lança um erro pois a variável já foi declarada
        throw new ErroSemantico(
          "sem1",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      throw new ErroSintatico(
        "stc3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  }
  lexico.proximoToken();
  analisaTipo();
}

function analisaSubrotinas() {
  /**
   * <etapa de declaração de sub-rotinas> ::= (<declaração de procedimento>;|<declaração de função>;)
   *                                          {<declaração de procedimento>;|<declaração de função>;}
   */
  // TODO: geracao de codigo

  while (
    lexico.tokenAtual.simbolo == "Sprocedimento" ||
    lexico.tokenAtual.simbolo == "Sfuncao"
  ) {
    if (lexico.tokenAtual.simbolo == "Sprocedimento") {
      analisaDeclaracaoProcedimento();
    } else {
      analisaDeclaracaoFuncao();
    }
    if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
      lexico.proximoToken();
    } else {
      throw new ErroSintatico(
        "stc4",
        lexico.ultimoTokenLido.lexema,
        lexico.ultimoTokenLido.linha,
        lexico.ultimoTokenLido.coluna
      );
    }
  }
}

function analisaDeclaracaoProcedimento() {
  /**
   * <declaração de procedimento> ::= procedimento <identificador>;<bloco>
   */

  lexico.proximoToken();

  if (lexico.tokenAtual.simbolo == "Sidentificador") {
    // TODO: semantico
    // Pesquisa na tabela de simbolos se o identificador já foi declarado
    // Se sim, lança um erro, senão adiciona na tabela de simbolos
    if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
      throw new ErroSemantico(
        "sem1",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    } else {
      tabelaSimbolos.pushSimbolo(
        lexico.tokenAtual.lexema,
        "Sprocedimento",
        "NOMEM"
      );

      //TODO: adicionar marca/galho
      tabelaSimbolos.escopoAtual = lexico.tokenAtual.lexema;
    }

    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
      analisaBloco();
    } else {
      throw new ErroSintatico(
        "stc4",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else {
    throw new ErroSintatico(
      "stc3",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
  // Desempilha o escopo
  tabelaSimbolos.desempilhaEscopo();
}

function analisaDeclaracaoFuncao() {
  /**
   * <declaração de função> ::= funcao <identificador>: <tipo>;<bloco>
   */

  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Sidentificador") {
    // TODO: semantico
    // Pesquisa na tabela de simbolos se o identificador já foi declarado
    // Se sim, lança um erro, senão adiciona na tabela de simbolos
    if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
      throw new ErroSemantico(
        "sem1",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    } else {
      tabelaSimbolos.pushSimbolo(lexico.tokenAtual.lexema, "Sfuncao", "NOMEM");

      // TODO: adicionar marca/galho
      tabelaSimbolos.escopoAtual = lexico.tokenAtual.lexema;
    }
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sdoispontos") {
      lexico.proximoToken();
      analisaTipo();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        analisaBloco();
      }
      /**  Reutilizei o analisaTipo aqui pois ele ja adiciona o tipo na tabela de simbolos
      if (
        lexico.tokenAtual.simbolo == "Sinteiro" ||
        lexico.tokenAtual.simbolo == "Sbooleano"
      ) {
        // TODO: semantico
        // Adicionar na tabela de simbolos o tipo da função
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
          analisaBloco();
        }
      } else {
        throw new ErroSintatico(
          "stc6",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
      */
    } else {
      throw new ErroSintatico(
        "stc5",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else {
    throw new ErroSintatico(
      "stc3",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }

  // Desempilha o escopo
  tabelaSimbolos.desempilhaEscopo();
}

function analisaComandos() {
  /**
   * <comandos>::= inicio <comando>{;<comando>}[;] fim
   */
  if (lexico.tokenAtual.simbolo == "Sinicio") {
    lexico.proximoToken();
    analisaComandoSimples();

    while (lexico.tokenAtual.simbolo != "Sfim") {
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo != "Sfim") {
          analisaComandoSimples();
        }
      } else {
        throw new ErroSintatico(
          "stc4",
          lexico.ultimoTokenLido.lexema,
          lexico.ultimoTokenLido.linha,
          lexico.ultimoTokenLido.coluna
        );
      }
    }
    lexico.proximoToken();
  } else {
    throw new ErroSintatico(
      "stc7",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
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
  //semantico.pushExpressaoInfixa(lexico.tokenAtual);
  analisaExpressao();
  semantico.posFixa();
}

function analisaExpressao() {
  /**
   * <expressão>::= <expressão simples> [<operador relacional><expressão simples>]
   */
  analisaExpressaoSimples();
  if (
    lexico.tokenAtual.simbolo == "Smaior" ||
    lexico.tokenAtual.simbolo == "Smaiorig" ||
    lexico.tokenAtual.simbolo == "Smenor" ||
    lexico.tokenAtual.simbolo == "Smenorig" ||
    lexico.tokenAtual.simbolo == "Sigual" ||
    lexico.tokenAtual.simbolo == "Sdiferente"
  ) {
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
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
    semantico.pushExpressaoInfixa({
      ...lexico.tokenAtual,

      lexema: lexico.tokenAtual.lexema + "u",
    });
    lexico.proximoToken();
  }
  analisaTermo();

  while (
    lexico.tokenAtual.simbolo == "Smais" ||
    lexico.tokenAtual.simbolo == "Smenos" ||
    lexico.tokenAtual.simbolo == "Sou"
  ) {
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
    analisaTermo();
  }
}

function analisaChamadaProcedimento() {
  /**
   * <chamada de procedimento>::= <identificador>
   */
  //lexico.proximoToken();
  // TODO: analisar chamada de procedimento
  if (semantico.pesquisaIdentificador(lexico.tokenAtual.lexema) == null) {
    throw new ErroSemantico(
      "sem2",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  }
}
function analisaChamadaFuncao() {
  /**
   * <chamada de função>::= <identificador>
   */
  lexico.proximoToken();
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
      "stc11",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
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
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
    analisaFator();
  }
}

function analisaComandoEnquanto() {
  /**
   * <comando enquanto> ::= enquanto <expressão> faca <comando>
   */
  // TODO: jumps criados na geração de código

  lexico.proximoToken();
  analisaExpressao();
  if (lexico.tokenAtual.simbolo == "Sfaca") {
    lexico.proximoToken();
    analisaComandoSimples();
  } else {
    throw new ErroSintatico(
      "stc15",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
    );
  }
}

function analisaComandoLeitura() {
  /**
   * <comando leitura>::= leia (identificador)
   */

  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
          lexico.proximoToken();
        } else {
          // Fecha parenteses faltando
          throw new ErroSintatico(
            "stc12",
            lexico.ultimoTokenLido.lexema,
            lexico.ultimoTokenLido.linha,
            lexico.ultimoTokenLido.coluna
          );
        }
      } else {
        // Identificador não declarada
        throw new ErroSemantico(
          "sem2",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      // Identificador faltando
      throw new ErroSintatico(
        "stc3",
        lexico.ultimoTokenLido.lexema,
        lexico.ultimoTokenLido.linha,
        lexico.ultimoTokenLido.coluna
      );
    }
  } else {
    // Abre parenteses faltando
    throw new ErroSintatico(
      "stc16",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
    );
  }
}

function analisaComandoEscrita() {
  /**
   * <comando escrita> ::= escreva ( <identificador> )
   */
  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    lexico.proximoToken();
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
          lexico.proximoToken();
        } else {
          // Fecha parenteses faltando
          throw new ErroSintatico(
            "stc12",
            lexico.ultimoTokenLido.lexema,
            lexico.ultimoTokenLido.linha,
            lexico.ultimoTokenLido.coluna
          );
        }
      } else {
        // Identificador não declarada
        throw new ErroSemantico(
          "sem2",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      // Identificador faltando
      throw new ErroSintatico(
        "stc3",
        lexico.ultimoTokenLido.lexema,
        lexico.ultimoTokenLido.linha,
        lexico.ultimoTokenLido.coluna
      );
    }
  } else {
    // Abre parenteses faltando

    throw new ErroSintatico(
      "stc16",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
    );
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
    if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
      // Pega o tipo dos simbolos com esse lexema
      const simb = tabelaSimbolos
        .getSimbolos(lexico.tokenAtual.lexema)
        .map((s) => s.tipo);
      if (
        simb.includes("Sfuncao Sinteiro") ||
        simb.includes("Sfuncao Sbooleano")
      ) {
        analisaChamadaFuncao();
      } else {
        semantico.pushExpressaoInfixa(lexico.tokenAtual);
        lexico.proximoToken();
      }
    } else {
      // Identificador não declarado
      throw new ErroSemantico(
        "sem2",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else if (lexico.tokenAtual.simbolo == "Snumero") {
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
  } else if (lexico.tokenAtual.simbolo == "Snao") {
    lexico.proximoToken();
    analisaFator();
  } else if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
    analisaExpressao();
    if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
      semantico.pushExpressaoInfixa(lexico.tokenAtual);
      lexico.proximoToken();
    } else {
      throw new ErroSintatico(
        "stc9",
        lexico.ultimoTokenLido.lexema,
        lexico.ultimoTokenLido.linha,
        lexico.ultimoTokenLido.coluna
      );
    }
  } else if (
    lexico.tokenAtual.simbolo == "Sverdadeiro" ||
    lexico.tokenAtual.simbolo == "Sfalso"
  ) {
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
  } else {
    throw new ErroSintatico(
      "stc10",
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
      "stc6",
      lexico.tokenAtual.lexema,
      lexico.tokenAtual.linha,
      lexico.tokenAtual.coluna
    );
  } else {
    tabelaSimbolos.colocaTipo(lexico.tokenAtual.simbolo);
    lexico.proximoToken();
  }
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
      tabelaSimbolos.escopoAtual = lexico.tokenAtual.lexema;
      /* Insere na tabela de simbolos */
      tabelaSimbolos.pushSimbolo(
        lexico.tokenAtual.lexema,
        "Snome_programa",
        undefined
      );

      lexico.proximoToken();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        // Chamada da função de análise do bloco
        analisaBloco();

        if (lexico.tokenAtual.simbolo == "Sponto") {
          if (lexico.listaToken.length == 0) {
            // Caso não haja mais simbolos na lista de tokens, o código está correto
            return "Compilado com sucesso!";
          } else {
            // Caso haja mais simbolos na lista de tokens, após o ponto, lança um erro
            throw new ErroSintatico(
              "stc1",
              lexico.tokenAtual.lexema,
              lexico.tokenAtual.linha,
              lexico.tokenAtual.coluna
            );
          }
        } else {
          throw new ErroSintatico(
            "stc14",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
          );
        }
      } else {
        throw new ErroSintatico(
          "stc4",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
    } else {
      throw new ErroSintatico(
        "stc3",
        lexico.tokenAtual.lexema,
        lexico.tokenAtual.linha,
        lexico.tokenAtual.coluna
      );
    }
  } else {
    throw new ErroSintatico(
      "stc2",
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
   * @returns {string} Código em LPD compilado e em linguagem de montagem.
   */

  // Inicia o analisador léxico
  lexico = new Lexico(data);

  // Inicia a tabela de símbolos
  tabelaSimbolos = new TabelaSimbolos();

  // Inicia o analisador semântico
  semantico = new Semantico(tabelaSimbolos);

  // Chamada da regra de entrada do sintático
  analisaPrograma();
}
const sintatico = {
  iniciar,
};
export default sintatico;
