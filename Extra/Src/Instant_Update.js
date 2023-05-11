module.exports = async function() {
    const got = require('got');
    const log = require('npmlog');
    const fs = require('fs');
    const Database = require('../Database')
    const { execSync } = require('child_process');
    //make request https://raw.githubusercontent.com/KanzuXHorizon/Fca-Horizon-Remastered/main/package.json
    const { body } = await got('https://raw.githubusercontent.com/KanzuXHorizon/Global_Horizon/main/InstantAction.json');
    const json = JSON.parse(body);
    const LocalVersion = require('../../package.json').version;
        if (Number(LocalVersion.replace(/\./g,"")) < Number(json.Version.replace(/\./g,"")) ) {
            log.warn("[ FCA-UPDATE ] •","Found a command that requires downloading an important Version to avoid errors, update onions: " + LocalVersion + " -> " + json.Version);    
            log.warn("[ FCA-UPDATE ] •","Problem Description: " + json.Problem);
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                execSync(`npm install fca-horizon-remastered@${json.Version}`, { stdio: 'inherit' });
                log.info("[ FCA-UPDATE ] •","Update Complete, Restarting...");
                await new Promise(resolve => setTimeout(resolve, 3000));
                Database(true).set("Instant_Update", Date.now(), true);
                await new Promise(resolve => setTimeout(resolve, 3000));
                process.exit(1);
            }
            catch (err) {
                try {
                    log.warn("[ FCA-UPDATE ] •","Update Failed, Trying Another Method 1...");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    execSync(`npm install fca-horizon-remastered@${json.Version} --force`, { stdio: 'inherit' });
                    log.info("[ FCA-UPDATE ] •","Update Complete, Restarting...");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    Database(true).set("Instant_Update", Date.now());
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    process.exit(1);
                }
                catch (err) {
                    try {
                        log.warn("[ FCA-UPDATE ] •","Update Failed, Trying to clean package cache...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        execSync('npm cache clean --force', { stdio: 'inherit' });
                        log.info("[ FCA-UPDATE ] •","Cache Cleaned, Trying Another Method 2...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        //self delete fca-horizon-remastered folder from node_modules
                        fs.rmdirSync((process.cwd() + "/node_modules/fca-horizon-remastered" || __dirname + '../../../fca-horizon-remastered'), { recursive: true });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        execSync(`npm install fca-horizon-remastered@${json.Version}`, { stdio: 'inherit' });
                        log.info("[ FCA-UPDATE ] •","Update Complete, Restarting...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        Database(true).set("Instant_Update", Date.now());
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        process.exit(1);
                    }
                    catch (e) {
                        console.log(e);
                        log.error("[ FCA-UPDATE ] •","Update Failed, Please Update Manually");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        log.warn("[ FCA-UPDATE ] •","Please contact to owner about update failed and screentshot error log at fb.com/Lazic.Kanzu");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        process.exit(1);
                    }
                }
            }
        }
    else {
        return Database(true).set("NeedRebuild", false);
    }
}