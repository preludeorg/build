package main

import (
	"os"
)

func test() {
	os.Exit(100)
}

func cleanup() {
	os.Exit(100)
}

func main() {
	args := os.Args[1:]
	if len(args) > 0 {
		cleanup()
	} else {
		test()
	}
}