import { c } from "@codemirror/legacy-modes/mode/clike";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";

class C {
  static linters: Linter[] = [
    { regex: /void\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];

  mode() {
    return [StreamLanguage.define(c)];
  }
  bootstrap() {
    return `/*
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
*/
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

void test(void)
{
    printf("Run test");
    exit(100);
}

void clean(void)
{
    printf("Clean up");
    exit(100);
}

int main(int argc, char *argv[])
{
    if (argc > 1) {
        clean();
    } else {
        test();
    }
}
`;
  }
}

export default C;
