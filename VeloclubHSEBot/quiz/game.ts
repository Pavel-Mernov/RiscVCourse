import { Question, questions } from './questions';

export type Player = {
    chatId: number;
    question: number;
    score: number;
};

const players = new Map<number, Player>();

export function startGame(chatId: number) {
    players.set(chatId, {
        chatId,
        question: 0,
        score: 0
    });
}

/*
export function getPlayer(chatId: number) : Player | null {
    return players.get(chatId) ?? null;
}
    */
export function getScore(chatId : number) : number | null {
    const player = players.get(chatId);

    if (!player) {
        return null;
    }

    return player.score;
}

export function getCurrentQuestion(chatId: number) : Question | null {
    const player = players.get(chatId);

    if (!player) {
        return null;
    }

    return questions.at(player.question) ?? null;
}

export type CheckType = { 
    status : 0 | 1 | 2,
    correctAnswers : string[]
}

export function checkAnswer(
    chatId: number,
    answerNumbers: number[]
): CheckType | null {
    const player = players.get(chatId);

    if (!player) {
        return null;
    }

    const question = questions[player.question];

    const correct = Array.isArray(question.correct)
        ? question.correct
        : [question.correct];

    const correctAnswers = correct.map(answer => answer.letter)

    const correctNumbers = correct.map(answer => answer.number);

    const points = answerNumbers.filter(number =>
        correctNumbers.includes(number)
    ).length;

    player.score += points;

    players.set(chatId, player)

    const status = points === 0 ? 0 :
        points === correctNumbers.length ? 2 : 1;

    return {
        status,
        correctAnswers
    }
}

export function nextQuestion( chatId : number ) : boolean {
    const player = players.get(chatId);

    if (!player) {
        return false;
    }
    
    player.question++;

    players.set(chatId, player);

    return true;
}

