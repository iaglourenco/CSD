// Author: Iago Lourenço (iagojlourenco@gmail.com) / gerador.js

class Gerador {
  constructor(tabelaSimbolos) {
    this.codigo = "";
    this.rotulo = 0;
    this.endereco = 0;
    this.tabelaSimbolos = tabelaSimbolos;
  }

  proximoEndereco() {
    /**
     * Retorna o próximo endereço de memória
     * @returns {Number}
     */
    return this.endereco++;
  }

  ALLOC(valor1, valor2) {
    /**
     * Aloca memória
     * s:=s+m
     */
    this.codigo += `\tALLOC ${valor1},${valor2}\n`;
  }
  DALLOC(valor1, valor2) {
    /**
     * Desaloca memória
     * Para k:=n-1 até 0
     * faça M[m+k]:=M[s]; s:=s-1
     */
    this.codigo += `\tDALLOC ${valor1},${valor2}\n`;
  }

  geraPosFixo(posFixa) {
    /**
     * Gera o código de uma expressão em pós-fix
     */
    for (let i = 0; i < posFixa.length; i++) {
      const token = posFixa[i];
      switch (token.simbolo) {
        case "Sidentificador":
          if (this.tabelaSimbolos.getTipo(token.lexema).includes("Sfuncao")) {
            this.CALL(this.tabelaSimbolos.getMemoria(token.lexema));
            this.LDV(0); // Armazena o retorno da função
          } else if (
            this.tabelaSimbolos.getTipo(token.lexema).includes("Svariavel")
          ) {
            this.LDV(this.tabelaSimbolos.getMemoria(token.lexema));
          }
          break;
        case "Snumero":
          this.LDC(token.lexema);
          break;
        case "Sverdadeiro":
          this.LDC(1);
          break;
        case "Sfalso":
          this.LDC(0);
          break;
        case "Smais":
          this.ADD();
          break;
        case "Smenos":
          this.SUB();
          break;
        case "Smenosu":
          this.INV();
          break;
        case "Smaisu":
          continue;
        case "Smult":
          this.MULT();
          break;
        case "Sdiv":
          this.DIVI();
          break;
        case "Se":
          this.AND();
          break;
        case "Snao":
          this.NEG();
          break;
        case "Smaior":
          this.CMA();
          break;
        case "Smenor":
          this.CME();
          break;
        case "Smaiorig":
          this.CMAQ();
          break;
        case "Smenorig":
          this.CMEQ();
          break;
        case "Sigual":
          this.CEQ();
          break;
        case "Sdiferente":
          this.CDIF();
          break;
        case "Sou":
          this.OR();
          break;
        default:
          break;
      }
    }
    return posFixa;
  }

  START() {
    /**
     * Iniciar programa principal
     */
    this.codigo += "\tSTART\n";
  }

  LDV(valor) {
    /**
     * Carrega valor
     * s:=s+1 ; M[s]:=M[n]
     */
    this.codigo += `\tLDV ${valor}\n`;
  }
  LDC(valor) {
    /**
     * Carrega constante
     * s:=s + 1 ; M [s]: = k
     */
    this.codigo += `\tLDC ${valor}\n`;
  }
  HLT() {
    /**
     * Para a execução do programa
     */
    this.codigo += "\tHLT\n";
  }
  ADD() {
    /**
     * Somar
     * M[s-1]:=M[s-1]+M[s]; s:=s-1
     */
    this.codigo += "\tADD\n";
  }
  SUB() {
    /**
     * Subtrair
     * M[s-1]:=M[s-1]-M[s]; s:=s-1
     */
    this.codigo += "\tSUB\n";
  }
  MULT() {
    /**
     * Multiplicar
     * M[s-1]:=M[s-1]*M[s]; s:=s-1
     */
    this.codigo += "\tMULT\n";
  }
  DIVI() {
    /**
     * Dividir
     * M[s-1]:=M[s-1] div M[s]; s:=s-1
     */
    this.codigo += "\tDIVI\n";
  }
  INV() {
    /**
     * Inverter
     * M[s]:= -M[s]
     */
    this.codigo += "\tINV\n";
  }
  AND() {
    /**
     * Conjunção
     * Se M[s-1] = 1 e M[s] = 1 então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tAND\n";
  }
  OR() {
    /**
     * Disjunção
     * Se M[s-1] = 1 ou M[s] = 1 então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tOR\n";
  }
  NEG() {
    /**
     * Negar
     * M[s]:= 1 - M[s]
     */
    this.codigo += "\tNEG\n";
  }
  CME() {
    /**
     * Menor que
     * Se M[s-1] < M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCME\n";
  }
  CMA() {
    /**
     * Maior que
     * Se M[s-1] > M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCMA\n";
  }
  CEQ() {
    /**
     * Igual
     * Se M[s-1] = M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCEQ\n";
  }
  CDIF() {
    /**
     * Diferente
     * Se M[s-1] <> M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCDIF\n";
  }
  CMEQ() {
    /**
     * Menor ou igual
     * Se M[s-1] <= M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCMEQ\n";
  }
  CMAQ() {
    /**
     * Maior ou igual
     * Se M[s-1] >= M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "\tCMAQ\n";
  }
  STR(valor) {
    /**
     * Armazena valor
     * M[n]:=M[s]; s:=s-1
     */
    this.codigo += `\tSTR ${valor}\n`;
  }
  JMP(rotulo) {
    /**
     * Desvio incondicional
     * i:=p
     */
    this.codigo += `\tJMP L${rotulo}\n`;
  }
  JMPF(rotulo) {
    /**
     * Desvio se falso
     * Se M[s] = 0 então i:=p senão i:=i+1
     * s:=s-1
     */
    this.codigo += `\tJMPF L${rotulo}\n`;
  }
  NULL(rotulo) {
    /**
     * Nada
     */
    this.codigo += `L${rotulo} \tNULL\n`;
  }
  RD() {
    /**
     * Leitura
     * s:=s+1; M[s]:=leia()
     */
    this.codigo += `\tRD\n`;
  }
  PRN() {
    /**
     * Impressão
     * escreva(M[s]); s:=s-1
     */
    this.codigo += `\tPRN\n`;
  }

  CALL(rotulo) {
    /**
     * Chamada de procedimento ou função
     * s:=s+1; M[s]:=i+1; i:=p
     */
    this.codigo += `\tCALL L${rotulo}\n`;
  }
  RETURN() {
    /**
     * Retorno de procedimento ou função
     * i:=M[s]; s:=s-1
     */
    this.codigo += `\tRETURN\n`;
  }

  getCodigo() {
    /**
     * Retorna o código gerado
     */
    return this.codigo;
  }
}

export default Gerador;
