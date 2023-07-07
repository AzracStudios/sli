import { get } from "svelte/store";
import { output } from "../store";
import { keywords, letters, numbers, specOp, specOpTT } from "./constants";

type TokenType =
  | "LBRACE"
  | "RBRACE"
  | "ASSIGN"
  | "COMMA"
  | "EQ"
  | "NEQ"
  | "GT"
  | "LT"
  | "LTE"
  | "GTE"
  | "PLUS"
  | "MINUS"
  | "MUL"
  | "DIV"
  | "UNION"
  | "INTERSECT"
  | "BELONGS"
  | "NOTBELONGS"
  | "SUBSET"
  | "NOTSUBSET"
  | "SUPERSET"
  | "NOTSUPERSET"
  | "IDENT"
  | "STRING"
  | "NUM"
  | "KWRD"
  | "NL";

class Position {
  idx: number;
  col: number;
  ln: number;

  constructor(idx: number, col: number, ln: number) {
    this.idx = idx;
    this.col = col;
    this.ln = ln;
  }

  advance(char?: string): Position {
    this.idx++;
    this.col++;
    if (char == "\n") {
      this.col = 0;
      this.ln++;
    }

    return this;
  }

  copy(): Position {
    return new Position(this.idx, this.col, this.ln);
  }
}

abstract class SLIError {
  msg: string;
  type: string;
  startPos: Position;
  endPos: Position;

  constructor(msg: string, type: string, startPos: Position, endPos: Position) {
    this.msg = msg;
    this.type = type;
    this.startPos = startPos;
    this.endPos = endPos;
  }

  asString(): string {
    return `${this.type} Error on line ${this.startPos.ln}: ${this.msg}`;
  }
}

class IllegalCharacterError extends SLIError {
  constructor(msg: string, startPos: Position) {
    super(`'${msg}'`, "Illegal Character", startPos, startPos.copy().advance());
  }
}

class SyntaxError extends SLIError {
  constructor(msg: string, startPos: Position, endPos: Position) {
    super(`${msg}`, "Syntax Error", startPos, endPos);
  }
}

class Token {
  type: TokenType;
  value: string | number;
  startPos: Position;
  endPos: Position;

  constructor(
    type: TokenType,
    startPos: Position,
    value?: string | number,
    endPos?: Position
  ) {
    this.type = type;
    this.startPos = startPos;
    this.value = value;
    this.endPos = endPos ? endPos : startPos.copy().advance();
  }

  matches(type: TokenType, value: string): boolean {
    return this.type == type && this.value == value;
  }

  asString(): string {
    return `${this.type}${this.value ? `:${this.value}` : ""}`;
  }
}

class Lexer {
  tokens: Token[];
  src: string;
  char: string;
  fileName: string;
  position: Position;
  shouldAdvanceNextIttr: boolean;

  constructor(src: string) {
    this.src = src;
    this.position = new Position(-1, -1, 0);
    this.shouldAdvanceNextIttr = true;
    this.advance();
  }

  advance() {
    this.position.advance(this.char);
    if (this.position.idx < this.src.length) {
      return (this.char = this.src[this.position.idx]);
    }
    this.char = null;
  }

  isSpecOp(): string | null {
    return specOp.includes(this.char) ? this.char : null;
  }

  tryGetNext(): string | null {
    if (this.position.idx + 1 < this.src.length) {
      return this.src[this.position.idx + 1];
    }
  }

  includes(arr: string[] | string): string | null {
    return arr.includes(this.char) ? this.char : null;
  }

