/* eslint-disable linebreak-style */

function addDB(db, params, options) {
    const get = require('lodash/get');
    const set = require('lodash/set');

  // Fetch entry
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  
  // If not found, create empty row
  if (!fetched) {
    db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
    fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
  }

  // Check if a target was supplied
  if (params.ops.target) {
    fetched = JSON.parse(fetched.json);
    try { fetched = JSON.parse(fetched) } catch (e) {}
    params.data = JSON.parse(params.data);
    let oldValue = get(fetched, params.ops.target);
    if (oldValue === undefined) oldValue = 0;
    else if (isNaN(oldValue)) throw new Error(`Data @ ID: "${params.id}" IS NOT A number.\nFOUND: ${fetched}\nEXPECTED: number`);
    params.data = set(fetched, params.ops.target, oldValue + params.data);
  } else {
    if (fetched.json === '{}') fetched.json = 0;
    else fetched.json = JSON.parse(fetched.json)
    try { fetched.json = JSON.parse(fetched) } catch (e) {}
    if (isNaN(fetched.json)) throw new Error(`Data @ ID: "${params.id}" IS NOT A number.\nFOUND: ${fetched.json}\nEXPECTED: number`);
    params.data = parseInt(fetched.json, 10) + parseInt(params.data, 10);
  }
  // Should do the trick!
  // Stringify data
  params.data = JSON.stringify(params.data);

  // Update entry with new data
  db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
  
  // Fetch & return new data
  let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
  if (newData === '{}') return null;
  else {
    newData = JSON.parse(newData)
    try { newData = JSON.parse(newData); } catch (e) {}
    return newData;
  }
}

function allDB(db, params, options) {
  
  // Fetch Entry
  var stmt = db.prepare(`SELECT * FROM ${options.table} WHERE ID IS NOT NULL`);
  let resp = [];
  for (var row of stmt.iterate()) {
    try {
      resp.push({
        ID: row.ID,
        data: JSON.parse(row.json)
      });
    } catch (e) {
        return [];
    }
  }
  
  return resp;
}

function clearDB(db, params, options) {
  
    // Delete all Rows
    let fetched = db.prepare(`DELETE FROM ${options.table}`).run();
    if(!fetched) return null;
    
    // Return Amount of Rows Deleted
    return fetched.changes;
    
}

function deleteDB(db, params, options) {
    const unset = require('lodash/unset');
  // Fetch Entry
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  if (!fetched) return false; // If empty, return null
  else fetched = JSON.parse(fetched.json);
  try { fetched = JSON.parse(fetched); } catch (e) {}
  
  // Check if the user wants to delete a prop inside an object
  if (typeof fetched === 'object' && params.ops.target) {
    unset(fetched, params.ops.target);
    fetched = JSON.stringify(fetched);
    db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(fetched, params.id);
    return true;
  }
  else if (params.ops.target) throw new TypeError('Target is not an object.');
  else db.prepare(`DELETE FROM ${options.table} WHERE ID = (?)`).run(params.id);
  
  // Resolve
  return true;
}

function fetchDB(db, params, options) {
    const get = require('lodash/get');
  // Fetch Entry
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  if (!fetched) return null; // If empty, return null
  fetched = JSON.parse(fetched.json)
  try { fetched = JSON.parse(fetched) } catch (e) {}
  
  // Check if target was supplied
  if (params.ops.target) fetched = get(fetched, params.ops.target); // Get prop using dot notation
  
  // Return data
  return fetched;
}

function hasDB(db, params, options) {
    const get = require('lodash/get');
   // Fetch Entry
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) return false; // If empty, return false
   else fetched = JSON.parse(fetched.json);
   try { fetched = JSON.parse(fetched) } catch (e) {}
   
   // Check if target was supplied
   if (params.ops.target) fetched = get(fetched, params.ops.target); // Get prop using dot notation
 
   // Return boolean
   return (typeof fetched != 'undefined');
} // Papa bless, you here? I think we need update, push wasn't working.

