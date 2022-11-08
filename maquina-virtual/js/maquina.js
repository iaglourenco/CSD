// Author: Iago Lourenço (iagojlourenco@gmail.com) / maquina.js

export class Maquina {
  constructor(codigo, stdin, stdout, memoryListener) {
    this.m = []; // Memória
    this.s = 0; // Ponteiro de pilha
    this.pc = 0; // Contador de programa
    this.n = 0; // Tamanho da memória alocada
    if (codigo.length > 0) this.instrucoes = this.loadInstrucoes(codigo);
    else throw new Error(`Entrada vazia`);

    this.stdout = stdout; // Saída padrão, função chamada quando o programa imprime algo
    this.stdin = stdin; // Entrada padrão, função chamada apos receber um input
    this.memoryListener = memoryListener; // Função chamada quando a memória é alterada
    this.isBreak = false; // Controla o estado de debug do programa
    this.linha = 0; // Linha atual do programa
    this.breakpoints = []; // Linhas de interrupção
  }

  loadInstrucoes(codigo) {
    /**
     * Parseia o código e retorna um array de instruções
     */
    var instrucoes = [];
    var linhas = codigo.split("\n");
    for (var i = 0; i < linhas.length; i++) {
      var linha = linhas[i];
      for (let i in INSTRUCOES) {
        if (linha.includes(i)) {
          switch (INSTRUCOES[i].tipo) {
            case 0: // Sem parametros
              instrucoes.push({ ...INSTRUCOES[i], codigo: linha });
              break;
            case 1: //Pode ter label no inicio da linha, sendo L<numero> ou <numero>
              var label = linha.match(/L?\d+/);
              if (label) {
                instrucoes.push({
                  ...INSTRUCOES[i],
                  label: label[0],
                  codigo: linha,
                });
              } else {
                instrucoes.push({ ...INSTRUCOES[i], codigo: linha });
              }
              break;
            case 2: // Tem 2 parametros no final, separados por virgula ou espaço
              var params = linha.match(/(\d+,\d+)|(\d+ \d+)/);
              if (params) {
                instrucoes.push({
                  ...INSTRUCOES[i],
                  params: params[0].split(/,| /),
                  codigo: linha,
                });
              }
              break;
            case 3: // Tem 1 parametro no final, sendo L<numero> ou <numero>
              var label = linha.match(/L?\d+/);
              if (label) {
                instrucoes.push({
                  ...INSTRUCOES[i],
                  label: label[0],
                  codigo: linha,
                });
              }
              break;
            case 4: // Tem 1 parametro no final, sendo <numero>
              var param = linha.match(/\d+/);
              if (param) {
                instrucoes.push({
                  ...INSTRUCOES[i],
                  params: param[0],
                  codigo: linha,
                });
              }
              break;
          }
          break;
        }
      }
    }
    if (instrucoes.length == 0) {
      throw new Error("Nenhuma instrução detectada!");
    }
    return instrucoes;
  }

  executar() {
    /**
     * Executa o programa
     */
    while (this.pc != -1) {
      let instrucao = this.instrucoes[this.pc];
      instrucao.executar(this, instrucao);
    }
  }
}

