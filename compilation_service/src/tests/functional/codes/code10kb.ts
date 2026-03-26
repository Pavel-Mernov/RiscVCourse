const TARGET_SIZE = 10 * 1024; // 10 KB

let code = `.data
msg: .asciiz "Hello world\\n"

.text
.globl main
main:
`;

const block = `
    li a7, 4
    la a0, msg
    ecall
`;

while (Buffer.byteLength(code, "utf-8") < TARGET_SIZE) {
  code += block;
}

// выход
code += `
    li a7, 10
    ecall
`;

export default code;