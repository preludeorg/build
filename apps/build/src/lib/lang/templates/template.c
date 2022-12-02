/*
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
