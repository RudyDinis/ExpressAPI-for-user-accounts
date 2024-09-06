var mysql = require('mysql');
var dbinfos = {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: ''
};

function handleDisconnect() {
    console.log("Connexion à la bdd")
    connection = mysql.createConnection(dbinfos);


    connection.connect(function onConnect(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            console.log('**Erreur connexion Mysql**', 'quelque chose s\'est mal passé', err.message)

            setTimeout(handleDisconnect, 10000);
        } else { 

        }
    });

    connection.on('error', function onError(err) {

        if (err.code == 'PROTOCOL_CONNECTION_LOST' || err.code == 'ECONNRESET' ) {
            handleDisconnect();
        } else { 

        }
    });
}
handleDisconnect();

module.exports = connection