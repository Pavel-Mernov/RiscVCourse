export const sumFromConsole = `



    .text
    .globl main
main:


    # Считываем первое число
    li   a7, 5          # read_int
    ecall
    mv   t0, a0         # сохраняем в t0


    # Считываем второе число
    li   a7, 5
    ecall
    mv   t1, a0         # сохраняем в t1

    # Складываем
    add  t2, t0, t1

    mv   a0, t2
    li   a7, 1          # print_int
    ecall

    # Переход на новую строку
    li   a0, 10
    li   a7, 11         # print_char
    ecall

    # Завершение программы
    li   a7, 10         # exit
    ecall

`