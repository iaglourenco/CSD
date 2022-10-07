// Author: Iago Lourenço (iagojlourenco@gmail.com) / tabelaSimbolos.js

class TabelaSimbolos {
  constructor() {
    this.tabela = [];
    this.escopoAtual = "prog";
  }

  printTabela() {
    console.table(this.tabela);
  }

  pushSimbolo(lexema, tipo, memoria) {
    this.tabela.push({
      lexema,
      escopo: this.escopoAtual,
      tipo,
      memoria,
    });
    this.printTabela();
  }

  popSimbolo() {
    return this.tabela.pop();
  }

  colocaTipo(tipo) {
    for (let i = this.tabela.length - 1; i >= 0; i--) {
      if (
        this.tabela[i].tipo === "Svariavel" ||
        this.tabela[i].tipo === "Sfuncao"
      ) {
        this.tabela[i].tipo += " " + tipo;
      }
    }
    this.printTabela();
  }

  // Desempilha todos os simbolos até que o escopo mude, removendo assim os simbolos do escopo
  desempilhaEscopo() {
    while (this.tabela[this.tabela.length - 1].escopo == this.escopoAtual) {
      this.tabela.pop();
    }
    this.escopoAtual = this.tabela[this.tabela.length - 1].lexema;
    this.printTabela();
  }

  getSimbolos(lexema) {
    return this.tabela.filter((simbolo) => simbolo.lexema === lexema);
  }
}

export default TabelaSimbolos;
