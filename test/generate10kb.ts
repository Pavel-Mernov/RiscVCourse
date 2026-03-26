import * as fs from "fs";

const TARGET_SIZE = 10 * 1024; // 10 KB

let code = `.data
msg: .asciiz "Hello world\\n"

.text
.globl main
main:
`;

const encoder = new TextEncoder()

const block = `
    li a7, 4
    la a0, msg
    ecall
`;

while (encoder.encode(code).length < TARGET_SIZE) {
  code += block;
}

// выход
code += `
    li a7, 10
    ecall
`;

fs.writeFileSync("program.s", code);
