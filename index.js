const cmder = require('commander');
const nisper = require('nisper')
const kit = require('nokit')
const proxy = kit.require('proxy')

cmder
    .description('a tool for remote control webpage')
    .option('-p, --port <num>', 'port of the service', 9982)
    .option('--host <str>', 'host of the service', '0.0.0.0')
    .option('--url <str>', 'public url for ws', 'ws://127.0.0.1:9982')
.parse(process.argv);

const clients = []
const clientScript = kit.readFileSync(__dirname + '/dist/main.js')

const app = proxy.flow()


app.listen(cmder.port, cmder.host).then(() => {
    const server = nisper.default({
        httpServer: app.server,
        sandbox: {
        },
        onOpen: (ws, req) => {
            const id = kit._.trimStart(req.url, '/')

            clients.push({id, ws})

            ws.addListener('close', () => {
                kit._.remove(clients, {id})
            })
        }
    });

    app.push(
        proxy.select({
            method: 'POST',
            url: proxy.match('/:id')
        }, proxy.flow(proxy.body(), async ($) => {
            let has = false

            for(let client of clients) {
                if (client.id !== $.url.id) continue

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
            url: proxy.match('/:id')
        }, async ($) => {
            $.res.setHeader("content-type", "application/javascript")
            $.body = `${clientScript}\n notroy("${cmder.url}", "${$.url.id}")`
        })
    )    

    kit.logs(`listen on: ${cmder.host}:${cmder.port}`)
}, (err) => {
    kit.throw(err)
})