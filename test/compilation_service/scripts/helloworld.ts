export const codeHelloWorld = `

.data
msg: .asciz "Hello, World!"

.text
.globl main
main:
    # Адрес строки в a0
    la a0, msg

    # Код системного вызова для печати строки — 4
    li a7, 4
    ecall

    # Завершение программы
    li a7, 10
    ecall

`