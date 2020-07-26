import { config } from 'dotenv'
config()

import Telegraf, { Context } from 'telegraf'

const token = process.env.BOT_TOKEN
if (token === undefined) {
    throw new Error('No token provided!')
}

interface SessionData {
    counter: number | undefined
}

interface BotContext extends Context {
    session: SessionData
}

const bot = new Telegraf<BotContext>(token)

bot.on('photo', (ctx, next) => {
    const session = ctx.session
    session.counter = session.counter || 0
    session.counter++
    return next()
})
bot.hears('/stats', ({ reply, session, from }) =>
    reply(`already got ${session.counter} pics from ${from?.username}!`)
)
bot.startPolling()
