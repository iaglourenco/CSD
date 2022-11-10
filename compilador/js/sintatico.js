// Author: Iago Lourenço (iagojlourenco@gmail.com) / sintatico.js

import { ErroSemantico, ErroSintatico } from "./erros.js";
import Gerador from "./gerador.js";
import Lexico from "./lexico.js";
import Semantico from "./semantico.js";
import TabelaSimbolos from "./tabelaSimbolos.js";

let lexico = new Lexico("");
let semantico = new Semantico([]);
let tabelaSimbolos = new TabelaSimbolos();
let gerador = new Gerador();
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
        gerador;
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
  let enderecoInicial = gerador.endereco;
  while (lexico.tokenAtual.simbolo != "Sdoispontos") {
    if (lexico.tokenAtual.simbolo == "Sidentificador") {
      // Pesquisa na tabela de simbolos se a variável já foi declarada
      if (!semantico.pesquisaIdentificador(lexico.tokenAtual.lexema)) {
        /* Insere na tabela de simbolos */
        tabelaSimbolos.pushSimbolo(
          lexico.tokenAtual.lexema,
          "Svariavel",
          gerador.proximoEndereco()
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
  gerador.ALLOC(enderecoInicial, gerador.endereco - enderecoInicial);
  lexico.proximoToken();
  analisaTipo();
}

function analisaSubrotinas() {
  /**
   * <etapa de declaração de sub-rotinas> ::= (<declaração de procedimento>;|<declaração de função>;)
   *                                          {<declaração de procedimento>;|<declaração de função>;}
   */
  let auxrot = 0;
  let flag = 0;

  if (
    lexico.tokenAtual.simbolo == "Sprocedimento" ||
    lexico.tokenAtual.simbolo == "Sfuncao"
  ) {
    auxrot = gerador.rotulo;
    gerador.JMP(gerador.rotulo); // Salto das subrotinas
    gerador.rotulo++;
    flag = 1;
  }

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
  if (flag === 1) {
    gerador.NULL(auxrot); // Inicio do programa principal
  }
}

function analisaDeclaracaoProcedimento() {
  /**
   * <declaração de procedimento> ::= procedimento <identificador>;<bloco>
   */
  lexico.proximoToken();
  if (lexico.tokenAtual.simbolo == "Sidentificador") {
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
      gerador.NULL(gerador.rotulo);
      tabelaSimbolos.pushSimbolo(
        lexico.tokenAtual.lexema,
        "Sprocedimento",
        gerador.rotulo
      );
      gerador.rotulo++;

      tabelaSimbolos.escopoAtual = lexico.tokenAtual.lexema;

      lexico.proximoToken();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        analisaBloco();
        const vars = tabelaSimbolos.countVarsEscopoAtual();
        if (vars > 0) {
          gerador.DALLOC(gerador.endereco - vars, vars);
          gerador.endereco -= vars;
        }
        gerador.RETURN();
      } else {
        throw new ErroSintatico(
          "stc4",
          lexico.tokenAtual.lexema,
          lexico.tokenAtual.linha,
          lexico.tokenAtual.coluna
        );
      }
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
      gerador.NULL(gerador.rotulo);
      tabelaSimbolos.pushSimbolo(
        lexico.tokenAtual.lexema,
        "Sfuncao",
        gerador.rotulo
      );
      gerador.rotulo++;

      // Adiciona marca/galho
      tabelaSimbolos.escopoAtual = lexico.tokenAtual.lexema;

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

  // Analisa o lado esquerdo da atribuição verificando se o identificador já foi declarado
  if (semantico.pesquisaTabela(lexico.ultimoTokenLido.lexema)) {
    let tokenEsquerda = lexico.ultimoTokenLido;
    lexico.proximoToken();
    analisaExpressao();
    const expPosFix = semantico.posFixa();
    // Verifica se os tipos são compatíveis
    if (semantico.comparaTipo(tokenEsquerda.lexema, expPosFix)) {
      // Verifica se o identificador é funcao
      if (tabelaSimbolos.getTipo(tokenEsquerda.lexema).includes("Sfuncao")) {
        // Se sim, a atribuição só é permitida se estiver no escopo da propria funcao
        if (tokenEsquerda.lexema != tabelaSimbolos.escopoAtual) {
          // Atribuição de funcao em outro escopo
          throw new ErroSemantico(
            "sem8",
            tokenEsquerda.lexema,
            tokenEsquerda.linha,
            tokenEsquerda.coluna
          );
        } else {
          gerador.geraPosFixo(expPosFix);

          gerador.STR(0); // Armazena o retorno da função
          // Desaloca as variaveis
          const vars = tabelaSimbolos.countVarsEscopoAtual();
          if (vars > 0) {
            gerador.DALLOC(gerador.endereco - vars, vars);
            gerador.endereco -= vars;
          }
          gerador.RETURN();
        }
      } else {
        // Gera código da expressão, caso não seja retorno de função
        gerador.geraPosFixo(expPosFix);
        gerador.STR(tabelaSimbolos.getMemoria(tokenEsquerda.lexema));
      }
    } else {
      // Tipo da expressão não é compatível com o tipo da variável
      throw new ErroSemantico(
        "sem5",
        tokenEsquerda.lexema,
        tokenEsquerda.linha,
        tokenEsquerda.coluna
      );
    }
  } else {
    // Identificador nao declarado
    throw new ErroSemantico(
      "sem2",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
    );
  }
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
    // Adiciona o token a pilha de expressao infixa
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
      simbolo: lexico.tokenAtual.simbolo + "u",
    });
    lexico.proximoToken();
  }
  analisaTermo();

  while (
    lexico.tokenAtual.simbolo == "Smais" ||
    lexico.tokenAtual.simbolo == "Smenos" ||
    lexico.tokenAtual.simbolo == "Sou"
  ) {
    // Adiciona o token a pilha de expressao infixa
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
  if (semantico.pesquisaTabela(lexico.ultimoTokenLido.lexema)) {
    gerador.CALL(tabelaSimbolos.getMemoria(lexico.ultimoTokenLido.lexema));
  } else {
    // Identificador não declarado
    throw new ErroSemantico(
      "sem2",
      lexico.ultimoTokenLido.lexema,
      lexico.ultimoTokenLido.linha,
      lexico.ultimoTokenLido.coluna
    );
  }
}

function analisaChamadaFuncao() {
  /**
   * <chamada de função>::= <identificador>
   */
  if (lexico.tokenAtual.simbolo == "Sidentificador") {
    if (semantico.pesquisaTabela(lexico.tokenAtual.lexema)) {
      // Gera código?
      semantico.pushExpressaoInfixa(lexico.tokenAtual);
    } else {
      // Identificador não declarado
      throw new ErroSemantico(
        "sem2",
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
  lexico.proximoToken();
}

function analisaComandoCondicional() {
  /**
   * <comando condicional>::= se <expressão>
   *                             entao <comando>
   *                             [senao <comando>]
   */

  let auxrot = gerador.rotulo;
  let auxrot2 = 0;

  lexico.proximoToken();
  let tokenSe = lexico.ultimoTokenLido;
  analisaExpressao();
  const expPosFix = semantico.posFixa();
  if (semantico.analisar(expPosFix) != "booleano") {
    throw new ErroSemantico(
      "sem7",
      tokenSe.lexema,
      tokenSe.linha,
      tokenSe.coluna
    );
  }
  gerador.geraPosFixo(expPosFix);
  if (lexico.tokenAtual.simbolo == "Sentao") {
    gerador.JMPF(auxrot);
    gerador.rotulo++;

    lexico.proximoToken();
    analisaComandoSimples();
    if (lexico.tokenAtual.simbolo == "Ssenao") {
      auxrot2 = gerador.rotulo;
      gerador.rotulo++;
      gerador.JMP(auxrot2);
      gerador.NULL(auxrot);

      lexico.proximoToken();
      analisaComandoSimples();
      gerador.NULL(auxrot2);
    } else {
      gerador.NULL(auxrot);
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
    // Adiciona o token a pilha de expressao infixa
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
    analisaFator();
  }
}

function analisaComandoEnquanto() {
  /**
   * <comando enquanto> ::= enquanto <expressão> faca <comando>
   */

  let auxrot1 = gerador.rotulo;
  let auxrot2 = 0;

  gerador.NULL(gerador.rotulo);
  gerador.rotulo++;

  lexico.proximoToken();
  let tokenEnquanto = lexico.ultimoTokenLido;
  analisaExpressao();
  const expPosFix = semantico.posFixa();

  if (semantico.analisar(expPosFix) != "booleano") {
    throw new ErroSemantico(
      "sem7",
      tokenEnquanto.lexema,
      tokenEnquanto.linha,
      tokenEnquanto.coluna
    );
  }
  gerador.geraPosFixo(expPosFix);
  if (lexico.tokenAtual.simbolo == "Sfaca") {
    auxrot2 = gerador.rotulo;
    gerador.rotulo++;
    gerador.JMPF(auxrot2);

    lexico.proximoToken();
    analisaComandoSimples();

    gerador.JMP(auxrot1);
    gerador.NULL(auxrot2);
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
        if (
          tabelaSimbolos.getTipo(lexico.tokenAtual.lexema) ==
          "Svariavel Sinteiro"
        ) {
          gerador.RD();
          gerador.STR(tabelaSimbolos.getMemoria(lexico.tokenAtual.lexema));
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
          // Identificador com tipo invalido
          throw new ErroSemantico(
            "sem3",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
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
        if (
          tabelaSimbolos
            .getTipo(lexico.tokenAtual.lexema)
            .includes("Svariavel Sinteiro") // Somente variaveis inteiras
        ) {
          gerador.LDV(tabelaSimbolos.getMemoria(lexico.tokenAtual.lexema));
        } else {
          // Identificador com tipo invalido, esperado inteiro
          throw new ErroSemantico(
            "sem6",
            lexico.tokenAtual.lexema,
            lexico.tokenAtual.linha,
            lexico.tokenAtual.coluna
          );
        }
        lexico.proximoToken();
        if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
          gerador.PRN();
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
        // Adiciona o token a pilha de expressao infixa
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
    // Adiciona o token a pilha de expressao infixa
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
  } else if (lexico.tokenAtual.simbolo == "Snao") {
    lexico.proximoToken();
    analisaFator();
  } else if (lexico.tokenAtual.simbolo == "Sabre_parenteses") {
    // Adiciona o token a pilha de expressao infixa
    semantico.pushExpressaoInfixa(lexico.tokenAtual);
    lexico.proximoToken();
    analisaExpressao();
    if (lexico.tokenAtual.simbolo == "Sfecha_parenteses") {
      // Adiciona o token a pilha de expressao infixa
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
    // Adiciona o token a pilha de expressao infixa
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
      gerador.START();
      gerador.ALLOC(gerador.proximoEndereco(), 1); // Aloca o retorno de funções

      lexico.proximoToken();
      if (lexico.tokenAtual.simbolo == "Sponto_virgula") {
        // Chamada da função de análise do bloco
        analisaBloco();

        if (lexico.tokenAtual.simbolo == "Sponto") {
          if (lexico.listaToken.length == 0) {
            // Caso não haja mais simbolos na lista de tokens, o código está correto
            // Desaloca a memoria
            const vars = tabelaSimbolos.countVarsEscopoAtual();
            if (vars > 0) {
              gerador.DALLOC(gerador.endereco - vars, vars);
              gerador.endereco -= vars;
            }
            gerador.DALLOC(0, 1); // Desaloca o retorno de funções
            gerador.HLT();
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

  // Inicia o gerador de código
  gerador = new Gerador(tabelaSimbolos);

  // Chamada da regra de entrada do sintático
  analisaPrograma();

  // Retorna o código em linguagem de montagem
  return gerador.getCodigo();
}
const sintatico = {
  iniciar,
};
export default sintatico;
