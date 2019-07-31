const axios = require('axios');

let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Alt-Used': 'www.turkanime.tv:443',
    'Connection': 'keep-alive',
    'Referer': 'http://www.turkanime.tv/',
    'Upgrade-Insecure-Requests': '1',
    'TE': 'Trailers',
    'Cookie': " _ga=GA1.2.1278321181.1564136960; _gat=1; _gid=GA1.2.1445927356.1563524213; PHPSESSID=tqpqo4smru3mhfej4pdkqf85n0; __cfduid=dec57aab208a3f67382bb2ed120c0ef081564136948"

};

let headersAjax = { ...headers, ...{ "X-Requested-With": "XMLHttpRequest" } }


async function animeAra(ara) {

    try {
        const response = await axios.post('http://www.turkanime.tv/arama', `arama=${encodeURIComponent('ara')}`, { "headers": headers });
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}
let _animeListesi = undefined;//sonraki zamanlar için cache
async function animeListesi() {
    let regs = new RegExp('<a href="\/\/www\.turkanime\.tv\/anime\/(.*?)"(.*?)><span class="animeAdi">(.*?)<\/span><span class="kategori" style="display:none;">(.*?)<\/span>', 'ig');
    try {
        const response = await axios.get('http://www.turkanime.tv/ajax/tamliste', { "headers": headersAjax });
        // console.log(response.data);
        //console.log(response.data.match(regs).groups)
        let dict = new Map();
        while (match = regs.exec(response.data)) {
            dict.set(match[3], match[1])
        }
        return dict;
    } catch (error) {
        console.error(error);
    }
}

async function bolumListesi(slug) {
    var regs = new RegExp('<a href="\/\/www\.turkanime\.tv\/video\/(.*?)" (.*?)><span class="bolumAdi">(.*?)<\/span><\/a>', 'ig')
    try {
        let response = await axios.get(`http://www.turkanime.tv/anime/${slug}`, { "headers": headers });
        let animeId = response.data.split('ajax/bolumler&animeId=')[1].split('"')[0]
        response = await axios.get(`http://www.turkanime.tv/ajax/bolumler&animeId=${animeId}`, { "headers": headersAjax });

        let dict = new Map();
        while (match = regs.exec(response.data)) {
            dict.set(match[3], match[1])
        }
        return dict;
    } catch (error) {
        console.error(error);
    }
}

module.exports = { "bolumListesi": bolumListesi, "animeAra": animeAra, "animeListesi": animeListesi };