// Author: Iago Lourenço (iagojlourenco@gmail.com) / maquina.js

export class Maquina {
  constructor(codigo) {
    this.m = []; // Memória
    this.s = 0; // Ponteiro de pilha
    this.pc = 0; // Contador de programa
    this.n = 0; // Tamanho da memória alocada
    if (codigo.length > 0) this.instrucoes = this.loadInstrucoes(codigo);
    // else throw new Error(`Entrada vazia`);

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
     * Executa o programa sem interrupções
     */
  }
  debug() {
    /**
     * Executa o programa com interrupções
     */
  }
}

// Instruções da máquina virtual LPD
export const INSTRUCOES = {
  START: {
    nome: "START",
    tipo: 0, // Sem parametro
    descricao: () => "Inicia o programa",
    executa: function (maquina) {
      maquina.pc++;
    },
  },
  NULL: {
    nome: "NULL",
    tipo: 1, // Pode ter label no inicio da linha, sendo L<numero> ou <numero>
    descricao: () => "Nada",
    executa: function (maquina) {
      maquina.pc++;
    },
  },
  RD: {
    nome: "RD",
    tipo: 0, // Sem parametro
    descricao: () => "Lê um valor do teclado para o topo da pilha",
    executa: function (maquina) {
      maquina.pc++;
    },
  },
  PRN: {
    nome: "PRN",
    tipo: 0, // Sem parametro
    descricao: () => "Imprime o topo da pilha na tela",
    executa: function (maquina) {
      maquina.pc++;
    },
  },
  HLT: {
    nome: "HLT",
    tipo: 0, // Sem parametro
    descricao: () => "Para a execução do programa",
    executa: function (maquina) {
      maquina.pc = -1;
    },
  },
  DALLOC: {
    nome: "DALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Desaloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executa: function (maquina) {
      for (let k = maquina.n - 1; k >= 0; k--) {
        maquina.m[maquina.m + k] = maquina.m[maquina.s];
        maquina.s = maquina.s - 1;
      }
      maquina.pc++;
    },
  },
  ALLOC: {
    nome: "ALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Aloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executa: function (maquina) {
      maquina.s = maquina.s + maquina.m;
      maquina.pc++;
    },
  },

  CALL: {
    nome: "CALL",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Chama uma função/procedimento no label ${ins.label}`,
    executa: function (maquina) {
      maquina.m[maquina.s] = maquina.pc + 1;
      maquina.s = maquina.s + 1;
      maquina.pc = maquina.m[maquina.pc + 1];
    },
  },
  RETURNF: {
    nome: "RETURNF",
    tipo: 2, // Sem parametro
    descricao: () => "Retorna de uma função",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.pc = maquina.m[maquina.s];
    },
  },
  RETURN: {
    nome: "RETURN",
    tipo: 0, // Sem parametro
    descricao: () => "Retorna de um procedimento",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.pc = maquina.m[maquina.s];
    },
  },
  LDC: {
    nome: "LDC",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) => `Carrega o valor ${ins.params} no topo da pilha`,
    executa: function (maquina) {
      maquina.m[maquina.s] = maquina.m[maquina.pc + 1];
      maquina.s = maquina.s + 1;
      maquina.pc = maquina.pc + 2;
    },
  },
  LDV: {
    nome: "LDV",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Carrega o valor da posição ${ins.params} da memória no topo da pilha`,
    executa: function (maquina) {
      maquina.m[maquina.s] = maquina.m[maquina.m[maquina.pc + 1]];
      maquina.s = maquina.s + 1;
      maquina.pc = maquina.pc + 2;
    },
  },
  STR: {
    nome: "STR",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Armazena o valor do topo da pilha na posição ${ins.params} da memória`,
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.m[maquina.pc + 1]] = maquina.m[maquina.s];
      maquina.pc = maquina.pc + 2;
    },
  },
  JMP: {
    nome: "JMP",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Salta para o label ${ins.label} incondicionalmente`,
    executa: function (maquina) {
      maquina.pc = maquina.m[maquina.pc + 1];
    },
  },
  JMPF: {
    nome: "JMPF",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) =>
      `Salta para o label ${ins.label} se o topo da pilha for igual a 0`,
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      if (maquina.m[maquina.s] == 0) {
        maquina.pc = maquina.m[maquina.pc + 1];
      } else {
        maquina.pc = maquina.pc + 2;
      }
    },
  },
  ADD: {
    nome: "ADD",
    tipo: 0, // Sem parametro
    descricao: () => "Soma os dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] + maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  SUB: {
    nome: "SUB",
    tipo: 0, // Sem parametro
    descricao: () => "Subtrai os dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] - maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  MULT: {
    nome: "MULT",
    tipo: 0, // Sem parametro
    descricao: () => "Multiplica os dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] * maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  DIVI: {
    nome: "DIVI",
    tipo: 0, // Sem parametro
    descricao: () => "Divide os dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] / maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  INV: {
    nome: "INV",
    tipo: 0, // Sem parametro
    descricao: () => "Inverte o sinal do valor do topo da pilha",
    executa: function (maquina) {
      maquina.m[maquina.s - 1] = -maquina.m[maquina.s - 1];
      maquina.pc++;
    },
  },
  AND: {
    nome: "AND",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o AND lógico dos dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] && maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  OR: {
    nome: "OR",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o OR lógico dos dois valores do topo da pilha",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] || maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  NEG: {
    nome: "NEG",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o NOT lógico do valor do topo da pilha",
    executa: function (maquina) {
      maquina.m[maquina.s - 1] = !maquina.m[maquina.s - 1];
      maquina.pc++;
    },
  },
  CME: {
    nome: "CME",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor que o valor do topo - 1",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] < maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  CMA: {
    nome: "CMA",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior que o valor do topo - 1",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] > maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  CEQ: {
    nome: "CEQ",
    tipo: 0, // Sem parametro
    descricao: () => "Compara se os dois valores do topo da pilha são iguais",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] == maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  CDIF: {
    nome: "CDIF",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se os dois valores do topo da pilha são diferentes",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] != maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  CMEQ: {
    nome: "CMEQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor ou igual ao valor do topo - 1",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] <= maquina.m[maquina.s];
      maquina.pc++;
    },
  },
  CMAQ: {
    nome: "CMAQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior ou igual ao valor do topo - 1",
    executa: function (maquina) {
      maquina.s = maquina.s - 1;
      maquina.m[maquina.s - 1] =
        maquina.m[maquina.s - 1] >= maquina.m[maquina.s];
      maquina.pc++;
    },
  },
};
