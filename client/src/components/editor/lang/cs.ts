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
    return (
      "using System;\n" +
      "  \n" +
      "class TTP { \n" +
      "    static int Test() {\n" +
      '        Console.WriteLine("Testing");\n' +
      "        return 0;\n" +
      "    }\n" +
      "\n" +
      "    static int Clean() {\n" +
      '        Console.WriteLine("Clean");\n' +
      "        return 0;\n" +
      "    }\n" +
      "\n" +
      "    static void Main(string[] args) {\n" +
      '        if (args[0].Contains("clean")) {\n' +
      "            Clean();\n" +
      "        } else {\n" +
      "            Test();\n" +
      "        }\n" +
      "    }\n" +
      "}"
    );
  }
}

export default CS;
