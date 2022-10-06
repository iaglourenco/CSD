// Author: Iago Lourenço (iagojlourenco@gmail.com) / tabelaSimbolos.js

class TabelaSimbolos {
  constructor() {
    this.tabela = [];
    this.escopoAtual = 0;
  }

  pushSimbolo(lexema, tipo, memoria) {
    this.tabela.push({
      lexema,
      escopo: this.escopoAtual,
      tipo,
      memoria,
    });
    console.table(this.tabela);
  }

  popSimbolo() {
    return this.tabela.pop();
  }

  getSimbolos(lexema) {
    return this.tabela.filter((simbolo) => simbolo.lexema === lexema);
  }
}

export default TabelaSimbolos;
