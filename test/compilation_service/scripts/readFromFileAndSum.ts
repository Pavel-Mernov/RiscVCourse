export const readFromFileAndSum = `

.data
buffer:  .space 64              # Буфер для содержимого файла
fname:   .asciz "numbers.txt"   # Имя файла

.text
.globl main

main:
    # Открытие файла
    li   a7, 1024               # syscall open
    la   a0, fname
    li   a1, 0                  # O_RDONLY
    li   a2, 0
    ecall
    mv   s1, a0                 # s1 = дескриптор файла

    # Чтение данных
    li   a7, 63                 # syscall read
    mv   a0, s1
    la   a1, buffer
    li   a2, 64
    ecall
    mv   s2, a0                 # Прочитано байт

    # Закрытие файла
    li   a7, 57                 # syscall close
    mv   a0, s1
    ecall

    # Парсим первое число
    la   t0, buffer
    jal  ra, str_to_int
    mv   s0, a0                 # s0 = первое число
    mv   t0, a1                 # вернуть актуальный указатель после парсинга

skip_nl:
    lbu  t3, 0(t0)
    beqz t3, after_nl
    li   t4, 10                 # 
    beq  t3, t4, after_nl
    addi t0, t0, 1
    j    skip_nl

after_nl:
    addi t0, t0, 1              # переход к следующему числу

    # Парсим второе число
    jal  ra, str_to_int
    mv   s1, a0                 # s1 = второе число

    # Сумма чисел
    add  t3, s0, s1

    # Вывод результата
    li   a7, 1                  # syscall print_int
    mv   a0, t3
    ecall

    # Перевод строки
    li   a7, 11
    li   a0, 10
    ecall

    # Завершение
    li   a7, 10
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
    mv   a0, t1      # результат
    mv   a1, t0      # следующий адрес после числа
    ret


`