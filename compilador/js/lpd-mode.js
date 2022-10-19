// Modified by: Iago Lourenço (iagojlourenco@gmail.com) / lpd-mode.js
// Modified based on pascal-mode.js

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object")
    // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    // AMD
    define(["../../lib/codemirror"], mod);
  // Plain browser env
  else mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("lpd", function () {
    function words(str) {
      var obj = {},
        words = str.split(" ");
      for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
      return obj;
    }
    var keywords = words(
      "var inicio fim se senao entao enquanto faca leia escreva e nao"
    );
    var atoms = {
      verdadeiro: true,
      falso: true,
      programa: true,
      inteiro: true,
      booleano: true,
      funcao: true,
      procedimento: true,
    };

    var isOperatorChar = /[+\-*&%=<>!?|\/]/;

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (ch == "#" && state.startOfLine) {
        stream.skipToEnd();
        return "meta";
      }
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (ch == "{") {
        state.tokenize = tokenCommentBraces;
        return tokenCommentBraces(stream, state);
      }
      if (/[\[\]\(\),;\:\.]/.test(ch)) {
        return null;
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return "operator";
      }
      stream.eatWhile(/[\w\$_]/);
      var cur = stream.current();
      if (keywords.propertyIsEnumerable(cur)) return "keyword";
      if (atoms.propertyIsEnumerable(cur)) return "atom";
      return "variable";
    }

    function tokenString(quote) {
      return function (stream, state) {
        var escaped = false,
          next,
          end = false;
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) {
            end = true;
            break;
          }
          escaped = !escaped && next == "\\";
        }
        if (end || !escaped) state.tokenize = null;
        return "string";
      };
    }

    function tokenCommentBraces(stream, state) {
      var ch;
      while ((ch = stream.next())) {
        if (ch == "}") {
          state.tokenize = null;
          break;
        }
      }
      return "comment";
    }

    // Interface

    return {
      startState: function () {
        return { tokenize: null };
      },

      token: function (stream, state) {
        if (stream.eatSpace()) return null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style == "comment" || style == "meta") return style;
        return style;
      },

      blockCommentStart: "{",
      blockCommentEnd: "}",
      closeBrackets: "(){}",
      electricChars: "{}",
      eletricInput: /^\s*(?:inicio|fim|\{|\})$/,
    };
  });

  CodeMirror.defineMIME("text/x-lpd", "lpd");
});
