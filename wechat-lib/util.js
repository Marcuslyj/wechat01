const xml2js = require('xml2js')

exports.parseXML = xml => new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true }, (err, content) => {
        if (err) reject(err)
        else resolve(content)
    })
})

exports.formatMessage = result => {
    let message = {}

    if (typeof result === 'object') {
        const keys = Object.keys(result)

        for (let i = 0; i < keys.length; i++) {
            const item = result[keys[i]];
            let key = keys[i]

            if (!(item instanceof Array) || item.length === 0) {
                continue
            }

            if (item.length === 1) {
                let val = item[0]
                if (typeof val === 'object') {
                    message[key] = this.formatMessage(val)
                } else {
                    message[key] = (val || '').trim()
                }
            } else {
                message[key] = []

                for (let j = 0; j < item.length; j++) {
                    message[key].push(this.formatMessage(item[j]))
                }
            }
        }
    }
    return message
}