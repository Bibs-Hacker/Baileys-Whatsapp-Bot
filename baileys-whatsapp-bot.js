sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
        console.log("📱 Scan QR below:")
        require("qrcode-terminal").generate(qr, { small: true })
    }

    if (connection === "open") {
        console.log("✅ WhatsApp connected successfully!")
    }

    if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode

        console.log("❌ Connection closed. Status:", statusCode)

        // ❗ IMPORTANT FIX
        if (statusCode === 401) {
            console.log("🚨 Session invalid (logged out). Delete auth/ and rescan QR.")
            return
        }

        if (statusCode === 403) {
            console.log("🚨 Forbidden. WhatsApp blocked session. Rescan required.")
            return
        }

        console.log("🔁 Reconnecting in 5 seconds...")

        setTimeout(() => {
            startBot()
        }, 5000)
    }
})
