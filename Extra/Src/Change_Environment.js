module.exports = async function(callback) {
    const got = require('got');
    const log = require('npmlog');
    const fs = require('fs');
    const Database = require('../../Extra/Database');
    const Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
    const Check = fs.readFileSync(process.cwd() + "/replit.nix", { encoding: 'utf8' });
    switch (Check.includes('pkgs.nodejs-14_x')) {
        case true: {
            Database(true).set("NeedRebuild", false);
            return;
        }
        case false: {
            log.warn("[ FCA-HZI ] •",Language.EVMChange);
            const { body } = await got('https://raw.githubusercontent.com/KanzuXHorizon/Global_Horizon/main/repl.nix');
            fs.writeFileSync(process.cwd() + "/replit.nix", body, { encoding: 'utf8' });
            log.info("[ FCA-HZI ] •",Language.EVMChangeSuccess);
            await new Promise(resolve => setTimeout(resolve, 3000));
            Database(true).set("NeedRebuild", true);
            process.exit(1);
        }
    }

}