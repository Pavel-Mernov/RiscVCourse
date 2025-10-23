export const readStrFromFile = `

.data
filename: .asciz "string.txt"
buffer:   .space 256

.text
.globl main
main:
    # Открываем файл для чтения
    li a7, 1024          # Syscall: open
    la a0, filename    # Имя файла
    li a1, 0           # 0 — режим чтения
    ecall
    mv s0, a0          # Файловый дескриптор

    # Чтение из файла
    li a7, 63          # Syscall: read
    mv a0, s0          # Дескриптор
    la a1, buffer      # Буфер
    li a2, 256         # Размер
    ecall
    mv s1, a0          # Кол-во прочитанных байт

    # Запись в консоль
    li a7, 4           # Syscall: write to stdout
    la a0, buffer
    ecall

    # Закрываем файл
    li a7, 57          # Syscall: close
    mv a0, s0
    ecall

    # Завершение программы
    li a7, 10
    ecall

`