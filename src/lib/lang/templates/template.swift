/*
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
*/
import Foundation

func test() {
    print("Run test")
    exit(100)
}

func clean() {
    print("Clean up")
    exit(100)
}

if CommandLine.arguments.contains("clean") {
    clean()
} else {
    test()
}
