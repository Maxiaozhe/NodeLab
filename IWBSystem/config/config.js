/*環境設定*/
module.exports = {
    /*画像ファイルの保存環境*/
    uploadPath: './public/upload/',
    APIKEY: "XXXXXXXXXXXXXXXXXXXXXXXXX",
    ServiceAccountKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    WS_HOST:"ws://11.12.22.11",
    WS_PATH: "/ws", //resive client(IWB側)
    HPPT_PORT:"80",
    postgreSql: {
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        database: 'BILDB',
        port: 5432,
        schema: "BIL"
    }
};