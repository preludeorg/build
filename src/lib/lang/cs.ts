import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { StreamLanguage } from "@codemirror/language";
import { createPreludeLangChecks } from "./prelude";

class CS {
  mode() {
    return [
      StreamLanguage.define(csharp),
      createPreludeLangChecks(/int\s+Test\(.*\)/g, /int\s+Clean\(.*\)/g),
    ];
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
