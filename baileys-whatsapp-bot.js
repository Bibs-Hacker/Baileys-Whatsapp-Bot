const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Baileys Bot", "Chrome", "1.0"]
    })

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update

        if (qr) {
            console.log("📱 Scan the QR below:")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("✅ Bot connected successfully!")
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log("❌ Connection closed. Reconnecting:", shouldReconnect)

            if (shouldReconnect) {
                startBot()
            }
        }
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const sender = msg.key.remoteJid
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text

        console.log("📩 Message:", text)

        if (text === "hi") {
            await sock.sendMessage(sender, {
                text: "👋 Hello! I am your WhatsApp bot."
            })
        }

        if (text === "!menu") {
            await sock.sendMessage(sender, {
                text: `🤖 *BOT MENU*
                
1. hi → Greeting
2. !menu → Show menu
3. !help → Help info`
            })
        }

        if (text === "!help") {
            await sock.sendMessage(sender, {
                text: "ℹ️ Send *hi* to test the bot."
            })
        }
    })
}

startBot()
