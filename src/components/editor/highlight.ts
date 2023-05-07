import {
  keywords,
  letters,
  numbers,
  specIdent,
  specOp,
} from "../../language/constants";

export const highlight = (src: string) => {
  let position: number = -1;
  let char: string;
  let res: string = "";

  const advance = () => {
    position++;
    if (position < src.length) {
      return (char = src[position]);
    }

    char = null;
  };

  const tryGetNext = () => {
    if (position + 1 < src.length) {
      return (char = src[position + 1]);
    }

    return null;
  };

  advance();

  const code = (type: string, content: string) => {
    if (type == "nl") return "<br />";
    return `<span class="${type}">${content}</span>`;
  };

  const includes = (char: string, arr: string[] | string): string | null => {
    return arr.includes(char) ? char : null;
  };

  let shouldAdvanceNextIttr = true;

  const next = () => {
    let tempNext = "";
    let val = "";
    switch (char) {
      case " ":
        return code("space", " ");
      case "\n":
        return code("nl", " ");
      case '"':
        val += '"';
        advance();
        if (char == '"') return code("string", '""');

        while (char != '"' && char != null) {
          val += char;
          advance();
        }
        return code("string", val + '"');

      case "#":
        val = "#";
        advance();
        char = char;

        while (char != null) {
          if (char == "\n") break;
          val += char;
          advance();
        }

        shouldAdvanceNextIttr = false;
        return code("comment", val);
      case "{":
        return code("bracket", "{");
      case "}":
        return code("bracket", "}");
      case "(":
        return code("bracket", "(");
      case ")":
        return code("bracket", ")");
      case "=":
        tempNext = tryGetNext();
        if (tempNext == "=") {
          advance();
          return code("op", "==");
        }

        return code("op", "=");
      case "!":
        tempNext = tryGetNext();
        if (tempNext == "=") {
          advance();
          return code("op", "!=");
        }

        return code("op", "!");
      case "<":
        tempNext = tryGetNext();
        if (tempNext == "=") {
          advance();
          return code("op", "<=");
        }

        return code("op", "<");
      case ">":
        tempNext = tryGetNext();
        if (tempNext == "=") {
          advance();
          return code("op", ">=");
        }

        return code("op", ">");
      case includes(char, letters):
        val = char;
        advance();
        while (includes(char, letters) || includes(char, numbers)) {
          val += char;
          advance();
        }

        shouldAdvanceNextIttr = false;
        if (keywords.includes(val)) return code("kwrd", val);
        return code("ident", val);

      case includes(char, numbers):
        val = char;
        advance();
        let isFloat = false;

        while (includes(char, numbers) || char == ".") {
          if (char == ".") {
            if (isFloat) {
              shouldAdvanceNextIttr = false;
              return code("num", val);
            } else {
              isFloat = true;
            }
          }

          val += char;
          advance();
        }

        shouldAdvanceNextIttr = false;
        return code("num", val);
      case includes(char, specOp):
        return code("op", char);
      case includes(char, specIdent):
        return code("ident", char);
      default:
        return code("unknown", char);
    }
  };

  while (char != null) {
    res += next();
    if (shouldAdvanceNextIttr) advance();
    else shouldAdvanceNextIttr = true;
  }

  return res;
};
