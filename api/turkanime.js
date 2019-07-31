const axios = require('axios')
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://www.turkanime.tv/',
    'Upgrade-Insecure-Requests': '1',
    'TE': 'Trailers',
    'Cookie': "PHPSESSID=tqpqo4smru3mhfej4pdkqf85n0; __cfduid=dec57aab208a3f67382bb2ed120c0ef081564136948"

}
const headersAjax = {
    ...headers,
    ...{ "X-Requested-With": "XMLHttpRequest" }
}
const ta = axios.create({
    baseURL: 'http://www.turkanime.tv/',
    headers: headers
})

async function animeAra(ara) {
    try {
        const {data} = await ta.post('arama', `arama=${encodeURIComponent('ara')}`)
        console.log(data)
    } catch (error) {
        console.error(error)
    }
}
let _animeListesi = undefined //sonraki zamanlar için cache
async function animeListesi() {
    let regs = new RegExp('<a href="\/\/www\.turkanime\.tv\/anime\/(.*?)"(.*?)><span class="animeAdi">(.*?)<\/span><span class="kategori" style="display:none;">(.*?)<\/span>', 'ig')
    try {
        const {data} = await ta.get('ajax/tamliste', { headers: headersAjax })
        let dict = new Map()
        while (match = regs.exec(data))
            dict.set(match[3], match[1])

        return dict
    } catch (error) {
        console.error(error)
    }
}

async function bolumListesi(slug) {
    let regs = new RegExp('<a href="\/\/www\.turkanime\.tv\/video\/(.*?)" (.*?)><span class="bolumAdi">(.*?)<\/span><\/a>', 'ig')
    try {
        let {data: animeId} = await ta.get(`anime/${slug}`)
            animeId = animeId.split('ajax/bolumler&animeId=')[1].split('"')[0]
        let {data: episodes} = await ta.get(`ajax/bolumler&animeId=${animeId}`, { headers: headersAjax })

        let dict = new Map()
        while (match = regs.exec(episodes))
            dict.set(match[3], match[1])

        return dict
    } catch (error) {
        console.error(error)
    }
}

module.exports = {bolumListesi, animeAra, animeListesi}