// Instruções da máquina virtual LPD
export const INSTRUCOES = {
  START: {
    nome: "START",
    tipo: 0, // Sem parametro
    descricao: () => "Inicia o programa",
    executar: (maquina, instrucao) => {
      maquina.pc++;
    },
  },
  NULL: {
    nome: "NULL",
    tipo: 1, // Pode ter label no inicio da linha, sendo L<numero> ou <numero>
    descricao: () => "Nada",
    executar: (maquina, instrucao) => {
      maquina.pc++;
    },
  },
  RD: {
    nome: "RD",
    tipo: 0, // Sem parametro
    descricao: () => "Lê um valor do teclado para o topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.m[maquina.s] = parseInt(prompt("Digite um valor:"));
      maquina.stdin(maquina.m[maquina.s]);
      maquina.s++;
      maquina.pc++;
    },
  },
  PRN: {
    nome: "PRN",
    tipo: 0, // Sem parametro
    descricao: () => "Imprime o topo da pilha na tela",
    executar: (maquina, instrucao) => {
      maquina.stdout(maquina.m[maquina.s - 1]);
      maquina.pc++;
    },
  },
  HLT: {
    nome: "HLT",
    tipo: 0, // Sem parametro
    descricao: () => "Para a execução do programa",
    executar: (maquina, instrucao) => {
      maquina.pc = -1;
    },
  },
  DALLOC: {
    /**
     * Desaloca memória
     * Para k:=n-1 até 0
     * faça M[m+k]:=M[s]; s:=s-1
     */
    nome: "DALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Desaloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executar: (maquina, instrucao) => {},
  },
  ALLOC: {
    /**
     * Aloca memória
     * s:=s+m
     */
    nome: "ALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Aloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executar: (maquina, instrucao) => {},
  },

  CALL: {
    nome: "CALL",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Chama uma função/procedimento no label ${ins.label}`,
    executar: (maquina, instrucao) => {},
  },
  RETURN: {
    nome: "RETURN",
    tipo: 0, // Sem parametro
    descricao: () => "Retorna de um procedimento ou função",
    executar: (maquina, instrucao) => {},
  },
  LDC: {
    /**
     * Carrega constante
     * s:=s + 1 ; M [s]: = k
     */
    nome: "LDC",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) => `Carrega o valor ${ins.params} no topo da pilha`,
    executar: (maquina, instrucao) => {},
  },
  LDV: {
    /**
     * Carrega valor
     * s:=s+1 ; M[s]:=M[n]
     */
    nome: "LDV",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Carrega o valor da posição ${ins.params} da memória no topo da pilha`,
    executar: (maquina, instrucao) => {},
  },
  STR: {
    /**
     * Armazena valor
     * M[n]:=M[s]; s:=s-1
     */
    nome: "STR",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Armazena o valor do topo da pilha na posição ${ins.params} da memória`,
    executar: (maquina, instrucao) => {
      maquina.memoryListener(maquina.m);
    },
  },
  JMP: {
    nome: "JMP",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Salta para o label ${ins.label} incondicionalmente`,
    executar: (maquina, instrucao) => {},
  },
  JMPF: {
    nome: "JMPF",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) =>
      `Salta para o label ${ins.label} se o topo da pilha for igual a 0`,
    executar: (maquina, instrucao) => {},
  },
  ADD: {
    nome: "ADD",
    tipo: 0, // Sem parametro
    descricao: () => "Soma os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  SUB: {
    nome: "SUB",
    tipo: 0, // Sem parametro
    descricao: () => "Subtrai os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  MULT: {
    nome: "MULT",
    tipo: 0, // Sem parametro
    descricao: () => "Multiplica os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  DIVI: {
    nome: "DIVI",
    tipo: 0, // Sem parametro
    descricao: () => "Divide os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  INV: {
    nome: "INV",
    tipo: 0, // Sem parametro
    descricao: () => "Inverte o sinal do valor do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  AND: {
    nome: "AND",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o AND lógico dos dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  OR: {
    nome: "OR",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o OR lógico dos dois valores do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  NEG: {
    nome: "NEG",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o NOT lógico do valor do topo da pilha",
    executar: (maquina, instrucao) => {},
  },
  CME: {
    nome: "CME",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor que o valor do topo - 1",
    executar: (maquina, instrucao) => {},
  },
  CMA: {
    nome: "CMA",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior que o valor do topo - 1",
    executar: (maquina, instrucao) => {},
  },
  CEQ: {
    nome: "CEQ",
    tipo: 0, // Sem parametro
    descricao: () => "Compara se os dois valores do topo da pilha são iguais",
    executar: (maquina, instrucao) => {},
  },
  CDIF: {
    nome: "CDIF",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se os dois valores do topo da pilha são diferentes",
    executar: (maquina, instrucao) => {},
  },
  CMEQ: {
    nome: "CMEQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor ou igual ao valor do topo - 1",
    executar: (maquina, instrucao) => {},
  },
  CMAQ: {
    nome: "CMAQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior ou igual ao valor do topo - 1",
    executar: (maquina, instrucao) => {},
  },
};
