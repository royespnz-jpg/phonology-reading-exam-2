/* ── Phonology Exam II · parte 2 de 4 ── */

/* readings:start */
/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each target tests. Made from js/format.js: npm run gs. */
const READINGS_ROWS_1 = [
  [1,1,"The SHEEP were taken to the island by SHIP last week.","sheep, ship",""],
  [1,2,"Our CAT CAUGHT a little mouse in the garden yesterday.","cat, caught",""],
  [1,3,"The old man who lives in the HUT has a very kind HEART.","hut, heart",""],
  [1,4,"We were DONE with all the work before DAWN.","done, dawn",""],
  [1,5,"A big TRUCK stopped right next to the train TRACK.","truck, track",""],
  [1,6,"LUKE wants to LOOK at the photos from the trip.","Luke, look",""],
  [1,7,"He WOULD have WOOED her with flowers and songs.","would, wooed",""],
  [1,8,"WHO’D like to wear the red HOOD tonight?","Who’d, hood",""],
  [1,9,"There was black SOOT on his new SUIT.","soot, suit",""],
  [1,10,"Our KOOKY neighbor bakes a COOKIE every day.","kooky, cookie",""],
  [2,1,"Babies TEETHE when their first TEETH appear.","teethe, teeth",""],
  [2,2,"Please don’t WASH your new WATCH with soap.","wash, watch",""],
  [2,3,"The price of RICE will RISE again next month.","rice, rise",""],
  [2,4,"It is no JOKE: the egg YOLK is green.","joke, yolk",""],
  [2,5,"JACQUES wants to ride a YAK in the mountains.","Jacques, yak",""],
  [2,6,"A soldier of the LEGION had a LESION on his arm.","legion, lesion",""],
  [2,7,"In his LEISURE time, he writes in a big LEDGER.","leisure, ledger",""],
  [2,8,"The guard wore a BEIGE jacket and a gold BADGE.","beige, badge",""],
  [2,9,"The new VERSION of the story is about a VIRGIN forest.","version, virgin",""],
  [2,10,"She made a COLLAGE for her COLLEGE art class.","collage, college",""],
  [3,1,"WOULD YOU like to try the FISH AND CHIPS today?","Would you, fish and chips",""],
  [3,2,"DON’T YOU think we OUGHT TO call the doctor right now?","Don’t you, ought to",""],
  [3,3,"We will travel to Spain THIS YEAR, AS USUAL.","this year, as usual",""],
  [3,4,"Please PUT IT on the table and TELL THEM to wait.","put it, tell them",""],
  [3,5,"GIVE HIM SOMETHING cold to drink after the game.","Give him, something",""],
  [3,6,"The answer is WRITTEN in the CENTER of the page.","written, center",""],
  [3,7,"WHAT DO YOU think of THAT GIRL in the red dress?","What do you, that girl",""],
  [3,8,"She bought TEN BOOKS, but MOSTLY she reads online.","ten books, mostly",""],
  [3,9,"Please TURN OFF the lights and LET ME sleep a little longer.","turn off, let me",""],
  [3,10,"The new LIBRARY has very COMFORTABLE chairs.","library, comfortable",""],
  [4,1,"The singer will RECORD her new songs in the DESERT.","record, desert",""],
  [4,2,"The workers PROTEST because the new CONTRACT is unfair.","protest, contract",""],
  [4,3,"The scientist found a MINUTE OBJECT in the water.","minute, object",""],
  [4,4,"We REFUSE to accept the PERMIT for the factory.","refuse, permit",""],
  [4,5,"Our farmers PRODUCE coffee, our main EXPORT.","produce, export",""],
  [4,6,"She was UPSET because the PRESENT was broken.","upset, present",""],
  [4,7,"The students will PERFECT their PROJECT before Friday.","perfect, project",""],
  [4,8,"My grandfather is CONTENT with his PROGRESS this month.","content, progress",""],
  [4,9,"The police SUSPECT that the REBEL is hiding in town.","suspect, rebel",""],
  [4,10,"They will REFUND you if your ticket is INVALID.","refund, invalid",""],
];

function readingRows_() {
  return [].concat(READINGS_ROWS_1);
}
/* readings:end */


function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  reference_('rubric', rubric_());
  reference_('readings', readingRows_());
  rootFolder_();
  const msg = 'Listo: hojas Exams, Responses, Rubric y Readings, y la carpeta «' + ROOT_FOLDER +
    '» en tu Drive. Ahora implementá la aplicación web.';
  Logger.log(msg);
  return msg;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP).addItem('Configurar (setup)', 'setup').addToUi();
}

function doGet() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  return json_({ ok: true, app: APP, sheet: name, version: VERSION });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'start') return json_(withLock_(function () { return start_(data); }));
    if (data.type === 'recording') return json_(recording_(data));
    if (data.type === 'finish') return json_(withLock_(function () { return finish_(data); }));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ── fin de la parte 2 de 4 ── */
