class Mode {
    language() {
        return 'text/x-csrc';
    }
    bootstrap() {
        return ('#include <stdlib.h>\n' +
            '\n' +
            'int attack(void)\n' +
            '{\n' +
            '    char *command = "whoami";\n' +
            '    return system(command);\n' +
            '}\n' +
            '\n' +
            'int cleanup(void)\n' +
            '{\n' +
            '    return 0;\n' +
            '}\n');
    }
}

export default Mode;