import { config } from 'dotenv'
import { LowdbSync } from 'lowdb'
import Telegraf, { Context } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import { forwardMessageToPartner } from './game'
import { match } from './match'
config()

const token = process.env.BOT_TOKEN
if (token === undefined) {
    throw new Error('No token provided!')
}

export interface SessionData {
    matchedPartner?: {
        id: number
        name: string
    }
    state?: 'idle' | 'in-game' | 'looking for match'
    playerRole?: 'answeringPlayer' | 'communicatingPlayer'
    stage?: number
}

interface DbData {
    sessions: { id: string; data: SessionData }[]
}

export interface BotContext extends Context {
    session: SessionData
    db: {
        getSession: LocalSession<SessionData>['getSession']
        saveSession: LocalSession<SessionData>['saveSession']
        db: LowdbSync<DbData>
    }
}

const bot = new Telegraf<BotContext>(token)

const session = new LocalSession<SessionData>({
    getSessionKey: ctx => ctx.from?.id?.toString() ?? '',
})
bot.context.db = {
    getSession: key => session.getSession(key),
    saveSession: (key, data) => session.saveSession(key, data),
    db: session.DB as LowdbSync<DbData>,
}
bot.use(session.middleware())

bot.command('match', match)

bot.command('start', ({ reply }) => {
    reply(`Hier kommt die Beschreibung für die verschiedenen Kommandos rein:
/match
/optionen
/sonstwas`)
})

bot.on(['text'], forwardMessageToPartner)

bot.startPolling()

/*

{
  "sessions": [
    {
      "id": "493499859",
      "data": {
        "state": "looking for match"
      }
    }
  ]
}

*/
