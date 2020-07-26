import { BotContext } from './index'

const stages = [
    {
        answeringPlayerText:
            'Du bist ein Kassierer ... was ist das Problem des Kunden?',
        communicatingPlayerText:
            'Du bist ein Kunde ... und das ist dein Problem.',
        quiz: {
            option1: '',
            option2: '',
            option3: '',
            option4: '',
        },
        correctAnswer: 3,
    },
]

export function sendIntroduction(ctx: BotContext): void {
    const currentStage = ctx.session.stage
    if (ctx.session.playerRole === 'answeringPlayer') {
        ctx.reply(stages[currentStage].answeringPlayerText)
    } else if (ctx.session.playerRole === 'communicatingPlayer') {
        ctx.reply(stages[currentStage].communicatingPlayerText)
    }
}

export function initializeGame(ctx: BotContext): void {
    sendIntroduction(ctx)
}

export function forwardMessageToPartner(ctx: BotContext): void {
    const partnerId = ctx.session.matchedPartner?.id

    if (partnerId !== undefined && ctx.message?.text !== undefined) {
        ctx.telegram.sendMessage(partnerId, ctx.message.text)
    }
}

export function sendQuiz(ctx: BotContext): void {
    if ()

        const currentStage = ctx.session.stage


    if (ctx.session.playerRole === 'answeringPlayer') {
        ctx.reply(stages[currentStage].answeringPlayerText)
    } else if (ctx.session.playerRole === 'communicatingPlayer') {
        ctx.reply(stages[currentStage].communicatingPlayerText)
    }
}

//Infos zum Szenario übermitteln

//Antwort Knopf rendern

//Multiple choice quiz rendern

//Antwort auf korrektheit prüfen

//Beiden spielern feedback über erfolg / misserfolg schicken
