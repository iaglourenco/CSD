// Author: Iago Lourenço (iagojlourenco@gmail.com) / erros.js
// Classe de tratamento de erros

// Mensagens de erros dos analisadores
export const messages = {
  lxl1: "Erro léxico: } sem { correspondente",
  lxl2: "Erro léxico: Caractere inválido",
  lxl3: "Erro léxico: Comentário não fechado",
  sxs1: "Erro sintático: Código após o ponto final",
  sxs2: "Erro sintático: Esperado simbolo 'programa'",
  sxs3: "Erro sintático: Esperado 'identificador'",
  sxs4: "Erro sintático: Esperado ';'",
  sxs5: "Erro sintático: Esperado ':'",
  sxs6: "Erro sintático: Tipo de variável inválido",
  sxs7: "Erro sintático: Esperado 'inicio'",
  sxs8: "Erro sintático: Esperado 'fim'",
  sxs9: "Erro sintático: Parenteses não fechados",
  sxs10: "Erro sintático: Simbolo não esperado",
  sxs11: "Erro sintático: Esperado 'entao'",
  sxs12: "Erro sintático: Esperado ')' ",
  sxs13: "Erro sintático: Identificador não declarado",
};

export class ErroLexico extends Error {
  constructor(messageId, token, linha, coluna) {
    if (messageId == "lxl2")
      super(
        `${messages[messageId]} "${token}" na linha ${linha} e coluna ${coluna}`
      );
    else super(messages[messageId] + ` na linha ${linha} e coluna ${coluna}`);
    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}

export class ErroSintatico extends Error {
  constructor(messageId, token, linha, coluna) {
    super(messages[messageId] + ` na linha ${linha} e coluna ${coluna}`);
    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}

export class ErroSemantico extends Error {
  constructor(messageId, token, linha, coluna) {
    super(messages[messageId] + ` na linha ${linha} e coluna ${coluna}`);
    this.token = token;
    this.linha = linha;
    this.coluna = coluna;
  }
}
