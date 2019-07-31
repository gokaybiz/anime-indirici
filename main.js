
const turkanime = require('./api/turkanime')
const inquirer = require('inquirer')
const inquirerAutoComplete = require('./autocomplete')

inquirer.registerPrompt('autocomplete', inquirerAutoComplete)

;(async () => {
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
    console.log(bolumSlug)
})()
