import { Telegraf, Markup, Input } from 'telegraf';
import path from 'node:path'
import 'dotenv/config';

import {
    startGame,
    getCurrentQuestion,
    checkAnswer,
    type CheckType,
    getScore,
    nextQuestion,
} from './quiz/game';

const token = process.env.BOT_TOKEN!

// console.log(token)

const bot = new Telegraf(token);

type Poll = 
    {
        chatId: number;
        questionIndex: number;
        questionMessageId: number;
        messageId: number;
        resultMessageId?: number;
    }

const polls = new Map<string, Poll>();

const firstMessage = new Map<number, number>();

bot.start(async ctx => {
    const message = await ctx.replyWithPhoto(
        { source: './images/start.jpg' },
        {
            caption:
`🚴 *ВЕЛОКВЕСТ ВШЭ*

Сегодня ты — студент, который решил приехать в университет на велосипеде.

Твоя задача — добраться до кампуса, не нарушив ПДД и не угробив себя по дороге. 🚲

На каждом этапе тебя ждёт ситуация.
Выбирай правильный вариант ответа.

🏆 *18 правильных ответов — ты Веломастер!*
🚴 *15–17 — городской велосипедист.*
🚲 *11–14 — ещё немного практики*
🔧 *0–10 — тебе срочно нужен велоклуб!*


Готов начать?`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback(
                    '🚴 Начать викторину',
                    'start_quiz'
                )
            ])
        }
    );

    const messageId = message.message_id;

    const chatId = ctx.chat.id

    firstMessage.set(chatId, messageId);
});

bot.action('start_quiz', async ctx => {
    await ctx.answerCbQuery();

    const chatId = ctx.chat!.id;

    
    const firstMessageId = firstMessage.get(chatId);

    if (firstMessageId != null) {
        try {
            await bot.telegram.deleteMessage(
                chatId,
                firstMessageId
            );

            firstMessage.delete(chatId);
        } catch {}
    }

    startGame(chatId);

    await sendQuestion(chatId);
});

const previousPreQuestions = new Map<number, number>();

async function sendQuestion( chatId: number ) {

    const curQuestion = getCurrentQuestion(chatId);

    if (!curQuestion) {
        return false;
    }

    const {
        index,
        preQuestion,
        correct,
        question,
        answers,
        image 
    } = curQuestion;


    if (preQuestion) {
        const previousPreQuestionId =
            previousPreQuestions.get(chatId);

        if (previousPreQuestionId) {
            try {
                await bot.telegram.deleteMessage(
                    chatId,
                    previousPreQuestionId
                );
            } catch {}
        }

        const preQuestionMessage =
            await bot.telegram.sendMessage(
                chatId,
                preQuestion,
                {
                    parse_mode: 'Markdown'
                }
            );

        previousPreQuestions.set(
            chatId,
            preQuestionMessage.message_id
        );
    }
    
    let questionMessageId : number = -1;

    if (image) {
        const imageMessage = await bot.telegram.sendPhoto(
            chatId,
            Input.fromLocalFile(
                path.resolve(image)
            ),
            {
                caption : `*${question}*`,
                parse_mode : 'Markdown'
            }
        );

        questionMessageId = imageMessage.message_id;
    }
    else {
        const questionMessage = await bot.telegram.sendMessage(
            chatId,
            `*${question}*`,
            {
                parse_mode : 'Markdown',
            }
        )
    
        questionMessageId = questionMessage.message_id;
    }

    const correct_option_ids : number[] = 
        Array.isArray(correct) ?
        correct.map(
            answer => answer.number
        ) :
        [correct.number];

    const message = await bot.telegram.sendQuiz(
        chatId,
        'Выбери один или несколько вариантов:',
        answers,
        {
            is_anonymous: false,
            allows_multiple_answers:
                Array.isArray(correct),

            correct_option_ids,
        } as any
    );

    

    polls.set(message.poll.id, {
        chatId,
        questionIndex: index,
        messageId : message.message_id,
        questionMessageId
    });

    return true
}

bot.on('poll_answer', async ctx => {
    const { poll_id, option_ids } = ctx.pollAnswer;

    const poll = polls.get(poll_id);

    if (!poll) {
        return;
    }

    const { chatId } = poll;

    const result = checkAnswer(
        chatId,
        option_ids
    );

    if (!result) {
        return;
    }


    const question = getCurrentQuestion(chatId);

    await sendCheckResult(
        chatId,
        result,
        question?.explanation
    );
});

