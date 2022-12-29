: '
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
'
#!/bin/bash

_test() {
    echo "Run test"
    exit 100
}

clean() {
    echo "Clean up"
    exit 100
}

if [ $# -gt 0 ]
then
  clean
else
  _test
fi;
