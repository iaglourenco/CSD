// Author: Iago Lourenço (iagojlourenco@gmail.com) / erros.js
// Classe de tratamento de erros

// Mensagens de erros dos analisadores
export const messages = {
  lxc1: "[LXC1] Erro léxico: } sem { correspondente",
  lxc2: "[LXC2] Erro léxico: Caractere inválido->",
  lxc3: "[LXC3] Erro léxico: Comentário não fechado",
  stc1: "[STC1] Erro sintático: Código após o ponto final",
  stc2: "[STC2] Erro sintático: Esperado simbolo 'programa'",
  stc3: "[STC3] Erro sintático: Esperado 'identificador'",
  stc4: "[STC4] Erro sintático: Esperado ';'",
  stc5: "[STC5] Erro sintático: Esperado ':'",
  stc6: "[STC6] Erro sintático: Tipo inválido",
  stc7: "[STC7] Erro sintático: Esperado 'inicio'",
  stc8: "[STC8] Erro sintático: Esperado 'fim'",
  stc9: "[STC9] Erro sintático: Parenteses não fechados",
  stc10: "[STC10] Erro sintático: Simbolo não esperado",
  stc11: "[STC11] Erro sintático: Esperado 'entao'",
  stc12: "[STC12] Erro sintático: Esperado ')' ",
  stc14: "[STC14] Erro sintático: Ponto final não encontrado",
  stc15: "[STC15] Erro sintático: Esperado 'faca'",
  stc16: "[STC16] Erro sintático: Esperado '('",
  sem1: "[SEM1] Erro semântico: Identificador já declarado no escopo atual->",
  sem2: "[SEM2] Erro semântico: Identificador não declarado->",
  sem3: "[SEM3] Erro semântico: Tipos incompatíveis",
  sem4: "[SEM4] Erro semântico: Expressão inválida",
};

export class ErroLexico extends Error {
  constructor(messageId, token, linha, coluna) {
    if (messageId == "lxc2")
      super(
        `${messages[messageId]} "${token}" na linha ${linha + 1} e coluna ${
          coluna + 1
        }`
      );
    else
      super(
        messages[messageId] + ` na linha ${linha + 1} e coluna ${coluna + 1}`
      );
    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}

export class ErroSintatico extends Error {
  constructor(messageId, token, linha, coluna) {
    super(
      messages[messageId] + ` na linha ${linha + 1} e coluna ${coluna + 1}`
    );
    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}

export class ErroSemantico extends Error {
  constructor(messageId, token, linha, coluna) {
    if (messageId == "sem1" || messageId == "sem2")
      super(
        `${messages[messageId]} "${token}" na linha ${linha + 1} e coluna ${
          coluna + 1
        }`
      );
    else
      super(
        messages[messageId] + ` na linha ${linha + 1} e coluna ${coluna + 1}`
      );

    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}
