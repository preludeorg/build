/*
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
*/
package main

import (
    "fmt"
    "os"
)

func test() {
    fmt.Println("Run test")
    os.Exit(100)
}

func clean() {
    fmt.Println("Clean up")
    os.Exit(100)
}

func main() {
    args := os.Args[1:]
    if len(args) > 0 {
        clean()
    } else {
        test()
    }
}