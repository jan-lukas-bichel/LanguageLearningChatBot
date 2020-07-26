const level = {
    stage1: {
        player1Text:
            'Du bist ein Kassierer ... was ist das Problem des Kunden?',
        player2Text: 'Du bist ein Kunde ... und das ist dein Problem.',
        quiz: {
            option1: '',
            option2: '',
            option3: '',
            option4: '',
        },
        correctAnswer: 3,
    },
}

export function forwardMessageToPartner(ctx: BotContext) {
    if (ctx.session.state === 'chatting') {
        const partnerId = ctx.session.matchedPartner?.id

        if (partnerId !== undefined && ctx.message?.text !== undefined) {
            ctx.telegram.sendMessage(partnerId, ctx.message.text)
        }
    }
}

//Infos zum Szenario übermitteln

//Antwort Knopf rendern

//Multiple choice quiz rendern

//Antwort auf korrektheit prüfen

//Beiden spielern feedback über erfolg / misserfolg schicken
