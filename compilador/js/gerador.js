// Author: Iago Lourenço (iagojlourenco@gmail.com) / gerador.js

class Gerador {
  constructor() {
    this.codigo = "";
    this.rotulo = 1;
    this.endereco = 0;
    this.alocacoes = [];
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
    this.alocacoes.push({ valor1, valor2 });
    this.codigo += `ALLOC ${valor1}, ${valor2}\n`;
  }
  DALLOC(valor1, valor2) {
    /**
     * Desaloca memória
     * Para k:=n-1 até 0
     * faça M[m+k]:=M[s]; s:=s-1
     */
    this.codigo += `DALLOC ${valor1}, ${valor2}\n`;
  }

  geraPosFixo(expressao) {
    /**
     * Gera o código de uma expressão em pós-fix
     */
  }

  START() {
    /**
     * Iniciar programa principal
     */
    this.codigo += "START\n";
  }

  LDV(valor) {
    /**
     * Carrega valor
     * s:=s+1 ; M[s]:=M[n]
     */
    this.codigo += `LDV ${valor}\n`;
  }
  LDC(valor) {
    /**
     * Carrega constante
     * s:=s + 1 ; M [s]: = k
     */
    this.codigo += `LDC ${valor}\n`;
  }
  HLT() {
    /**
     * Para a execução do programa
     */
    this.codigo += "HLT\n";
  }
  ADD() {
    /**
     * Somar
     * M[s-1]:=M[s-1]+M[s]; s:=s-1
     */
    this.codigo += "ADD\n";
  }
  SUB() {
    /**
     * Subtrair
     * M[s-1]:=M[s-1]-M[s]; s:=s-1
     */
    this.codigo += "SUB\n";
  }
  MULT() {
    /**
     * Multiplicar
     * M[s-1]:=M[s-1]*M[s]; s:=s-1
     */
    this.codigo += "MULT\n";
  }
  DIVI() {
    /**
     * Dividir
     * M[s-1]:=M[s-1] div M[s]; s:=s-1
     */
    this.codigo += "DIVI\n";
  }
  INV() {
    /**
     * Inverter
     * M[s]:= -M[s]
     */
    this.codigo += "INV\n";
  }
  AND() {
    /**
     * Conjunção
     * Se M[s-1] = 1 e M[s] = 1 então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "AND\n";
  }
  OR() {
    /**
     * Disjunção
     * Se M[s-1] = 1 ou M[s] = 1 então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "OR\n";
  }
  NEG() {
    /**
     * Negar
     * M[s]:= 1 - M[s]
     */
    this.codigo += "NEG\n";
  }
  CME() {
    /**
     * Menor que
     * Se M[s-1] < M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CME\n";
  }
  CMA() {
    /**
     * Maior que
     * Se M[s-1] > M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CMA\n";
  }
  CEQ() {
    /**
     * Igual
     * Se M[s-1] = M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CEQ\n";
  }
  CDIF() {
    /**
     * Diferente
     * Se M[s-1] <> M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CDIF\n";
  }
  CMEQ() {
    /**
     * Menor ou igual
     * Se M[s-1] <= M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CMEQ\n";
  }
  CMAQ() {
    /**
     * Maior ou igual
     * Se M[s-1] >= M[s] então M[s-1] := 1 senão M[s-1] := 0
     * s := s-1
     */
    this.codigo += "CMAQ\n";
  }
  STR(valor) {
    /**
     * Armazena valor
     * M[n]:=M[s]; s:=s-1
     */
    this.codigo += `STR ${valor}\n`;
  }
  JMP(rotulo) {
    /**
     * Desvio incondicional
     */
    this.codigo += `JMP L${rotulo}\n`;
  }
  JMPF(rotulo) {
    /**
     * Desvio se falso
     * Se M[s] = 0 então i:=p senão i:=i+1
     * s:=s-1
     */
    this.codigo += `JMPF L${rotulo}\n`;
  }
  NULL(rotulo) {
    /**
     * Nada
     */
    this.codigo += `L${rotulo} NULL\n`;
  }
  RD() {
    /**
     * Leitura
     * s:=s+1; M[s]:=leia()
     */
    this.codigo += `RD\n`;
  }
  PRN() {
    /**
     * Impressão
     * escreva(M[s]); s:=s-1
     */
    this.codigo += `PRN\n`;
  }

  CALL(rotulo) {
    /**
     * Chamada de procedimento ou função
     * s:=s+1; M[s]:=i+1; i:=p
     */
    this.codigo += `CALL L${rotulo}\n`;
  }
  RETURN() {
    /**
     * Retorno de procedimento ou função
     * i:=M[s]; s:=s-1
     */
    this.codigo += `RETURN\n`;
  }

  getCodigo() {
    /**
     * Retorna o código gerado
     */
    return this.codigo;
  }
}

export default Gerador;
