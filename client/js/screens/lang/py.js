class Python {
    mode() {
        return 'text/x-csrc';
    }
    bootstrap() {
        return ('def attack() -> int:\n' +
            '    return 0\n' +
            '\n' +
            '\n' +
            ' def cleanup() -> int:\n' +
            '     return 0'
        );
    }
}

export default Python;