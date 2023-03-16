const { hash } = require('bcrypt');

hash('EXPÉTACULA EX-PAI DO MAN', 10).then((data) => console.log(data));
