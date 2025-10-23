export const twoIntsFromStr = `

.data
buffer1: .space 32      # Буфер для первого числа
buffer2: .space 32      # Буфер для второго числа

.text
.globl main

main:
    # Ввод первого числа
    li   a7, 8           # syscall read_string
    la   a0, buffer1
    li   a1, 32
    ecall

    # Преобразуем в целое
    la   t0, buffer1
    jal  ra, str_to_int
    mv   s0, a0          # s0 = число 1

    # Ввод второго числа
    li   a7, 8
    la   a0, buffer2
    li   a1, 32
    ecall

    # Преобразуем в целое
    la   t0, buffer2
    jal  ra, str_to_int
    mv   t2, a0          # t2 = число 2

    # Сумма двух чисел
    add  t3, s0, t2

    # Вывод результата
    li   a7, 1           # syscall print_int
    mv   a0, t3
    ecall

    # Переход на новую строку
    li   a7, 11
    li   a0, 10
    ecall

    # Завершение
    li   a7, 10          # syscall exit
    ecall

#------------------------
# Функция str_to_int
#------------------------
str_to_int:
    li   t1, 0
    li   t2, 0

skip_ws:
    lbu  t3, 0(t0)
    beqz t3, done
    li   t4, 32
    beq  t3, t4, inc_p
    li   t4, 9
    beq  t3, t4, inc_p
    li   t4, 10
    beq  t3, t4, inc_p
    li   t4, 13
    beq  t3, t4, inc_p
    li   t4, 45
    bne  t3, t4, parse
    li   t2, 1
    addi t0, t0, 1
    j    skip_ws

inc_p:
    addi t0, t0, 1
    j    skip_ws

parse:
conv_loop:
    lbu  t3, 0(t0)
    li   t4, 48
    blt  t3, t4, finish
    li   t4, 57
    bgt  t3, t4, finish
    addi t3, t3, -48
    li   t5, 10
    mul  t1, t1, t5
    add  t1, t1, t3
    addi t0, t0, 1
    j    conv_loop

finish:
    beqz t2, done
    neg  t1, t1

done:
    mv   a0, t1
    ret

`