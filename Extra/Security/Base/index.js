'use strict';
  
const fs = require('fs-extra');
const utils = require('../../../utils');
const logger = require('../../../logger');
const Step_3 = require('./Step_3');
const Database = require("../../Database");
const Already_Action = { First: 0, Encode: { Status: false, Data: Array }, Decode: { Status: false,  Data: Array } }; 

var ArrPassWord;

if (!fs.existsSync(process.cwd() + '/Horizon_Database') || !fs.existsSync(process.cwd() + '/Horizon_Database/RandPass.json')) {
  const crypto = require('crypto');
  ArrPassWord = Array.from({length: 101}, (_,i) => crypto.randomBytes(5).toString('hex'));
  if (Database().has('Security')) {
    Database().delete('Security');
  }
  if (!fs.existsSync(process.cwd() + '/Horizon_Database')) {
    fs.mkdirSync(process.cwd() + '/Horizon_Database');
  }
  fs.writeFileSync(process.cwd() + '/Horizon_Database/RandPass.json', JSON.stringify(ArrPassWord, null, 2), 'utf8');
}

else {
  ArrPassWord = JSON.stringify(fs.readFileSync(process.cwd() + '/Horizon_Database/RandPass.json'));
}
  
  /**
   * It creates a random string of a given length
   * @param length - The length of the string to be generated.
   * @returns A string of random characters.
   */

  function CreateFakeType2(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/+0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
  }

  /**
   * It returns a random number between the min and max values.
   * @param min - The minimum number that can be generated.
   * @param max - The maximum number that can be generated.
   * @returns A random number between the min and max values.
   */

  function Between(min, max) { 
    return parseInt(Math.random() * (max - min) + min);
  } 

  /**
   * It creates a random number between 0 and 90, then subtracts a random number between 10 and 33 from
   * it, and then adds 10 to it.
   * 
   * So, the result is a number between -23 and 90.
   * 
   * The function also creates a random number between 10 and 70, and a random number between 10 and 33.
   * 
   * The function returns an object with the following properties:
   * 
   * Security: the random number between 0 and 90
   * Previous: the random number between -23 and 90
   * Secret: the random number between 10 and 33
   * Number: the random number between 10 and 70
   * @returns An object with the following properties:
   */

  function CreateSecurity() {
    var Security = Between(0,90);
    var Secret = Between(10,33);
    return {
      Security: Security,
      Previous: parseInt(Security) - Secret,//after + (10) main   + random
      Secret: Secret, // save
      Number: Between(10,50) // vị trí của real appstate trừ 10
    };
  }

  /**
   * It checks if the file exists, if it doesn't, it creates it and writes some data to it. If it does
   * exist, it reads the data from it and returns it
   * @param DefaultPassWord - The password you want to use.
   * @returns An object with the following properties:
   */

  function CheckAndParse(DefaultPassWord) {
    var PassWord = new Array();
    if (!DefaultPassWord) return logger.Warning("DefaultPassWord Is Requirements",function() { process.exit(0); });
      try {
        if (!Database().has('Security')) { 
          let Obj = CreateSecurity();
          Database().set('Security',JSON.stringify(Obj));
          for (let i = 1; i < 10; i ++) PassWord.push(ArrPassWord[parseInt(Obj.Security) + parseInt(i)]);
          return { PassWord: String(DefaultPassWord) + "-" + String(PassWord.join('-')), Slot: Obj.Number ,Security: Obj.Security, Previous: Obj.Previous, Secret: Obj.Secret };
        }
        else {
          var Data = JSON.parse(Database().get('Security'));
          if (utils.getType(Data) == "Object") {
            if (!Data.Security || !Data.Previous || !Data.Secret || !Data.Number) { 
              logger.Error('Data Deficit Detection, Reset Data');
              let Obj = CreateSecurity();
              Database().set('Security',JSON.stringify(Obj));
              for (let i = 1; i < 10; i ++) PassWord.push(ArrPassWord[parseInt(Obj.Security) + parseInt(i)]);
              return { PassWord: String(DefaultPassWord) + "-" + String(PassWord.join('-')), Slot: Obj.Number ,Security: Obj.Security, Previous: Obj.Previous, Secret: Obj.Secret };
            }
            else { 
              for (let i = 1; i < 10; i ++) PassWord.push(ArrPassWord[parseInt(Data.Security) + parseInt(i)]);
              return { PassWord: String(DefaultPassWord) + "-" + String(PassWord.join('-')), Slot: Data.Number ,Security: Data.Security, Previous: Data.Previous, Secret: Data.Secret };
            }
          } 
        }
      }
    catch (e) {
      logger.Error("Something went wrong: " + e, function() {
        let Obj = CreateSecurity();
        Database().set('Security',JSON.stringify(Obj));
        for (let i = 1; i < 10; i ++) PassWord.push(ArrPassWord[parseInt(Obj.Security) + parseInt(i)]);
        return { PassWord: String(DefaultPassWord) + "-" + String(PassWord.join('-')), Slot: Obj.Number ,Security: Obj.Security, Previous: Obj.Previous, Secret: Obj.Secret };
      });
    }
  }

  /**
   * CreatePassWord() takes a string and an object as arguments, and returns a string.
   * @param DefaultPassWord - The default password that you want to use.
   * @param ParseObj - This is the object that is being parsed.
   * @returns A string of the DefaultPassWord and the PassWord array joined by a dash.
   */

  function CreatePassWord(DefaultPassWord,ParseObj) {
    var PassWord = new Array();
      for (let i = 1; i < 10; i ++) PassWord.push(ArrPassWord[parseInt(ParseObj.Security) + parseInt(i)]);
    return String(DefaultPassWord) + "-" + String(PassWord.join('-'));
  }

  /* Encrypting the AppState with the PassWord. */

  var Encrypt = (AppState,PassWord) => { 
    return require('./Step_3').encryptState(require('./Step_2').Encrypt(require('./Step_1').EncryptState(AppState,PassWord)),PassWord);
  };

  /* Decrypting the AppState. */

  var Decrypt = (AppState,Slot,PassWord) => { 
    return require('./Step_1').DecryptState(require('./Step_2').Decrypt(require('./Step_3').decryptState(String(AppState[parseInt(Slot) - 10]),PassWord)),PassWord);
  };

  /* A module that is used to encrypt and decrypt the AppState. */

  module.exports = function(AppState,DefaultPass,Type) { 
    switch (Type) {
      case "Encrypt": {
        var Data_Return;
          if (!Already_Action.Encode.Status) {
            if (Already_Action.First == 0) Already_Action.First = 1;
            const Obj = CreateSecurity(),PassWord = CreatePassWord(DefaultPass,Obj),AppState_Encrypt = Encrypt(AppState,PassWord); Database().set('Security',JSON.stringify(Obj,null,2));
            Data_Return = Array.from({length: 60}, (_,i) => { 
              if (i == (parseInt(Obj.Number) - 10)) { 
                return AppState_Encrypt; 
              } 
              else return Step_3.encryptState(CreateFakeType2(AppState_Encrypt.length),PassWord).slice(0,AppState_Encrypt.length);
            });
            Already_Action.Encode.Status = true;
            Already_Action.Encode.Data = Data_Return;
          }
          else {
            Data_Return = Already_Action.Encode.Data;
          }
        return Data_Return;
      }
      case "Decrypt": {
        var AppState_Decrypt;
          if (!Already_Action.Decode.Status) {
            const Parse = CheckAndParse(DefaultPass);
            AppState_Decrypt = Decrypt(AppState,Parse.Slot,Parse.PassWord);
            if (Already_Action.First == 0) {
              Already_Action.Encode.Status = true;
              Already_Action.Encode.Data = AppState;
            }
            Already_Action.Decode.Status = true;
            Already_Action.Decode.Data = AppState_Decrypt;
          }
          else {
            AppState_Decrypt = Already_Action.Decode.Data;
          }
        return AppState_Decrypt;
      }
    }
  };