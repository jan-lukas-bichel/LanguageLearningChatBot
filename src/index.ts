import { config } from 'dotenv'
config()

import Telegraf, { Context } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import { forwardMessageToPartner } from './game'

const token = process.env.BOT_TOKEN
if (token === undefined) {
    throw new Error('No token provided!')
}

interface SessionData {
    matchedPartner?: {
        id: number
        name: string
    }
    state?: 'chatting' | 'answering' | 'example'
}

interface BotContext extends Context {
    session: SessionData
}

const bot = new Telegraf<BotContext>(token)

bot.use(new LocalSession().middleware())

bot.command('start', ({ reply }) => {
    reply(`Hier kommt die Beschreibung für die verschiedenen Kommandos rein:
/Match
/Optionen
/Sonstwas`)
})

bot.on(['text'], forwardMessageToPartner)

/*bot.on('photo', (ctx, next) => {
    const session = ctx.session
    session.counter = session.counter ?? 0
    session.counter++
    return next()
})
bot.hears('/stats', ({ reply, session, from }) =>
    reply(`already got ${session.counter ?? 0} pics from ${from?.username}!`)
)*/
bot.startPolling()
