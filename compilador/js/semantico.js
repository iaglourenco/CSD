// Author: Iago Lourenço (iagojlourenco@gmail.com) / semantico.js

class Semantico {
  constructor(tabelaDeSimbolos) {
    this.tabelaDeSimbolos = tabelaDeSimbolos;
  }

  pesquisaVariavelDuplicada(lexema) {
    /**
     * Verifica se a variável já foi declarada no escopo atual
     */
    const simbolos = this.tabelaDeSimbolos
      .getSimbolos(lexema)
      .map((simbolo) => simbolo.escopo);
    return !simbolos.includes(this.tabelaDeSimbolos.escopoAtual);
  }
}

export default Semantico;