function pushDB(db, params, options) {
    const get = require('lodash/get');
    const set = require('lodash/set');
  // Fetch entry
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  
  // If not found, create empty row
  if (!fetched) {
    db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
    fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
  }
  
  // Check if a target was supplied
  if (params.ops.target) {
    fetched = JSON.parse(fetched.json);
    try { fetched = JSON.parse(fetched) } catch (e) {}
    params.data = JSON.parse(params.data);
    if (typeof fetched !== 'object') throw new TypeError('Cannot push into a non-object.');
    let oldArray = get(fetched, params.ops.target);
    if (oldArray === undefined) oldArray = [];
    else if (!Array.isArray(oldArray)) throw new TypeError('Target is not an array.');
    oldArray.push(params.data);
    params.data = set(fetched, params.ops.target, oldArray);
  } else {
    if (fetched.json === '{}') fetched.json = [];
    else fetched.json = JSON.parse(fetched.json);
    try { fetched.json = JSON.parse(fetched.json); } catch (e) {}
    params.data = JSON.parse(params.data);
    if (!Array.isArray(fetched.json)) throw new TypeError('Target is not an array.');
    fetched.json.push(params.data);
    params.data = fetched.json;
  }
  
  // Stringify data
  params.data = JSON.stringify(params.data);

  // Update entry with new data
  db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
  
  // Fetch & return new data
  let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
  if (newData === '{}') return null;
  else {
    newData = JSON.parse(newData)
    try { newData = JSON.parse(newData) } catch (e) {}
    return newData
  }
}

function setDB(db, params, options) {
    const set = require('lodash/set');
  // Fetch entry
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  // If not found, create empty row
  if (!fetched) {
    db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
    fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  }
  
  // Parse fetched
 
  try { fetched = JSON.parse(fetched); console.log(fetched) } catch (e) {}

  // Check if a target was supplied
  if (typeof fetched === 'object' && params.ops.target) {
    params.data = JSON.parse(params.data);
    params.data = set(fetched, params.ops.target, params.data);
  } else if (params.ops.target) throw new TypeError('Cannot target a non-object.');

  // Stringify data
  params.data = JSON.stringify(params.data);

  // Update entry with new data
  db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
  
  // Fetch & return new data
  let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
  if (newData === '{}') return null;
  else {
    try { newData = JSON.parse(newData); } catch (e) {
      console.log(e);
    }
    return newData;
  }
}

function subtractDB(db, params, options) {
    const get = require('lodash/get');
    const set = require('lodash/set');
   // Fetch entry
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  
   // If not found, create empty row
   if (!fetched) {
     db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
     fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
   }
 
   // Check if a target was supplied
   if (params.ops.target) {
     try { fetched = JSON.parse(fetched); } catch (e) {}
     params.data = JSON.parse(params.data);
     let oldValue = get(fetched, params.ops.target);
     if (oldValue === undefined) oldValue = 0;
     else if (isNaN(oldValue)) throw new Error('Target is not a number.');
     params.data = set(fetched, params.ops.target, oldValue - params.data);
   } else {
     if (fetched.json === '{}') fetched.json = 0;
     else fetched.json = JSON.parse(fetched.json);
     try { fetched.json = JSON.parse(fetched); } catch (e) {}
     if (isNaN(fetched.json)) throw new Error('Target is not a number.');
     params.data = parseInt(fetched.json, 10) - parseInt(params.data, 10);
   }
   
   // Stringify data
   params.data = JSON.stringify(params.data);
 
   // Update entry with new data
   db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
   
   // Fetch & return new data
   let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
   if (newData === '{}') return null;
   else {
     try { newData = JSON.parse(newData); } catch (e) {}
     return newData;
   }
}

function typeDB(db, params, options) {
    const get = require('lodash/get');
   // Fetch Entry
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) return null; // If empty, return null
   fetched = JSON.parse(fetched.json);
   try { fetched = JSON.parse(fetched); } catch (e) {}
   
   // Check if target was supplied
   if (params.ops.target) fetched = get(fetched, params.ops.target); // Get prop using dot notation
   
   // Return data
   return typeof fetched;
}

module.exports = {
    add:addDB,
    all:allDB,
    clear:clearDB,
    deleteDB:deleteDB,
    fetch:fetchDB,
    has:hasDB,
    push:pushDB,
    set:setDB,
    subtract:subtractDB,
    type:typeDB
};