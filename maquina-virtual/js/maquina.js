// Author: Iago Lourenço (iagojlourenco@gmail.com) / maquina.js

export class Maquina {
  constructor(codigo, stdin, stdout, memoryListener, debugListener) {
    this.memoria = []; // Memória
    this.topo = -1; // Ponteiro de pilha
    this.pc = 0; // Contador de programa
    if (codigo.length > 0) this.instrucoes = this.loadInstrucoes(codigo);
    else throw new Error(`Entrada vazia`);

    this.stdout = stdout; // Saída padrão, função chamada quando o programa imprime algo
    this.stdin = stdin; // Entrada padrão, função chamada apos receber um input
    this.memoryListener = memoryListener; // Função chamada quando a memória é alterada
    this.debugListener = debugListener; // Função chamada quando o programa entra em modo debug

    this.isBreak = false; // Controla o estado de debug do programa
    this.breakpoints = []; // Linhas de interrupção
    this.memoryListener(this.memoria);
  }

  setDebugListener(debugListener) {
    this.debugListener = debugListener;
  }

  setMemoryListener(memoryListener) {
    this.memoryListener = memoryListener;
  }

  getLineFromLabel(label) {
    /**
     * Retorna a linha do programa que contem a label
     */
    for (var i = 0; i < this.instrucoes.length; i++) {
      if (
        this.instrucoes[i].nome == "NULL" &&
        this.instrucoes[i].label == label
      ) {
        return i;
      }
    }
    return -1;
  }

  loadInstrucoes(codigo) {
    /**
     * Parseia o código e retorna um array de instruções
     */
    var instrucoes = [];
    var linhas = codigo.split("\n");
    for (var j = 0; j < linhas.length; j++) {
      var linha = linhas[j];
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
    this.pc = this.pc == -1 ? 0 : this.pc;
    while (this.pc != -1) {
      this.next();
    }
    this.stop();
  }

  debug() {
    /**
     * Executa até a próxima linha de interrupção
     * ou até o programa acabar
     */
    this.pc = this.pc == -1 ? 0 : this.pc;
    this.isBreak = this.breakpoints.includes(this.pc);

    while (this.pc != -1 && !this.isBreak) {
      this.next();
      this.isBreak = this.breakpoints.includes(this.pc);
    }

    if (this.isBreak) this.debugListener(this.pc);
  }

  resume() {
    /**
     * Continua a execução do programa
     * a partir da linha de interrupção
     * atual
     * */
    this.isBreak = false;
    this.debug();
  }

  next() {
    /**
     * Executa a próxima instrução
     */
    let instrucao = this.instrucoes[this.pc];
    instrucao.executar(this, instrucao);
    if (this.isBreak) this.debugListener(this.pc);
  }

  stop() {
    /**
     * Para o programa
     */
    this.pc = -1;
    this.isBreak = false;
    this.memoria = [];
    this.topo = -1;
    this.debugListener(this.pc);
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
    /**
     * Leitura
     * topo:=topo+1; M[topo]:=leia()
     */
    nome: "RD",
    tipo: 0, // Sem parametro
    descricao: () => "Lê um valor do teclado para o topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.topo++;
      maquina.memoria[maquina.topo] = parseInt(prompt("Digite um valor:"));
      maquina.memoryListener(maquina.memoria);
      maquina.stdin(maquina.memoria[maquina.topo]);
      maquina.pc++;
    },
  },
  PRN: {
    /**
     * Impressão
     * escreva(M[topo]); topo:=topo-1
     */
    nome: "PRN",
    tipo: 0, // Sem parametro
    descricao: () => "Imprime o topo da pilha na tela",
    executar: (maquina, instrucao) => {
      maquina.stdout(maquina.memoria[maquina.topo]);
      maquina.topo--;
      maquina.memoria.pop();
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
     * faça M[m+k]:=M[topo]; topo:=topo-1
     */
    nome: "DALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Desaloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executar: (maquina, instrucao) => {
      let m = parseInt(instrucao.params[0]);
      let n = parseInt(instrucao.params[1]);

      for (let i = n - 1; i >= 0; i--) {
        maquina.memoria[m + i] = maquina.memoria[maquina.topo];
        maquina.topo--;
        maquina.memoria.pop();
      }
      maquina.memoryListener(maquina.memoria);
      maquina.pc++;
    },
  },
  ALLOC: {
    /**
     * Aloca memória
     * topo:=topo+m
     */
    nome: "ALLOC",
    tipo: 2, // Tem 2 parametros no final, separados por virgula ou espaço
    descricao: (ins) =>
      `Aloca ${ins.params[1]} espaços de memória a partir de ${ins.params[0]}`,
    executar: (maquina, instrucao) => {
      let m = parseInt(instrucao.params[0]);
      let n = parseInt(instrucao.params[1]);

      for (let i = 0; i < n; i++) {
        maquina.topo++;
        maquina.memoria[maquina.topo] = maquina.memoria[m + i] ?? undefined;
        maquina.memoria[m + i] = undefined;
      }
      maquina.memoryListener(maquina.memoria);
      maquina.pc++;
    },
  },

