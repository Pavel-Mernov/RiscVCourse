export const strToInt = `

.data
buffer: .space 32        # Буфер для ввода строки

.text
.globl main

main:
    # Ввод строки с консоли
    li   a7, 8           # syscall read_string
    la   a0, buffer
    li   a1, 32
    ecall

    # Преобразование строки в число
    la   t0, buffer
    jal  ra, str_to_int  # Вызов функции
    mv   t1, a0          # Сохраняем результат

    # Вывод числа
    li   a7, 1           # syscall print_int
    mv   a0, t1
    ecall

    # Новая строка
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
    li   t1, 0           # результат
    li   t2, 0           # знак

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
    li   t4, 45          # '-'
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