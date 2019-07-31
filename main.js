
const turkanime = require('./api/turkanime');
const { AutoComplete } = require('enquirer');
let inquirer = require('inquirer');
let fuzzy = require('fuzzy');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

(async () => {

    let animeListesi = await turkanime.animeListesi();
    function animeAra(answers, input) {
        input = input || '';
        return new Promise(function (resolve) {
            setTimeout(function () {
                var fuzzyResult = fuzzy.filter(input, Array.from(animeListesi.entries()), {
                    extract: function (arg) {
                        return arg[0];
                    }
                });

                resolve(
                    fuzzyResult.map(function (el) {
                        return el.original[0];
                    })
                );
            }, 1);
        });
    }
    let anime = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'anime',
                suggestOnly: false,
                message: 'Anime seçin',
                source: animeAra,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!';
                },
            }
        ])
    let slug = animeListesi.get(anime["anime"]);
    let bolumListesi = await turkanime.bolumListesi(slug);
    function bölümAra(answers, input) {
        input = input || '';
        return new Promise(function (resolve) {
            setTimeout(function () {
                var fuzzyResult = fuzzy.filter(input, Array.from(bolumListesi.entries()), {
                    extract: function (arg) {
                        return arg[0];
                    }
                });

                resolve(
                    fuzzyResult.map(function (el) {
                        return el.original[0];
                    })
                );
            }, 1);
        });
    }

    let bölüm = await inquirer
        .prompt([
            {
                type: 'autocomplete',
                name: 'bölüm',
                suggestOnly: false,
                message: 'Bölümü seçin',
                source: bölümAra,
                pageSize: 20,
                validate: function (val) {
                    return val ? true : 'Type something!';
                },
            }
        ])
    let bölümSlug = bolumListesi.get(bölüm["bölüm"]);
    console.log(bölümSlug)



})();