  CALL: {
    /**
     * Chamada de procedimento ou função
     * topo:=topo+1; M[topo]:=pc+1; pc:=p
     */
    nome: "CALL",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Chama uma função/procedimento no label ${ins.label}`,
    executar: (maquina, instrucao) => {
      maquina.topo++;
      maquina.memoria[maquina.topo] = maquina.pc + 1;
      maquina.memoryListener(maquina.memoria);
      maquina.pc = maquina.getLineFromLabel(instrucao.label);
    },
  },
  RETURN: {
    /**
     * Retorno de procedimento ou função
     * pc:=M[topo]; topo:=topo-1
     */
    nome: "RETURN",
    tipo: 0, // Sem parametro
    descricao: () => "Retorna de um procedimento ou função",
    executar: (maquina, instrucao) => {
      maquina.pc = maquina.memoria[maquina.topo];
      maquina.topo--;
      maquina.memoria.pop();
      maquina.pc++;
    },
  },
  LDC: {
    /**
     * Carrega constante
     * topo:=topo + 1 ; M [topo]: = k
     */
    nome: "LDC",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) => `Carrega o valor ${ins.params} no topo da pilha`,
    executar: (maquina, instrucao) => {
      maquina.topo++;
      maquina.memoria[maquina.topo] = parseInt(instrucao.params);
      maquina.memoryListener(maquina.memoria);
      maquina.pc++;
    },
  },
  LDV: {
    /**
     * Carrega valor
     * topo:=topo+1 ; M[topo]:=M[n]
     */
    nome: "LDV",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Carrega o valor da posição ${ins.params} da memória no topo da pilha`,
    executar: (maquina, instrucao) => {
      maquina.topo++;
      maquina.memoria[maquina.topo] =
        maquina.memoria[parseInt(instrucao.params)];
      maquina.memoryListener(maquina.memoria);
      maquina.pc++;
    },
  },
  STR: {
    /**
     * Armazena valor
     * M[n]:=M[topo]; topo:=topo-1
     */
    nome: "STR",
    tipo: 4, // Tem 1 parametro no final, sendo <numero>
    descricao: (ins) =>
      `Armazena o valor do topo da pilha na posição ${ins.params} da memória`,
    executar: (maquina, instrucao) => {
      maquina.memoria[parseInt(instrucao.params)] =
        maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);
      maquina.topo--;
      maquina.memoria.pop();
      maquina.pc++;
    },
  },
  JMP: {
    /**
     * Desvio incondicional
     * pc:=p
     */
    nome: "JMP",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) => `Salta para o label ${ins.label} incondicionalmente`,
    executar: (maquina, instrucao) => {
      maquina.pc = maquina.getLineFromLabel(instrucao.label);
    },
  },
  JMPF: {
    /**
     * Desvio se falso
     * Se M[topo] = 0 então pc:=p senão pc:=pc+1
     * topo:=topo-1
     */
    nome: "JMPF",
    tipo: 3, // Tem 1 parametro no final, sendo L<numero> ou <numero>
    descricao: (ins) =>
      `Salta para o label ${ins.label} se o topo da pilha for igual a 0`,
    executar: (maquina, instrucao) => {
      if (maquina.memoria[maquina.topo] == 0) {
        maquina.pc = maquina.getLineFromLabel(instrucao.label);
      } else {
        maquina.pc++;
      }
      maquina.topo--;
      maquina.memoria.pop();
    },
  },
  ADD: {
    /**
     * Somar
     * M[topo-1]:=M[topo-1]+M[topo]; topo:=topo-1
     */
    nome: "ADD",
    tipo: 0, // Sem parametro
    descricao: () => "Soma os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] + maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  SUB: {
    /**
     * Subtrair
     * M[topo-1]:=M[topo-1]-M[topo]; topo:=topo-1
     */
    nome: "SUB",
    tipo: 0, // Sem parametro
    descricao: () => "Subtrai os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] - maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  MULT: {
    /**
     * Multiplicar
     * M[topo-1]:=M[topo-1]*M[topo]; topo:=topo-1
     */
    nome: "MULT",
    tipo: 0, // Sem parametro
    descricao: () => "Multiplica os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] * maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  DIVI: {
    /**
     * Dividir
     * M[topo-1]:=M[topo-1] div M[topo]; topo:=topo-1
     */
    nome: "DIVI",
    tipo: 0, // Sem parametro
    descricao: () => "Divide os dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] = Math.floor(
        maquina.memoria[maquina.topo - 1] / maquina.memoria[maquina.topo]
      );
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  INV: {
    /**
     * Inverter
     * M[topo]:= -M[topo]
     */
    nome: "INV",
    tipo: 0, // Sem parametro
    descricao: () => "Inverte o sinal do valor do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo] = -maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  AND: {
    /**
     * Conjunção
     * Se M[topo-1] = 1 e M[topo] = 1 então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "AND",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o AND lógico dos dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo] =
        maquina.memoria[maquina.topo - 1] & maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  OR: {
    /**
     * Disjunção
     * Se M[topo-1] = 1 ou M[topo] = 1 então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "OR",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o OR lógico dos dois valores do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] | maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  NEG: {
    /**
     * Negar
     * M[topo]:= 1 - M[topo]
     */
    nome: "NEG",
    tipo: 0, // Sem parametro
    descricao: () => "Faz o NOT lógico do valor do topo da pilha",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo] = 1 - maquina.memoria[maquina.topo];
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  CME: {
    /**
     * Menor que
     * Se M[topo-1] < M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CME",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor que o valor do topo - 1",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] < maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);
      maquina.pc++;
    },
  },
  CMA: {
    /**
     * Maior que
     * Se M[topo-1] > M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CMA",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior que o valor do topo - 1",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] > maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  CEQ: {
    /**
     * Igual
     * Se M[topo-1] = M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CEQ",
    tipo: 0, // Sem parametro
    descricao: () => "Compara se os dois valores do topo da pilha são iguais",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] === maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  CDIF: {
    /**
     * Diferente
     * Se M[topo-1] <> M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CDIF",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se os dois valores do topo da pilha são diferentes",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] !== maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  CMEQ: {
    /**
     * Menor ou igual
     * Se M[topo-1] <= M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CMEQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é menor ou igual ao valor do topo - 1",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] <= maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
  CMAQ: {
    /**
     * Maior ou igual
     * Se M[topo-1] >= M[topo] então M[topo-1] := 1 senão M[topo-1] := 0
     * topo := topo-1
     */
    nome: "CMAQ",
    tipo: 0, // Sem parametro
    descricao: () =>
      "Compara se o valor do topo da pilha é maior ou igual ao valor do topo - 1",
    executar: (maquina, instrucao) => {
      maquina.memoria[maquina.topo - 1] =
        maquina.memoria[maquina.topo - 1] >= maquina.memoria[maquina.topo]
          ? 1
          : 0;
      maquina.memoryListener(maquina.memoria);

      maquina.pc++;
    },
  },
};
