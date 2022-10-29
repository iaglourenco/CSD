// Author: Iago Lourenço (iagojlourenco@gmail.com) / semantico.js

import { ErroSemantico } from "./erros.js";

class Semantico {
  constructor(tabelaDeSimbolos) {
    //Referencia da tabela de simbolos
    this.tabelaDeSimbolos = tabelaDeSimbolos;
    // Guarda a expressão infixa que sera convertida ao chamar a funcao posFixa
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

  pushExpressaoInfixa(token) {
    /**
     * Adiciona o token na expressão que sera avaliada posteriormente
     */
    this.expressaoInfixa.push(token);
  }

  posFixa() {
    /**
     * Converte a expressão infixa previamente construida para pos fixa
     * Retorna a lista de tokens em pos fixa
     * Ideia base do algoritmo dada pelo Prof. Ricardo Freitas
     */
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
          case "Sfalso":
          case "Sverdadeiro":
            saida.push(expressao[i]);
            break;
          case "Sabre_parenteses":
            pilha.push(expressao[i]);
            break;
          case "Sfecha_parenteses":
            // Desempilha até achar o abre parenteses
            while (pilha[pilha.length - 1].simbolo != "Sabre_parenteses") {
              saida.push(pilha.pop());
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
            // Verifica a precedencia dos simbolos na pilha
            // Desempilhando na saida até encontrar uma maior ou igual
            while (
              pilha.length > 0 &&
              precedencia[pilha[pilha.length - 1].lexema] >=
                precedencia[expressao[i].lexema]
            ) {
              saida.push(pilha.pop());
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
    // Desempilha o restante
    while (pilha.length > 0) {
      saida.push(pilha.pop());
    }

    // Limpa o buffer
    this.expressaoInfixa = [];

    return saida;
  }

  analisar(posFixo) {
    /**
     * Faz a analise semantica da expressão em pos fixo e retorna o tipo
     */
    const aritmeticos = ["*", "div", "+", "-"];
    const relacionais = [">", ">=", "<", "<=", "=", "!="];
    const logicos = ["nao", "e", "ou"];
    const unarios = ["+u", "-u"];

    // Pilha de tipos
    // Converte todo simbolo para seu respectivo tipo
    let pilha = posFixo.map((token) => {
      if (token.simbolo == "Snumero") {
        // Numeros são sempre tipo inteiro
        return { ...token, tipo: "inteiro" };
      } else if (token.simbolo == "Sidentificador") {
        // Consulta a tabela de simbolos quanto ao tipo do identificador
        if (this.tabelaDeSimbolos.getTipo(token.lexema).includes("inteiro"))
          return { ...token, tipo: "inteiro" };
        else if (
          this.tabelaDeSimbolos.getTipo(token.lexema).includes("booleano")
        )
          return { ...token, tipo: "booleano" };
        else return { ...token, tipo: "erro" }; // Nunca chegará aqui está aqui por segurança e tratamento de possivel erro
      } else if (token.simbolo == "Sverdadeiro" || token.simbolo == "Sfalso") {
        // Simbolo de booleano
        return { ...token, tipo: "booleano" };
      } else if (
        aritmeticos.includes(token.lexema) ||
        relacionais.includes(token.lexema) ||
        logicos.includes(token.lexema) ||
        unarios.includes(token.lexema)
      ) {
        // Caso seja algum operador somente passa adiante
        return { ...token, tipo: token.lexema };
      }
    });

    // Percorre toda a lista de tipo construida anteriormente
    for (let i = 0; i < pilha.length; i++) {
      // I + I => I
      if (aritmeticos.includes(pilha[i].tipo)) {
        if (pilha[i - 2].tipo == "inteiro" && pilha[i - 1].tipo == "inteiro") {
          pilha[i - 2].tipo = "inteiro"; // Substituição da expressão pelo tipo do retorno da mesma
          pilha.splice(i - 1, 2); // Remoção dos simbolos que foram substituido pelo tipo do resultado da expressão
          i -= 2;
        } else {
          if (pilha[i - 2].tipo != "inteiro")
            // Esperado inteiro no lado esquerdo
            throw new ErroSemantico(
              "sem6",
              pilha[i - 2].lexema,
              pilha[i - 2].linha,
              pilha[i - 2].coluna
            );
          else {
            // Esperado inteiro no lado direito
            throw new ErroSemantico(
              "sem6",
              pilha[i - 1].lexema,
              pilha[i - 1].linha,
              pilha[i - 1].coluna
            );
          }
        }
        // I + I => B
      } else if (relacionais.includes(pilha[i].tipo)) {
        if (pilha[i - 2].tipo == "inteiro" && pilha[i - 1].tipo == "inteiro") {
          pilha[i - 2].tipo = "booleano"; // Substituição da expressão pelo tipo do retorno da mesma
          pilha.splice(i - 1, 2); // Remoção dos simbolos que foram substituido pelo tipo do resultado da expressão
          i -= 2;
        } else {
          if (pilha[i - 2].tipo != "inteiro")
            // Esperado inteiro no lado esquerdo
            throw new ErroSemantico(
              "sem6",
              pilha[i - 2].lexema,
              pilha[i - 2].linha,
              pilha[i - 2].coluna
            );
          else {
            // Esperado inteiro no lado direito
            throw new ErroSemantico(
              "sem6",
              pilha[i - 1].lexema,
              pilha[i - 1].linha,
              pilha[i - 1].coluna
            );
          }
        }
        // B + B => B
      } else if (logicos.includes(pilha[i].tipo)) {
        if (
          pilha[i - 2].tipo == "booleano" &&
          pilha[i - 1].tipo == "booleano"
        ) {
          pilha[i - 2].tipo = "booleano"; // Substituição da expressão pelo tipo do retorno da mesma
          pilha.splice(i - 1, 2); // Remoção dos simbolos que foram substituido pelo tipo do resultado da expressão
          i -= 2;
        } else {
          if (pilha[i - 2].tipo != "booleano")
            // Esperado booleano no lado esquerdo
            throw new ErroSemantico(
              "sem7",
              pilha[i - 2].lexema,
              pilha[i - 2].linha,
              pilha[i - 2].coluna
            );
          else {
            // Esperado booleano no lado direito
            throw new ErroSemantico(
              "sem7",
              pilha[i - 1].lexema,
              pilha[i - 1].linha,
              pilha[i - 1].coluna
            );
          }
        }
        // I => I
      } else if (unarios.includes(pilha[i].tipo)) {
        if (pilha[i - 1].tipo == "inteiro") {
          pilha[i - 1].tipo = "inteiro"; // Substituição da expressão pelo tipo do retorno da mesma
          pilha.splice(i, 1); // Remoção dos simbolos que foram substituido pelo tipo do resultado da expressão
          i -= 1;
        } else {
          // Esperado inteiro
          throw new ErroSemantico(
            "sem6",
            pilha[i - 1].lexema,
            pilha[i - 1].linha,
            pilha[i - 1].coluna
          );
        }
      }
    }

    // Retorna o tipo que ficou no final de toda a analise da expressão
    return pilha[0].tipo;
  }
}

export default Semantico;
