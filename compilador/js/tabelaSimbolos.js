// Author: Iago Lourenço (iagojlourenco@gmail.com) / tabelaSimbolos.js

class TabelaSimbolos {
  constructor() {
    this.tabela = [];
    this.escopoAtual = "prog";
  }

  printTabela() {
    /**
     * Função de depuração da tabela
     * Exibe todo o conteúdo
     */
    // console.table(this.tabela);
  }

  pushSimbolo(lexema, tipo, memoria) {
    /**
     * Insere um @simbolo na tabela
     */
    this.tabela.push({
      lexema,
      escopo: this.escopoAtual,
      tipo,
      memoria,
    });
    this.printTabela();
  }

  popSimbolo() {
    /**
     * Remove o ultimo símbolo inserido, como uma pilha
     */
    return this.tabela.pop();
  }

  colocaTipo(tipo) {
    /**
     * Insere o @param tipo encontrado até encontrar o lexema "var" ou "funcao"
     */
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

  getMemoria(lexema) {
    /**
     * Retorna o primeiro endereco de memoria encontrado do @param lexema
     */
    const simbolos = this.getSimbolos(lexema);
    return simbolos.length > 0 ? simbolos[0].memoria : null;
  }

  getTipo(lexema) {
    /**
     * Retorna o primeiro tipo do @param lexema
     * @returns {tipo|null}
     */
    const simbolos = this.getSimbolos(lexema);
    return simbolos.length > 0 ? simbolos[0].tipo : null;
  }

  desempilhaEscopo() {
    /**
     * Desempilha todos os simbolos até que o escopo mude, removendo assim os simbolos do escopo
     */
    while (this.tabela[this.tabela.length - 1].escopo == this.escopoAtual) {
      this.tabela.pop();
    }
    this.escopoAtual = this.tabela[this.tabela.length - 1].escopo;
    this.printTabela();
  }

  getSimbolos(lexema) {
    /**
     * Retorna todos os simbolos encontrado para o @param lexema
     */
    return (
      this.tabela.filter((simbolo) => simbolo.lexema === lexema).reverse() ?? []
    );
  }

  countVarsEscopoAtual() {
    /**
     * Retorna a quantidade de variaveis do escopo atual
     */
    return this.tabela.filter(
      (simbolo) =>
        simbolo.escopo === this.escopoAtual &&
        simbolo.tipo.includes("Svariavel")
    ).length;
  }
  countVars() {
    /**
     * Retorna a quantidade de variaveis de toda tabela
     */
    return this.tabela.filter((simbolo) => simbolo.tipo.includes("Svariavel"))
      .length;
  }
}

export default TabelaSimbolos;