  next(): { token: Token; error: SLIError | null } | null {
    let nextChar: string | null;

    switch (this.char) {
      case " ":
        return { token: null, error: null };

      case "\n":
        return { token: new Token("NL", this.position.copy()), error: null };

      case "{":
        return {
          token: new Token("LBRACE", this.position.copy()),
          error: null,
        };

      case "}":
        return {
          token: new Token("RBRACE", this.position.copy()),
          error: null,
        };

      case ",":
        return {
          token: new Token("COMMA", this.position.copy()),
          error: null,
        };

      case "+":
        return { token: new Token("PLUS", this.position.copy()), error: null };

      case "-":
        return { token: new Token("MINUS", this.position.copy()), error: null };

      case "*":
        return { token: new Token("MUL", this.position.copy()), error: null };

      case "/":
        return { token: new Token("DIV", this.position.copy()), error: null };

      case "=":
        nextChar = this.tryGetNext();

        if (nextChar == "=") {
          this.advance();
          return { token: new Token("EQ", this.position.copy()), error: null };
        }

        return {
          token: new Token("ASSIGN", this.position.copy()),
          error: null,
        };

      case "<":
        nextChar = this.tryGetNext();
        if (nextChar == "=")
          return { token: new Token("LTE", this.position.copy()), error: null };
        return { token: new Token("LT", this.position.copy()), error: null };

      case ">":
        nextChar = this.tryGetNext();
        if (nextChar == "=")
          return { token: new Token("GTE", this.position.copy()), error: null };
        return { token: new Token("GT", this.position.copy()), error: null };

      case this.isSpecOp():
        return {
          token: new Token(
            specOpTT[this.char] as TokenType,
            this.position.copy()
          ),
          error: null,
        };

      case this.includes(numbers):
        let numStr = "";
        let isFloat = false;
        let start = this.position.copy();

        while (this.char != null) {
          if (this.includes(numbers) != this.char && this.char != ".") break;
          if (this.char == ".") {
            if (isFloat)
              return {
                token: null,
                error: new IllegalCharacterError(
                  this.char,
                  this.position.copy()
                ),
              };
            isFloat = true;
          }
          numStr += this.char;
          this.advance();
        }

        this.shouldAdvanceNextIttr = false;
        return {
          token: new Token(
            "NUM",
            start,
            isFloat ? parseFloat(numStr) : parseInt(numStr),
            this.position.copy()
          ),
          error: null,
        };

      case this.includes(letters):
        let identOrKwrdStr = this.char;
        let startPos = this.position.copy();

        this.advance();

        while (this.includes(letters) || this.includes(numbers)) {
          identOrKwrdStr += this.char;
          this.advance();
        }

        this.shouldAdvanceNextIttr = false;

        return {
          token: new Token(
            keywords.includes(identOrKwrdStr) ? "KWRD" : "IDENT",
            startPos,
            identOrKwrdStr,
            this.position.copy()
          ),
          error: null,
        };

      case "#":
        this.advance();
        this.char = this.char;

        while (this.char != "\n") {
          this.advance();
        }

        this.shouldAdvanceNextIttr = false;
        return null;

      case '"':
        let str = '"';
        let stringStartPos = this.position.copy();

        this.advance();
        if (this.char == '"')
          return {
            token: new Token(
              "STRING",
              stringStartPos,
              '""',
              this.position.copy()
            ),
            error: null,
          };

        while (this.char != '"' && this.char != null) {
          str += this.char;
          this.advance();
        }

        return {
          token: new Token("STRING", stringStartPos, str, this.position.copy()),
          error: null,
        };

      default:
        return {
          token: null,
          error: new IllegalCharacterError(this.char, this.position),
        };
    }
  }

  tokenize(): { tokens: Token[]; error: SLIError } {
    let toks: Token[] = [];

    while (this.char != null) {
      let nextTok = this.next();
      if (nextTok.error) return { tokens: null, error: nextTok.error };
      if (nextTok.token != null) toks.push(nextTok.token);
      if (this.shouldAdvanceNextIttr) this.advance();
      if (!this.shouldAdvanceNextIttr) this.shouldAdvanceNextIttr = true;
    }

    return { tokens: toks, error: null };
  }
}

abstract class DataNode {
  value: Token;
  startPos: Position;
  endPos: Position;

  constructor(value: Token) {
    this.value = value;
    this.startPos = value.startPos.copy();
    this.endPos = value.endPos.copy();
  }

  asString(): string {
    return `${this.value.value}`;
  }
}

class NumberNode extends DataNode {
  constructor(value: Token) {
    super(value);
  }
}

class StringNode extends DataNode {
  constructor(value: Token) {
    super(value);
  }
}

class BooleanNode extends DataNode {
  constructor(value: Token) {
    super(value);
  }
}

class VarAccessNode extends DataNode {
  constructor(value: Token) {
    super(value);
  }
}

class SetNode {
  values: Token[];
  startPos: Position;
  endPos: Position;

  constructor(values: Token[]) {
    this.values = values;
    this.startPos = values[0].startPos;
    this.endPos = values[values.length - 1].endPos;
  }

  asString(): string {
    return `({  ${[
      ...this.values.map((v) => {
        return v.asString + " ";
      }),
    ]} })`;
  }
}

class VarAssignNode {
  name: Token;
  value: DataNode | SetNode;
  startPos: Position;
  endPos: Position;

