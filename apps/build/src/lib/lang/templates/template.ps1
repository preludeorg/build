<#
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
#>

function Test {
    Write-Output "Run test"
    exit 100
}

function Clean {
    Write-Output "Clean up"
    exit 100
}

if ($args.Count -gt  0) {
    Clean
} else {
    Test
}
