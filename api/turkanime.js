const axios = require('axios')
const CryptoJS = require('crypto-js')
const CryptoJSAesJson = {
    stringify: (cipherParams) => {
        var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)}
        if (cipherParams.iv) j.iv = cipherParams.iv.toString()
        if (cipherParams.salt) j.s = cipherParams.salt.toString()
        return JSON.stringify(j)
    },
    parse: (jsonStr) => {
        var j = JSON.parse(jsonStr);
        var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)})
        if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
        if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
        return cipherParams
    }
}
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
    baseURL: 'https://www.turkanime.tv/',
    headers: headers
})
const mta = axios.create({
    baseURL: 'https://m.turkanime.tv/',
    headers: {...headers, ...{'Referer': 'https://m.turkanime.tv/',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36'}}
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
    let reg2 = new RegExp('data-url=\"ajax\/bolumler&animeId=(.*?)"', 'i')
    try {
        let {data: animeId} = await ta.get(`anime/${slug}`)
            animeId = animeId.match(reg2)[1]
        let {data: episodes} = await ta.get(`ajax/bolumler&animeId=${animeId}`, { headers: headersAjax })

        let dict = new Map()
        while (match = regs.exec(episodes))
            dict.set(match[3], match[1])

        return dict
    } catch (error) {
        console.error(error)
    }
}

async function bolumVideolari(slug) {
    const listeAl = (from, id) => (from.split(`<ul id="${id}" class="dropdown-content white-text blue-grey darken-3 z-depth-2">`)[1].split('</ul>')[0]).trim()

    let kural = new RegExp('<li class="blue-grey darken-4 linkler"><a href="(.*?)" class="waves-effect waves-red white-text modal-trigger">(.*?)<\/a><\/li>', 'gi')
    let kural2 = new RegExp('<li class="blue-grey darken-4 linkler"><a href="(.*?)" class="waves-effect waves-red white-text modal-trigger">(.*?)<\/a><\/li>', 'gi')
    let iframeKural = new RegExp('iframe src="//(.*?)" ', 'i')
    try {
        let {data} = await axios.get(`https://m.turkanime.tv/video/${slug}`,{ headers: {...headers, ...{'Referer': 'https://m.turkanime.tv/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36'}}})
        let bolumVideoBase = data.match(new RegExp('data-slide="media-{ ajax: \'(.*?)\'', 'i'))[1]

        let fansublar = listeAl(data, 'fansub')
        let fansubListe = new Map() 

        let eslesme
        while ((eslesme = kural.exec(fansublar)) !== null) {
            let fansub = eslesme[2]
            let patika = eslesme[1]
    
            let {data} = await mta.get(encodeURI(patika))

            let alternatifler = listeAl(data, 'kaynak')
            let alternatifListe = new Map()
            
            let eslesme2
            let istekHavuzu = [], isimHavuzu = []
            while ((eslesme2 = kural2.exec(alternatifler)) !== null) {
                isimHavuzu.push(eslesme2[2])
                let id = eslesme2[1].split('=').pop()
                
                istekHavuzu.push(mta.get(bolumVideoBase + id, { headers: { "X-Requested-With": "XMLHttpRequest" } }))
            }
            /*while ((eslesme2 = kural2.exec(alternatifler)) !== null) {
                let kaynak = eslesme2[2]
                let id = eslesme2[1].split('=').pop()
                
                let {data} = await mta.get(bolumVideoBase + id, { headers: { "X-Requested-With": "XMLHttpRequest" } })

                let link = data.match(iframeKural)[1]
                if (link.includes('iframe')) {
                    let {data} = await ta.get(link.replace('turkanime.tv/', ''))
                    let sifre = data.match(/iframe = '(.*?)';/)[1]
                    link = 'http:' + JSON.parse(`"${CryptoJS.AES.decrypt(sifre, '7Q+5&VnG1a{)-UWd)u$_}TiXINqCw|1HG,qfQvDgbK>W(O)m 2^B{5U|@+%tQ<;F', { format: CryptoJSAesJson }).toString(CryptoJS.enc.Utf8).slice(1, -1)}"`)
                }

                alternatifListe.set(kaynak, link)
            }*/
            axios.all(istekHavuzu)
            .then(axios.spread(function (...istek) {
                istek.forEach(async ({data}, i) => {
                    let link = data.match(iframeKural)[1]
                    if (link.includes('iframe')) {
                        let iframeIstek = []
                        iframeIstek.push(ta.get(link.replace('turkanime.tv/', '')))
                        await axios.all(iframeIstek)
                        .then(axios.spread(function (...iframeler) {
                            iframeler.forEach(({data: sonuc}) => {
                                let sifre = sonuc.match(/iframe = '(.*?)';/)[1]
                                link = 'http:' + JSON.parse(`"${CryptoJS.AES.decrypt(sifre, '7Q+5&VnG1a{)-UWd)u$_}TiXINqCw|1HG,qfQvDgbK>W(O)m 2^B{5U|@+%tQ<;F', { format: CryptoJSAesJson }).toString(CryptoJS.enc.Utf8).slice(1, -1)}"`)
                            })
                        }))
                    }
                    
                    if (alternatifListe.has(isimHavuzu[i])) {
                        isimHavuzu[i] += ' ' + Math.floor(Math.random() * 10) //Ayni isimler ariza cikartmamali.
                    }
                    alternatifListe.set(isimHavuzu[i], link)
                })
            }))
            fansubListe.set(fansub, alternatifListe)
            // break
            // console.log('calistim!', Math.random())
        }
        return fansubListe
    } catch (error) {
        console.error(error)
    }
}

module.exports = {bolumListesi, bolumVideolari, animeAra, animeListesi}