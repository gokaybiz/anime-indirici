const inquirer = require('inquirer');
const turkanime = require('./api/turkanime');

(async () => {

    let liste = await turkanime.animeListesi()
    console.log(liste)
})();