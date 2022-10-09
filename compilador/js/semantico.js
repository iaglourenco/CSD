// Author: Iago Lourenço (iagojlourenco@gmail.com) / semantico.js

import { ErroSemantico } from "./erros.js";

class Semantico {
  constructor(tabelaDeSimbolos) {
    this.tabelaDeSimbolos = tabelaDeSimbolos;
    this.expressaoInfixa = [];
  }

  pesquisaIdentificador(lexema) {
    /**
     * Verifica se o identificador está declarado no escopo atual
     */

    const simbolos = this.tabelaDeSimbolos
      .getSimbolos(lexema)
      .map((simbolo) => simbolo.escopo);
    return simbolos.includes(this.tabelaDeSimbolos.escopoAtual);
  }

  pesquisaTabela(lexema) {
    /**
     * Verifica se o identificador está declarado na tabela num escopo menor ou igual
     */

    const simbolos = this.tabelaDeSimbolos.getSimbolos(lexema);
    return simbolos.length > 0;
  }

  // Adiciona o token na expressão que sera avaliada posteriormente
  pushExpressaoInfixa(token) {
    this.expressaoInfixa.push(token);
  }

  //Converte a expressão infixa previamente construida para pos fixa
  posFixa() {
    const expressao = this.expressaoInfixa;
    let pilha = [];
    let saida = [];
    let precedencia = {
      "+u": 7,
      "-u": 7,
      "*": 6,
      div: 6,
      "+": 5,
      "-": 5,
      ">": 4,
      ">=": 4,
      "<": 4,
      "<=": 4,
      "=": 4,
      "!=": 4,
      nao: 3,
      e: 2,
      ou: 1,
    };
    for (let i = 0; i < expressao.length; i++) {
      try {
        switch (expressao[i].simbolo) {
          case "Sidentificador":
          case "Snumero":
            saida.push(expressao[i].lexema);
            break;
          case "Sabre_parenteses":
            pilha.push(expressao[i]);
            break;
          case "Sfecha_parenteses":
            while (pilha[pilha.length - 1].simbolo != "Sabre_parenteses") {
              saida.push(pilha.pop().lexema);
            }
            pilha.pop();
            break;
          case "Smais":
          case "Smenos":
          case "Smult":
          case "Sdiv":
          case "Smaior":
          case "Smaiorig":
          case "Smenor":
          case "Smenorig":
          case "Sigual":
          case "Sdiferente":
          case "Snao":
          case "Se":
          case "Sou":
            while (
              pilha.length > 0 &&
              precedencia[pilha[pilha.length - 1].lexema] >=
                precedencia[expressao[i].lexema]
            ) {
              saida.push(pilha.pop().lexema);
            }
            pilha.push(expressao[i]);
            break;
        }
      } catch (e) {
        throw new ErroSemantico(
          "sem4",
          expressao[0].linha,
          expressao[0].coluna
        );
      }
    }
    while (pilha.length > 0) {
      saida.push(pilha.pop().lexema);
    }

    // Limpa o buffer
    this.expressaoInfixa = [];
    return saida;
  }
}

export default Semantico;