bot.action('continue', async ctx => {
    await ctx.answerCbQuery();

    const chatId = ctx.chat!.id;

    await ctx.deleteMessage();

    const [poll_id, poll] = [
        ...polls.entries()
    ]
    .find(([,p]) => p.chatId === chatId) ?? [null, null]

    if (!poll_id || !poll) {
        return
    }

    const { messageId, questionMessageId } = poll

    await bot.telegram.deleteMessage(
        chatId,
        messageId
    );
    await bot.telegram.deleteMessage(
        chatId,
        questionMessageId
    );

    polls.delete(poll_id);
    
    nextQuestion(chatId);

    const nextQuestionSent = await sendQuestion(chatId);

    if (!nextQuestionSent) {

        const previousPreQuestionId =
            previousPreQuestions.get(chatId);

        if (previousPreQuestionId) {
            try {
                await bot.telegram.deleteMessage(
                    chatId,
                    previousPreQuestionId
                );

                
            } catch {}
        }

        const firstMessageId = firstMessage.get(chatId)

        if (firstMessageId != null) {
            try {
                await bot.telegram.deleteMessage(
                    chatId,
                    firstMessageId
                )

                firstMessage.delete(chatId)
            } catch {}
        }

        await sendFinalMessage(chatId);
    }
});

async function sendCheckResult(
    chatId: number,
    result: CheckType,
    explanation?: string
) {
    const statusText  = {
        0: '🔴 *Неправильно!*',
        1: '🟡 *Частично правильно!*',
        2: '🟢 *Правильно!*'
    }[result.status];

    let text = `${statusText}\n\n`;

    if (result.correctAnswers.length === 1) {
        text += `Правильный ответ: *${result.correctAnswers[0]}*\n\n`;
    }
    else if (result.correctAnswers.length > 1) {
        text += `Правильные ответы: *${result.correctAnswers.join(', ')}*\n\n`;
    }

    if (explanation) {
        text += `*${explanation}*`;
    }

    await bot.telegram.sendMessage(
        chatId,
        text,
        {
            parse_mode : 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback(
                    '▶️ Продолжить',
                    'continue'
                )
            ])
        }
    );
}

async function sendFinalMessage(chatId: number) {
    const score = getScore(chatId);

    if (score == null) {
        return
    }

    let resultText: string;

    if (score === 18) {
        resultText =
            '🏆 <b>Ты Веломастер!</b>\n\n' +
            'Ты отлично ориентируешься в правилах дорожного движения и уверенно прошёл весь маршрут.';
    }
    else if (score >= 15) {
        resultText =
            '🚴 <b>Ты городской велосипедист!</b>\n\n' +
            'Очень хороший результат! Ты уже неплохо ориентируешься в правилах и можешь уверенно передвигаться по городу.';
    }
    else if (score >= 11) {
        resultText =
            '🚲 <b>Ещё немного практики!</b>\n\n' +
            'Основы ты знаешь, но некоторые ситуации стоит повторить. Практика поможет стать увереннее на дороге.';
    }
    else {
        resultText =
            '🔧 <b>Тебе срочно нужен велоклуб!</b>\n\n' +
            'Похоже, некоторые правила пока вызывают вопросы. Самое время подтянуть знания и больше узнать о безопасной езде.';
    }

    const text =
        `🏁 <b>ФИНИШ!</b>\n\n` +
        `Ты проехал весь маршрут.\n\n` +
        `⭐ <b>Твой результат: ${score}/18</b>\n\n` +
        `${resultText}\n\n` +
        `🚴 Хочешь больше велосипедных приключений?\n` +
        `Подписывайся на нашу группу ВШЭ — там мы рассказываем о велоклубе, поездках и мероприятиях!\n\n` +
        `👇 <b>Будем рады видеть тебя в велоклубе!</b>`;

    await bot.telegram.sendPhoto(
        chatId,
        Input.fromLocalFile(
            path.resolve('./images/final.png')
        ),
        {
            caption: text,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                Markup.button.url(
                    '🚴 Подписаться на группу',
                    'https://t.me/cyclingclubhse'
                )
            ])
        }
    );
}

bot.launch();