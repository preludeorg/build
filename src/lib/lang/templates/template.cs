/*
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
}
