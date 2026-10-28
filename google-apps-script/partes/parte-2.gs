/* ── Phonology Exam II · parte 2 de 4 ── */

/* readings:start */
/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each target tests. Made from js/format.js: npm run gs. */
/* The key the teacher types on the Teacher page to see what each target tests
   (empty: nobody can). Only the teacher’s own copy has it. */
const TEACHER_KEY = "";

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
  [3,1,"SHE IS very glad she LEARNED ENGLISH in Canada.","She is, learned English",""],
  [3,2,"We WATCHED A movie for TWO HOURS last night.","watched a, two hours",""],
  [3,3,"JAMES’S UNCLE drives a BLACK CAR to work.","James’s uncle, black car",""],
  [3,4,"GEORGE’S OFFICE is very NEAR OUR new school.","George’s office, near our",""],
  [3,5,"The water RUNS OUT if you LEAVE IT open all day.","runs out, leave it",""],
  [3,6,"My sister PAINTED A cat with big BLUE EYES.","painted a, blue eyes",""],
  [3,7,"My FATHER’S IDEA was to make HOT TEA for everyone.","father’s idea, hot tea",""],
  [3,8,"The children PLAYED OUTSIDE AFTER ALL the rain.","played outside, after all",""],
  [3,9,"THREE OF us stayed in my AUNT’S APARTMENT in Madrid.","Three of, aunt’s apartment",""],
  [3,10,"The teacher ASKED US to CLEAN UP the classroom.","asked us, clean up",""],
  [4,1,"The REFUGEES will PROTEST at the city hall.","refugees, protest",""],
  [4,2,"The CONFLICT caused a lot of EXCITEMENT in town.","conflict, excitement",""],
  [4,3,"If you LOOK FOR a job, never GIVE UP.","look for, give up",""],
  [4,4,"She can’t KEEP UP WITH the new ENGINEERS.","keep up with, engineers",""],
  [4,5,"Your ESTIMATE is BASICALLY right, but a little high.","estimate, basically",""],
  [4,6,"Our body gets ENERGY from adenosine TRIPHOSPHATE.","energy, triphosphate",""],
  [4,7,"Grandma is FORGETFUL, but this song sounds FAMILIAR.","forgetful, familiar",""],
  [4,8,"The town DEPENDS ON ELECTRICITY from the river.","depends on, electricity",""],
  [4,9,"Please THROW AWAY that old TOOTHBRUSH.","throw away, toothbrush",""],
  [4,10,"We RAN OUT OF milk again this morning.","ran out of",""],
  [4,11,"Please write your CREDIT CARD NUMBER here.","credit card number",""],
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
    if (data.type === 'readings') return json_(readings_(data));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ── fin de la parte 2 de 4 ── */
