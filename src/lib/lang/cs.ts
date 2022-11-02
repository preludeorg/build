import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";

class CS {
  static linters: Linter[] = [
    { regex: /void\s+Test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+Clean\(.*\)/g, message: "Required clean method missing" },
  ];

  mode() {
    return [StreamLanguage.define(csharp)];
  }
  bootstrap() {
    return `/*
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
*/
using System;

class TTP {
    static void Test() {
        Console.WriteLine("Run test");
        Environment.Exit(100);
    }

    static void Clean() {
        Console.WriteLine("Clean up");
        Environment.Exit(100);
    }

    static void Main(string[] args) {
        if (args.Length == 0) {
            Test();
        } else {
            Clean();
        }
    }
}`;
  }
}

export default CS;
