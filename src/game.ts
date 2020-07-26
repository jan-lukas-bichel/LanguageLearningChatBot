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

export function sendIntroduction(ctx: BotContext): void {
    const currentStage = ctx.session.stage
    if (ctx.session.playerRole === 'answeringPlayer') {
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
    ctx.session.playerRole = 'answeringPlayer'
    otherPlayer.playerRole = 'communicatingPlayer'
    sendIntroduction(ctx)
}

export function forwardMessageToPartner(ctx: BotContext): void {
    const partnerId = ctx.session.matchedPartner?.id

    if (partnerId !== undefined && ctx.message?.text !== undefined) {
        ctx.telegram.sendMessage(partnerId, ctx.message.text)
    }
}

export function sendQuiz(ctx: BotContext): void {
    if (ctx.session.playerRole === 'answeringPlayer') {
        const quiz = stages[ctx.session.stage].quiz
        ctx.replyWithQuiz(quiz.question, quiz.answers, {
            // eslint-disable-next-line @typescript-eslint/camelcase
            correct_option_id: quiz.correctAnswer,
        })
    }
}

//Infos zum Szenario übermitteln

//Antwort Knopf rendern

//Multiple choice quiz rendern

//Antwort auf korrektheit prüfen

//Beiden spielern feedback über erfolg / misserfolg schicken
