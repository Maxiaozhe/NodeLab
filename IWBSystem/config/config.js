/*環境設定*/
module.exports = {
    /*画像ファイルの保存環境*/
    uploadPath: './public/upload/',
    APIKEY: "",
    ServiceAccountKey: "",
    WS_HOST:"ws://localhost",
    WS_PATH: "/ws", //resive client(IWB側)
    HPPT_PORT: "80",
    defaultUrl: "https://rfgricoh.sharepoint.com/teams/sharepoint669/SitePages/類似画像検索システム.aspx",
    postgreSql: {
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        database: 'BILDB',
        port: 5432,
        schema: "public"
    }
};
