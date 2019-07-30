const inquirer = require('inquirer');
const turkanime = require('./api/turkanime');

(async () => {

    var liste = await turkanime.animeListesi()
    console.log(liste)
})();