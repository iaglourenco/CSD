# Descrição BNF da Linguagem de Programação Simplificada

```
<programa>::= programa <identificador> ; <bloco> .

<bloco>::= [<etapa de declaração de variáveis>]
           [<etapa de declaração de sub-rotinas>]
           <comandos>
```

## DECLARAÇÕES

```

<etapa de declaração de variáveis>::= var <declaração de variáveis>;
                                         {<declaração de variáveis>;}

<declaração de variáveis>::= <identificador> {, <identificador>} : <tipo>

<tipo> ::= (inteiro | booleano)

<etapa de declaração de sub-rotinas> ::= (<declaração de procedimento>;|
                                          <declaração de função>;)
                                         {<declaração de procedimento>;|
                                          <declaração de função>;}

<declaração de procedimento> ::= procedimento <identificador>;
                                              <bloco>

<declaração de função> ::= funcao <identificador>: <tipo>;
                                                   <bloco>

```

## COMANDOS

```
<comandos>::= inicio
<comando>{;<comando>}[;]
fim

                         <comando>::=  (<atribuição_chprocedimento>|
                            <comando condicional> |
                            <comando enquanto> |
                            <comando leitura> |
                            <comando escrita> |
                            <comandos>)

<atribuição_chprocedimento>::= (<comando atribuicao>|
<chamada de procedimento>)

<comando atribuicao>::= <identificador> := <expressão>

<chamada de procedimento>::= <identificador>

<comando condicional>::= se <expressão>
entao <comando>
[senao <comando>]

<comando enquanto> ::= enquanto <expressão> faca <comando>

<comando leitura> ::= leia ( <identificador> )

<comando escrita> ::= escreva ( <identificador> )
```

## EXPRESSÕES

```
<expressão>::= <expressão simples> [<operador relacional><expressão simples>]

<operador relacional>::= (!= | = | < | <= | > | >=)

<expressão simples> ::= [ + | - ] <termo> {( + | - | ou) <termo> }

<termo>::= <fator> {(\* | div | e) <fator>}

<fator> ::= (<variável> |
<número> |
<chamada de função> |
(<expressão>) | verdadeiro | falso |
nao <fator>)

<variável> ::= <identificador>

<chamada de função> ::= <identificador >
```

## NÚMEROS E IDENTIFICADORES

```
<identificador> ::= <letra> {<letra> | <dígito> | \_ }

<número> ::= <dígito> {<dígito>}

<dígito> ::= (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)

<letra> ::= (a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|
A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)
```

## COMENTÁRIOS

Uma vez que os comentários servem apenas como documentação do código fonte, ao realizar
a compilação deste código faz-se necessário eliminar todo o conteúdo entre seus
delimitadores.

```
delimitadores : { }
```
