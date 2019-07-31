
const inquirer = require('inquirer')
const inquirerAutoComplete = require('./autocomplete')
const mpv = require('node-mpv')
const opsys = process.platform
const turkanime = require('./api/turkanime')

inquirer.registerPrompt('autocomplete', inquirerAutoComplete)

async function main() {
    let animeListesi = await turkanime.animeListesi()
    let animeSor = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'secilenAnime',
                suggestOnly: false,
                message: 'Anime seçin',
                searchIn: animeListesi,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!'
                },
            }
        ])
    let slug = animeListesi.get(animeSor.secilenAnime)
    let bolumListesi = await turkanime.bolumListesi(slug)

    let bolumSor = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'secilenBolum',
                suggestOnly: false,
                message: 'Bölümü seçin',
                searchIn: bolumListesi,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!'
                },
            }
        ])
    let bolumSlug = bolumListesi.get(bolumSor.secilenBolum)
    
    let videoListesi = await turkanime.bolumVideolari(bolumSlug)
    let fansubSor = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'secilenFansub',
                suggestOnly: false,
                message: 'Bir fansub seçin',
                searchIn: videoListesi,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!'
                },
            }
        ])
        secilenFansub = videoListesi.get(fansubSor.secilenFansub)
        let kaynakSor = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'secilenVideo',
                suggestOnly: false,
                message: 'Bir alternatif seçin',
                searchIn: secilenFansub,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!'
                },
            }
        ])
        let video = secilenFansub.get(kaynakSor.secilenVideo)
        
        let mpvAyar = (opsys == "win32" || opsys == "win64") ? {binary: 'mpv.exe'} : {}
        const mpvOynatici = new mpv(mpvAyar, ['--fps=60'])
        
        mpvOynatici.load(video)
        
        let baslik = null
        mpvOynatici.on('statuschange', (durum) => {
            if (durum['duration'] != null && durum['media-title'] != null) {
                baslik = mpvOynatici.getProperty('media-title') 
            }
        })
        let yenidenBaslat = 0
        mpvOynatici.on('stopped', () => {
            yenidenBaslat++
            mpvOynatici.stop()
            if (yenidenBaslat < 2) {
                console.log('Yeniden basliyoruz')
                return main()
            }
        })
        if (baslik !== null)
            console.log(baslik)
}

main()