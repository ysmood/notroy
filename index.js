const crypto = require('crypto')
const cmder = require('commander');
const nisper = require('nisper')
const kit = require('nokit')
const cookies = require('cookies')
const proxy = kit.require('proxy')
const _ = kit._

_.insertSortedBy = (a, v, i) => a.splice(_.sortedIndexBy(a, v, i), 0, v);

cmder
    .description('a tool for remote control webpage')
    .option('-p, --port <num>', 'port of the service', 9982)
    .option('--host <str>', 'host of the service', '0.0.0.0')
    .option('--url <str>', 'public url for ws', 'ws://127.0.0.1:9982')
    .option('--id-len <num>', 'auto id length', 12)
    .option('--max-sessions <num>', 'max sessions', 1000)
    .option('--max-payload <num>', 'max payload for each message, unit is KB', 512)
.parse(process.argv);

const clients = []
const clientScript = kit.readFileSync(__dirname + '/dist/main.js')

const app = proxy.flow()


app.listen(cmder.port, cmder.host).then(() => {
    const server = nisper.default({
        httpServer: app.server,
        wsOptions: {
            maxPayload: +cmder.maxPayload * 1024,
        },
        onOpen: (ws, req) => {
            if (clients.length >= +cmder.maxSessions) {
                ws.close(1013, 'too many connects')
                return
            }

            let id = _.trimStart(req.url, '/')

            if (id === '') {
                cookie = cookies(req)
                id = cookie.get('id')
                server.call(ws, ['eval', `console.info("notroy id: ${id}")`])
            }

            _.insertSortedBy(clients, {id, ws}, 'id')

            ws.addListener('close', () => {
                _.remove(clients, {id})
            })
            ws.addListener('error', () => {
                _.remove(clients, {id})
            })
        }
    });

    app.push(($) => {
        const cookie = cookies($.req, $.res)
        if (!cookie.get('id')) {
            cookie.set('id', crypto.randomBytes(+cmder.idLen).toString('hex'))
        }
        $.next()
    })

    app.push(
        proxy.select({
            method: 'POST',
            url: proxy.match('/:id')
        }, proxy.flow(proxy.body(), async ($) => {
            let has = false
            const id = $.url.id

            for (let i = _.sortedIndexBy(clients, {id}, 'id'); i < clients.length; i++) {
                let client = clients[i]

                if (client.id !== id) break

                has = true
    
                try {
                    $.body = await server.call(client.ws, ['eval', $.reqBody + ''])
                } catch (err) {
                    $.res.statusCode = 400
                    $.body = JSON.stringify(err)
                }
            }

            if (!has) {
                throw "client not found"
            }
        }))
    )
    
    app.push(
        proxy.select({
            method: 'GET',
            url: /\/([^\/]*)/
        }, async ($) => {
            $.res.setHeader("content-type", "application/javascript")
            $.body = `${clientScript}\n notroy("${cmder.url}", "${$.url[1]}")`
        })
    )    

    kit.logs(`listen on: ${cmder.host}:${cmder.port}`)
}, (err) => {
    kit.throw(err)
})