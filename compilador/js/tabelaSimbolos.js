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

  getTipo(lexema) {
    /**
     * Retorna o tipo do lexema
     */
    const simbolos = this.getSimbolos(lexema);
    if (simbolos.length > 0) {
      return simbolos[0].tipo;
    }
    return null;
  }

  // Desempilha todos os simbolos até que o escopo mude, removendo assim os simbolos do escopo
  desempilhaEscopo() {
    while (this.tabela[this.tabela.length - 1].escopo == this.escopoAtual) {
      this.tabela.pop();
    }
    this.escopoAtual = this.tabela[this.tabela.length - 1].escopo;
    this.printTabela();
  }

  getSimbolos(lexema) {
    return this.tabela.filter((simbolo) => simbolo.lexema === lexema);
  }
}

export default TabelaSimbolos;
