import { BotContext, SessionData } from '.'

const stages = [
    {
        answeringPlayerText:
            'Du bist ein Kassierer ... was ist das Problem des Kunden?',
        communicatingPlayerText:
            'Du bist ein Kunde ... und das ist dein Problem.',
        quiz: {
            question: 'Was ist das Problem des Kunden?',
            answers: [
                'Kann Orangen nicht finden',
                'Kann Bananen nicht finden',
                'Kann Toilette nicht finden',
            ],
            correctAnswer: 2,
        },
    },
]

export function sendIntroductions(ctx: BotContext): void {
    const currentStage = ctx.session.stage
    if (
        ctx.session.playerRole === 'answeringPlayer' &&
        currentStage !== undefined
    ) {
        ctx.reply(stages[currentStage].answeringPlayerText)
        if (ctx.session.matchedPartner?.id !== undefined) {
            ctx.telegram.sendMessage(
                ctx.session.matchedPartner.id,
                stages[currentStage].communicatingPlayerText
            )
        }
    }
}

export function initializeGame(
    ctx: BotContext,
    otherPlayer: SessionData
): void {
    ctx.session.stage = 0
    otherPlayer.stage = 0
    ctx.session.playerRole = 'answeringPlayer'
    otherPlayer.playerRole = 'communicatingPlayer'
    sendIntroductions(ctx)
}

export function forwardMessageToPartner(ctx: BotContext): void {
    const partnerId = ctx.session.matchedPartner?.id

    if (
        partnerId === undefined ||
        ctx.message?.text === undefined ||
        ctx.session.playerRole == undefined ||
        ctx.session.state !== 'in-game'
    ) {
        return
    }
    if (ctx.session.playerRole === 'communicatingPlayer') {
        ctx.telegram.sendMessage(partnerId, ctx.message.text, {
            // eslint-disable-next-line @typescript-eslint/camelcase
            reply_markup: { inline_keyboard: [[{ text: 'Antwort' }]] },
        })
    }
}

export function sendQuiz(ctx: BotContext): void {
    if (
        ctx.session.playerRole === 'answeringPlayer' &&
        ctx.session.stage !== undefined
    ) {
        const quiz = stages[ctx.session.stage].quiz
        ctx.replyWithQuiz(quiz.question, quiz.answers, {
            // eslint-disable-next-line @typescript-eslint/camelcase
            correct_option_id: quiz.correctAnswer,
        })
    }
}

export function checkAnswer(ctx: BotContext): void {
    if (
        ctx.pollAnswer === undefined ||
        ctx.session.stage === undefined ||
        ctx.session.matchedPartner?.id === undefined
    ) {
        return
    } else {
        const partnerId = ctx.session.matchedPartner?.id
        if (
            ctx.pollAnswer.option_ids[0] ===
            stages[ctx.session.stage].quiz.correctAnswer
        ) {
            const successMessagePartner = 'Richtige Antwort'
            const successMessageSelf = 'Richtige Antwort'
            ctx.telegram.sendMessage(partnerId, successMessagePartner)
            ctx.reply(successMessageSelf)
        } else {
            const wrongAnswerMessagePartner = 'Falsche Antwort'
            const wrongAnswerMessageSelf = 'Falsche Antwort'
            ctx.telegram.sendMessage(partnerId, wrongAnswerMessagePartner)
            ctx.reply(wrongAnswerMessageSelf)
        }
    }
}

//nächste stage einleiten