  constructor(name: Token, value: DataNode | SetNode, startPos: Position) {
    this.name = name;
    this.value = value;
    this.startPos = startPos;
    this.endPos = value.endPos;
  }

  asString(): string {
    return `(ASSIGN ${this.value} TO ${this.name})`;
  }
}

class UnaryOperatorNode {
  op: Token;
  value: DataNode | BinaryOperatorNode;
  startPos: Position;
  endPos: Position;

  constructor(op: Token, value: DataNode | BinaryOperatorNode) {
    this.op = op;
    this.value = value;
    this.startPos = op.startPos;
    this.endPos = value.endPos;
  }
}

class BinaryOperatorNode {
  left: DataNode | Token;
  op: Token;
  right: DataNode;
  startPos: Position;
  endPos: Position;

  constructor(left: DataNode | Token, op: Token, right: DataNode) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.startPos = left.startPos;
    this.endPos = right.endPos;
  }
}

class IsNode extends UnaryOperatorNode {
  constructor(tok: Token, value: BinaryOperatorNode) {
    super(tok, value);
  }
}

class DoNode extends UnaryOperatorNode {
  constructor(tok: Token, value: BinaryOperatorNode) {
    super(tok, value);
  }
}

type Node = DataNode | SetNode | UnaryOperatorNode | BinaryOperatorNode;

class ParseRegister {
  node: Node;
  error: SLIError;

  register(res: ParseRegister): ParseRegister {
    if (res.error) return this.failure(res.error);
    return this.success(res.node);
  }

  success(node: Node): ParseRegister {
    this.node = node;
    return this;
  }

  failure(error: SLIError): ParseRegister {
    this.error = error;
    return this;
  }
}

class Parser {
  tokens: Token[];
  curTok: Token;
  idx: number;

  constructor(toks: Token[]) {
    this.tokens = toks;
    this.idx = -1;
    this.advance();
  }

  advance() {
    this.idx++;
    if (this.idx < this.tokens.length) this.curTok = this.tokens[this.idx];
  }

  generateAbstractSyntaxTree() {}

  // NUM | STR | VARACCESS
  atom(): ParseRegister {
    let res = new ParseRegister();
    let current = this.curTok;

    if (current.type == "NUM") {
      return res.success(new NumberNode(current));
    }

    if (current.type == "STRING") {
      return res.success(new StringNode(current));
    }

    if (current.type == "IDENT") {
      return res.success(new VarAccessNode(current));
    }
  }

  // (LBRAC)? (ATOM) (COMMA (ATOM))?* RBRAC
  set(): ParseRegister {
    let res = new ParseRegister();

    let current = this.curTok;
    if (current.type != "LBRACE") return res.register(this.atom());
    this.advance();

    if (this.curTok.type == "RBRACE") {
      this.advance();
      return res.success(new SetNode([]));
    }

    this.curTok = this.curTok;

    let members = [];

    let firstMember = res.register(this.atom());
    if (res.error) return res;

    members.push(firstMember);

    while (this.curTok != null && this.curTok.type != "RBRACE") {
      let newMemeber = res.register(this.atom());
      if (res.error) return res;
      this.advance();
      members.push(newMemeber);
      if (this.curTok.type == "NL") continue;
      if (this.curTok.type != "COMMA")
        return res.failure(
          new SyntaxError(
            `Expected ',' after member. Instead, got '${this.curTok.type}'`,
            newMemeber.node.startPos,
            this.curTok.endPos
          )
        );

      this.advance();
      this.curTok = this.curTok;
    }

    if(this.curTok.type == "RBRACE") {
      return new Set
    }
  }

  // SET
  factor() {
    let res = new ParseRegister();
    if (this.curTok.type == "LBRACE") res.register(this.set());

    if (res.error) return res;

    return res.success(res.node);
  }

  // FACTOR ((MUL|DIV) FACTOR)?
  term() {}

  // TERM ((PLUS|MINUS) TERM)?
  expr() {}

  // IDENT | EXPR
  setExpr() {}
}

export function runCode(src: string) {
  let lexer = new Lexer(src);
  let tokens: { tokens: Token[]; error: SLIError } = lexer.tokenize();

  if (tokens.error) return output.set([...tokens.error.asString().split("\n")]);
  let tokStr = "[";
  for (let i = 0; i < tokens.tokens.length; i++) {
    const element = tokens.tokens[i];
    tokStr += `${element.asString()}${
      i < tokens.tokens.length - 1 ? ", " : ""
    }`;
  }

  tokStr += "]";

  output.set([tokStr]);
}
