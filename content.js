/* The Last Word — world content.
 * Markup used in strings:
 *   [[RA GV]]   Lumen glyphs (R A G B W V), space = dark gap between words
 *   {x:<word>}  an exiled word: shown as a gap the length of the word
 *   {X:<word>}  an exiled word spoken aloud (shown briefly, then fades to a gap)
 *   *text*      emphasis
 *   blank line  paragraph break; single newline = line break
 */
(function (root) {
  'use strict';

  var EXILED = ['sorry', 'perhaps', 'tomorrow', 'why', 'lonely', 'love', 'welcome', 'petrichor', 'mizzle', 'home'];

  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

  var INTRO = [
    `You are the new Keeper of the Light on Lesser Hush.`,
    `The packet boat would go no nearer than the shoals, so they put you over the side in a rowboat — the same rowboat that came drifting into the Admiralty harbour three weeks ago, empty, with a letter in a jar.`,
    `You row until the dark in front of you becomes an island.`
  ];

  /* ---------------------------------------------------------------- clues */
  var CLUES = {
    letter: `Odile's letter: the island is short a word, and I will have to find it.`,
    ship: `A ship offshore blinks the same short pattern, over and over.`,
    sign: `The jetty sign: a boat coming in, a crowd on the jetty waving.`,
    mangle: `The tides here are wound by hand on the Tide Mangle — five notches, I to V.`,
    lowtide: `At the first notch the sea draws right back: a cave at the cliff foot, a wreck on the sand.`,
    margery: `The Margery ran on the Teeth at the second notch. Her mate: a keel like hers wanted the fifth.`,
    stones: `The old gravestones carry no words — only carvings, and lenses set beside them.`,
    notyet: `A keeper's stone stands ready on the clifftop with no name on it. "Not yet."`,
    barred: `The lighthouse door is barred — from the inside.`,
    cotlock: `Cottage door: SPEAK WHO YOU ARE, AND ENTER. Three lens-sockets.`,
    desk: `Odile's list: the Ballast must be "called properly"; none of the Signal Book's twenty-four will do.`,
    sampler: `Odile's sampler: "{x:home} is the land where our people are." The first word is gone.`,
    chalk: `Chalk on the doorframe: "I — cave way open … V — Teeth under. Big keels only."`,
    parrot: `Ponder says words that won't stay written down.`,
    decrees: `Decree III: the Ballast comes in only when the Light calls her {x:home}.`,
    halllock: `The Hall door: THE FIRST WORD OPENS. Five letter-wheels.`,
    firstword: `Log: the first word ever caught was what Pell said when he trod on Odile's foot.`,
    cave: `Log: the cave leads into the lighthouse, and is only dry at the first notch.`,
    teeth: `Log: the Ballast draws so deep she could only clear the Teeth on the fifth notch.`,
    loophole: `Log: Pell netted every spoken and written word — but never the lenses.`,
    nosignal: `Log: Odile searched the Signal Book a hundred times. Nothing meant what she needed.`,
    bricks: `Log: Odile wondered if the lenses were less like names and more like bricks.`,
    gone: `Log: Odile rowed out to the Ballast to keep the words company.`,
    slate: `Odile's slate: what she flashed at the ship, and what it answered.`,
    signalbook: `The Signal Book: twenty-four signals, each glossed.`,
    charter: `The Charter: "…when the Light calls her {x:home}. As the Light has no such word, nor ever had, the matter is closed."`,
    registry: `Registry No. 40 (4 letters): the land where one's people are.`,
    lamp: `The lamp room: a lens panel, a FLASH lever, and the lamp turns to face four ways.`,
    contact: `When I flashed [[RA]] at the ship, its lantern went wild.`,
    refused: `The ship answered [[W GV]] — as if it would like to, and can't.`,
    reefWarned: `The ship started in — then stopped, flashed [[GG]], and backed away.`,
    jar: `I let a word out of a jar, and every gap it left filled in again.`
  };

  /* ------------------------------------------------------- signal book */
  var SIGNALS = [
    ['R', 'Light seen; acknowledged'],
    ['RR', 'Danger; keep clear'],
    ['RA', 'The keeper speaks'],
    ['RG', 'This station (Lesser Hush Light)'],
    ['RRB', 'Fire at sea'],
    ['B', 'Open water'],
    ['BB', 'Heavy weather'],
    ['BA', 'Crew; sailors'],
    ['BG', 'A vessel'],
    ['BV', 'Stand off; put to sea'],
    ['BBV', 'Storm coming'],
    ['BAV', 'Crew in the water'],
    ['G', 'Land; the island'],
    ['GG', 'Rocks; the Teeth'],
    ['GV', 'You may land'],
    ['GGB', 'Shoal water'],
    ['A', 'One person'],
    ['AA', 'A crowd; many persons'],
    ['AV', 'Party coming ashore'],
    ['AAV', 'The village is leaving'],
    ['RAV', 'Keeper coming out'],
    ['W', 'No; negative'],
    ['WGV', 'Do not land'],
    ['WR', 'Light failing']
  ];

  var REGISTRY = [
    [1, 5, `What one says, having trodden on a foot.`],
    [2, 7, `An answer that is neither yes nor no.`],
    [3, 8, `The day after this one.`],
    [5, 3, `The word for asking after reasons. Questions are idle.`],
    [9, 6, `How a room feels with only you in it.`],
    [11, 4, `The Council could not agree what this one meant, and exiled it to save time.`],
    [12, 7, `What one says to a person arriving.`],
    [17, 9, `The smell of rain on dry stone.`],
    [19, 6, `Rain that is only pretending.`],
    [26, 5, `A small, unnecessary hat.`],
    [31, 8, `The word for a word on the tip of one's tongue.`],
    [33, 7, `Of a gull: looking as if it knows something.`],
    [40, 4, `The land where one's people are. *Struck last, on the special motion of Ald. Pell, that the Charter may never be fulfilled.*`]
  ];

  /* ------------------------------------------------------------ the log */
  // [id, date, author, text]
  var ENTRIES = [
    ['e01', '2 March 1872', 'S. Marrow', `Odile has finished her sampler and hung it over the stove. She asked me {x:why} it should be the land where our people are, and not the land where our things are. I said things don't miss you. She has gone off to think about that one.`],
    ['e02', '11 June 1876', 'S. Marrow', `Taught Odile the whole Signal Book. Twenty-four signals; she had them all by teatime, and then asked {x:why} there weren't more. "Because there aren't," I said. Not my best answer.`],
    ['e03', '30 October 1879', 'S. Marrow', `Wound the Mangle up to the fifth notch for the coal boat. A big keel needs every inch the Mangle can give to clear the Teeth. Odile asked whether the Moon minds. I told her the Moon was retired in 1790 and has never been happier.`],
    ['e04', '18 November 1882', 'O. Marrow', `Father died in the night, very quietly, as if he didn't want to bother anyone. The Admiralty letter says I am Keeper now. I have cut his stone myself: the lantern-man, red and amber, the way the old stones have it.`],
    ['e05', '9 April 1883', 'O. Marrow', `Meeting at the Hall. Alderman Pell says the island talks too much and thinks too little, and that words, like sheep, must earn their keep or go. Everyone laughed. Then he brought out the butterfly nets, and nobody laughed.`],
    ['e06', '1 May 1883', 'O. Marrow', `The Thrift began today. The first word they caught was {x:sorry}. Pell said it when he trod on my foot on the Hall steps — and the net came down over his mouth, and the word was gone. Out of his mouth and everyone's, and out of every book on the island. I looked in Father's log where he wrote it once. There is a gap.`],
    ['e07', '20 June 1883', 'O. Marrow', `Forty words gone this month. Mrs Pask can't say {x:tomorrow} any more, so she says "the day after this one", which takes three times as long, which Pell does not seem to have thought of.`],
    ['e08', '2 September 1883', 'O. Marrow', `They have loaded the jars onto the old collier and renamed her the BALLAST, because, says Pell, words are heavy. The jars clink in her hold like a wedding. She sails at dawn.`],
    ['e09', '20 September 1883', 'O. Marrow', `The Charter is pinned up. The Ballast is to stand off the island for ever, and the Light — that's me — is to warn her off every night she comes near. [[RR BV]]: danger, stand off. I signed it. I was nineteen and I signed it.`],
    ['e10', '14 October 1883', 'O. Marrow', `The Ballast draws deeper than anything that ever came here, with all those jars in her. Pell made sure of that. She could only clear the Teeth on the fifth notch, and the fifth notch is mine to wind, and I won't.`],
    ['e11', '8 March 1884', 'O. Marrow', `Wound the sea down to the first notch and walked the cave way into the lighthouse with the oil, instead of lugging it round by the yard. Wet feet, half the work. The cave is only dry at the first notch; I came out with the sea round my knees.`],
    ['e12', '1 July 1886', 'O. Marrow', `Pell had the last word struck today, by special motion. Nobody knows what it was, because nobody can say it now. There is a hole at the end of the Charter where it used to be. I have a feeling it was the most important word in the whole thing.`],
    ['e13', '15 May 1888', 'O. Marrow', `Repainted the jetty sign: the boat coming in, everyone waving. [[BA GV]] — sailors, come in. Nobody comes in. But it's a good sign.`],
    ['e14', '29 August 1890', 'O. Marrow', `The Fenns went to the mainland today. Young Tam Fenn tried to tell me {x:why} and couldn't — the word is at sea. He stood on the jetty opening and shutting his mouth like a cod.`],
    ['e15', '10 October 1892', 'O. Marrow', `The lamp eats matches in this damp. One, two, and the third will take. Keep the tin on the sill.`],
    ['e16', '2 February 1894', 'O. Marrow', `Ponder has learned to say "Get off my foot, Pell!" I cannot think where from. The Thrift can't net his words; he is not a citizen. He is, says Pell, "a bird of no fixed vocabulary".`],
    ['e17', '11 November 1897', 'O. Marrow', `Ponder said a word today I haven't heard in fourteen years. I sat down on the floor. I made him say it again and again. I tried to write it here and it wouldn't stay on the page; the ink just slid off.`],
    ['e18', '8 August 1899', 'O. Marrow', `The Mangle's plate says the Moon was found unreliable. I asked Father once who found it so. "The Council," he said. There has always been a Council.`],
    ['e19', '1 January 1901', 'O. Marrow', `New century. The Ballast comes round the point every night now, lantern lit. Every night I flash her off. Every night she answers [[R]]: seen.`],
    ['e20', '17 April 1905', 'O. Marrow', `Alderman Pell left for the mainland today. He stood on the jetty a long time and looked at me and moved his mouth. I think he wanted to say {x:sorry}. I think he couldn't. It is the only joke the Thrift ever made, and he made it on himself.`],
    ['e21', '30 May 1907', 'O. Marrow', `Counted the jars in my head again: three hundred and twelve words. I miss about nine of them terribly, and the rest only a little.`],
    ['e22', '24 December 1910', 'O. Marrow', `The village is empty but for me and the bird. I keep the Light. I am not sure who for.`],
    ['e23', '3 March 1915', 'O. Marrow', `Reading the Charter again. Only when the Light calls her — the LIGHT. Not a mouth, not a pen: the Light. Pell netted every word that was ever spoken or written down, but he never once thought of the lenses. Lumen is whole. If I can say it in light, it doesn't matter what's at sea.`],
    ['e24', '4 March 1915', 'O. Marrow', `But there is no such signal. I have been through the Signal Book a hundred times. Twenty-four signals, and not one of them means it. {x:perhaps} there is no word for it at all. Father said: because there aren't.`],
    ['e25', '9 September 1919', 'O. Marrow', `Tried to call her in. [[G]], the land: she answered [[W]]. [[RG]], this station: [[W]]. [[GV]], you may land: [[W GV]]. She wants to. The Charter won't let her. It has to be the word.`],
    ['e26', '30 June 1923', 'O. Marrow', `The stones on the clifftop are older than the Signal Book. The lantern-man, the boat-man, the four holding hands. I always took the lenses for names, the way ships have names. Lately I wonder whether they are more like bricks.`],
    ['e27', '30 August 1924', 'O. Marrow', `My eyes aren't what they were. At night red and amber look the same to me now, and green and blue. The next keeper will have to do it.`],
    ['e28', '2 September 1924', 'O. Marrow', `If I can't call them in, I can go out to them. They oughtn't to be out there with nobody to keep them. I've barred the door against the wind and left the lamp ready. Ponder has seed for a month. I'll row out to the Ballast tonight and send the boat on with the tide, with my letter in it. Somebody will find it.`],
    ['e29', '2 September 1924', 'O. Marrow', `Last entry. To whoever reads this: it's in you, the word. It's in everyone. That's the trouble with exiling things.`]
  ];
  // clue granted when an entry is read
  var ENTRY_CLUES = { e06: 'firstword', e11: 'cave', e10: 'teeth', e03: 'teeth', e23: 'loophole', e24: 'nosignal', e26: 'bricks', e28: 'gone' };

  var PARROT = [
    `Ponder fluffs himself up to twice his size and says, in a voice exactly like an old woman's: "Pretty Ponder. Clever Ponder. Feed Ponder."`,
    `"Get off my foot, Pell!" Ponder shrieks. Then, sweetly, in the same old woman's voice: "Say {X:sorry}, Pell. Say {X:sorry}."`,
    `"Mind the Teeth!" says Ponder. "Fifth notch for the big ones! Fifth notch!"`,
    `Ponder closes his eyes and recites, in a small serious child's voice: "{X:home} is the land where our people are."`,
    `"Red, red, blue, violet," Ponder mutters, like a prayer. "Red, red, blue, violet. Every night. Every night."`,
    `"Odile's gone to sea!" Ponder announces. "Gone to sea in the boat! Keep them company!" He sounds pleased about it. Parrots have no sense of occasion.`
  ];
  var PARROT_PERHAPS = `"{X:perhaps}!" says Ponder, trying it out. "{X:perhaps}. {X:perhaps}." He seems delighted with it.`;

  /* ------------------------------------------------------------ helpers */
  function tideLine(s, lines) { return lines[s.tide] || ''; }

  /* ---------------------------------------------------------- locations */
  var L = {};

  L.jetty = {
    title: 'The Jetty', scene: 'jetty',
    desc: function (s) {
      return `A crooked jetty, silvered with salt, knocks against its own posts. Your rowboat bumps beside it.\n\nUp the slope the lighthouse stands dark — the only unlit lighthouse you have ever seen. Out past the reef a single ship's lantern blinks, patient as a clock.` +
        tideLine(s, { 1: `\n\nThe sea has drawn so far back that the jetty stands on stilts over wet sand.`, 4: `\n\nThe sea is high, slopping at the planks.`, 5: `\n\nThe sea is right up over the planks; you stand ankle-deep on the jetty.` });
    },
    acts: function () {
      return [
        { id: 'jetty_boat', label: 'Search the rowboat' },
        { id: 'jetty_sign', label: 'Read the old sign' },
        { id: 'jetty_ship', label: "Watch the ship's lantern" }
      ];
    },
    exits: function () { return [{ to: 'path', label: 'Up the path' }, { to: 'beach', label: 'Along the shingle' }]; }
  };

  L.path = {
    title: 'The Brow', scene: 'path',
    desc: function () {
      return `The path climbs onto the brow of the island and splits three ways in the heather. West, the roofs of a village. North, a scatter of stones on the clifftop. East, the lighthouse, with a low cottage crouched at its foot.\n\nA marker post leans at the fork.`;
    },
    acts: function () { return [{ id: 'path_post', label: 'Examine the marker post' }]; },
    exits: function () {
      return [
        { to: 'village', label: 'West, to the village' },
        { to: 'graves', label: 'North, to the clifftop stones' },
        { to: 'yard', label: 'East, to the lighthouse' },
        { to: 'jetty', label: 'Down to the jetty' }
      ];
    }
  };

  L.beach = {
    title: 'The Shingle', scene: 'beach',
    desc: function (s) {
      return `A steep beach of grey shingle and bladderwrack, smelling of old pennies. Halfway up the stones squats the reason the tides on Lesser Hush are punctual: the Tide Mangle. Beside it, a stone slip runs down into the water.\n\n` +
        tideLine(s, {
          1: `The sea has drawn right back. At the foot of the cliff a cave mouth gapes, dripping. Out on the wet sand lie the black ribs of a wreck.`,
          2: `The tide is low. Something dark — rock, or timber — shows far out, still awash. The cliff foot is a mess of foam.`,
          3: `The tide is at middling, as tides go.`,
          4: `The tide is high, and fidgeting.`,
          5: `The sea has climbed almost to the Mangle's wheels. The beach is a thin grey strip, and the cliff foot is deep underwater.`
        });
    },
    acts: function () {
      return [
        { id: 'mangle_look', label: 'Examine the Tide Mangle' },
        { id: 'mangle_crank', label: 'Turn the crank', panel: true },
        { id: 'slip', label: 'Look at the boat slip' }
      ];
    },
    exits: function (s) {
      var e = [{ to: 'jetty', label: 'Back to the jetty' }];
      if (s.tide === 1) {
        e.push({ to: 'cave', label: 'Into the cave' });
        e.push({ to: 'wreck', label: 'Out across the sand to the wreck' });
      }
      return e;
    }
  };

  L.cave = {
    title: 'The Sea Cave', scene: 'cave',
    desc: function () {
      return `Wet black rock and a smell of iron. The cave runs straight into the hill as though it knows where it's going, and your footsteps come back to you a beat late.\n\nAt the far end, iron rungs climb the wall to a wooden trapdoor.`;
    },
    acts: function () { return [{ id: 'cave_wall', label: 'Look at the walls' }]; },
    exits: function () { return [{ to: 'base', label: 'Climb the rungs' }, { to: 'beach', label: 'Back out to the beach' }]; }
  };

  L.wreck = {
    title: 'The Wreck', scene: 'wreck',
    desc: function () {
      return `The bones of a little coastal trader lie on their side in the sand, all ribs and weed. A barnacled nameboard: MARGERY. Her keel is broken clean across, as if something bit it.`;
    },
    acts: function () { return [{ id: 'wreck_log', label: "Search the captain's locker" }]; },
    exits: function () { return [{ to: 'beach', label: 'Back to the beach' }]; }
  };

  L.graves = {
    title: 'The Clifftop Stones', scene: 'graves',
    desc: function (s) {
      return `Headstones lean together on the clifftop like people trying to hear something. Below, the sea works at the rocks. The stones carry no words besides names and dates — only carvings, and little glass lenses set into the granite.\n\n` +
        (s.tide <= 2 ? `With the tide this low, a line of black rocks shows beyond the point like a lower jaw: the reef they call the Teeth.` : `Beyond the point, a line of white water marks where a reef lies hidden.`);
    },
    acts: function () {
      return [
        { id: 'g_silas', label: 'The tall stone' },
        { id: 'g_quill', label: 'The wide stone' },
        { id: 'g_jory', label: 'The leaning stone' },
        { id: 'g_gowe', label: 'The stone with a broken boat' },
        { id: 'g_odile', label: 'The clean new stone' }
      ];
    },
    exits: function () { return [{ to: 'path', label: 'Back to the path' }]; }
  };

  L.yard = {
    title: 'The Lighthouse Yard', scene: 'yard',
    desc: function (s) {
      return `The lighthouse goes up and up, white as a tooth, and dark at the top. At its foot, an iron-strapped door. Huddled beside it is the Keeper's cottage, with a cold chimney and a door that has no keyhole.` +
        (s.f.unbarred ? `\n\nThe lighthouse door stands open.` : '') +
        (s.f.cottageOpen ? `\n\nThe cottage door is unlatched.` : '');
    },
    acts: function (s) {
      var a = [];
      if (!s.f.unbarred) a.push({ id: 'lh_door', label: 'Try the lighthouse door' });
      if (!s.f.cottageOpen) a.push({ id: 'cot_door', label: 'The cottage door', panel: true });
      return a;
    },
    exits: function (s) {
      var e = [];
      if (s.f.cottageOpen) e.push({ to: 'cottage', label: 'Into the cottage' });
      if (s.f.unbarred) e.push({ to: 'base', label: 'Into the lighthouse' });
      e.push({ to: 'path', label: 'Back to the path' });
      return e;
    }
  };

  L.cottage = {
    title: "The Keeper's Cottage", scene: 'cottage',
    desc: function () {
      return `One room, low-beamed, smelling of paraffin and parrot. A stove gone cold. A desk drowned in paper. On a perch by the window, a grey parrot regards you with one eye, and then the other.\n\nAgainst the far wall squats a brass machine like a church organ that has married a card-file. A plate on it says: THE INDEX.`;
    },
    acts: function (s) {
      var a = [
        { id: 'index', label: 'Use the Index', panel: true },
        { id: 'parrot', label: 'Talk to the parrot' },
        { id: 'desk', label: 'Read the papers on the desk' },
        { id: 'sampler', label: 'Look at the framed sampler' },
        { id: 'doorframe', label: 'Look at the chalk on the doorframe' }
      ];
      if (!s.f.fed) a.push({ id: 'feed', label: 'Feed the parrot' });
      return a;
    },
    exits: function () { return [{ to: 'yard', label: 'Out to the yard' }]; }
  };

  L.village = {
    title: 'Hush', scene: 'village',
    desc: function (s) {
      return `A dozen cottages sit round a square with their shutters closed, like eyes. No smoke, no cats, no washing. The quiet here has a texture, like felt.\n\nAcross the square stands a building with columns far too grand for it: THE HALL OF THE THRIFT. A noticeboard leans by its steps.` +
        (s.f.hallOpen ? `\n\nThe Hall doors stand open.` : '');
    },
    acts: function (s) {
      var a = [
        { id: 'notice', label: 'Read the noticeboard' },
        { id: 'house6', label: 'The house with a note on the door' }
      ];
      if (!s.f.hallOpen) a.push({ id: 'hall_door', label: 'Try the Hall doors', panel: true });
      return a;
    },
    exits: function (s) {
      var e = [];
      if (s.f.hallOpen) e.push({ to: 'hall', label: 'Into the Hall' });
      e.push({ to: 'path', label: 'East, back to the path' });
      return e;
    }
  };

  L.hall = {
    title: 'The Hall of the Thrift', scene: 'hall',
    desc: function (s) {
      return `Ledgers to the ceiling, and dust lying in slabs. A long table where the Council sat: nine chairs, eight pushed neatly in, one shoved back as though someone left in a hurry. In a glass case, a framed document.` +
        (s.f.jarOpened ? `\n\nOn a shelf by itself stands an empty jar, its cork beside it.` : `\n\nOn a shelf by itself stands a single corked jar.`);
    },
    acts: function (s) {
      var a = [
        { id: 'registry', label: 'Read the great ledger' },
        { id: 'charter', label: 'Read the document in the case' },
        { id: 'chair', label: 'Look at the shoved-back chair' }
      ];
      if (!s.f.jarOpened) {
        a.push({ id: 'jar', label: 'Look at the jar' });
        if (s.seen['act:jar']) a.push({ id: 'uncork', label: 'Uncork the jar' });
      }
      return a;
    },
    exits: function () { return [{ to: 'village', label: 'Out to the square' }]; }
  };

  L.base = {
    title: 'Inside the Lighthouse', scene: 'base',
    desc: function (s) {
      return `A round stone room, cold as a well. Barrels of lamp oil, coils of rope, a workbench under a dead lantern. A stone stair corkscrews up into the dark, and a trapdoor is set in the floor.\n\n` +
        (s.f.unbarred ? `The great door stands open to the yard.` : `The great door is shut, with an oak bar across its brackets.`);
    },
    acts: function (s) {
      var a = [];
      if (!s.f.unbarred) a.push({ id: 'bar', label: 'Lift the bar from the door' });
      a.push({ id: 'bench', label: 'Look at the workbench' });
      a.push({ id: 'trap', label: 'Look down the trapdoor' });
      return a;
    },
    exits: function (s) {
      var e = [{ to: 'lamp', label: 'Up the stair' }];
      if (s.tide === 1) e.push({ to: 'cave', label: 'Down the trapdoor' });
      if (s.f.unbarred) e.push({ to: 'yard', label: 'Out to the yard' });
      return e;
    }
  };

  var AIMS = {
    sea: 'Seaward — the ship',
    village: 'Landward — the village',
    stones: 'North — the clifftop stones',
    jetty: 'Down — the jetty'
  };

  var AIM_PHRASE = {
    sea: 'out to sea, toward the ship',
    village: 'landward, over the village',
    stones: 'north, over the clifftop stones',
    jetty: 'down at the jetty'
  };

  L.lamp = {
    title: 'The Lamp Room', scene: 'lamp',
    desc: function (s) {
      return `The top of everything. The great lens sits in its brass cage like a frozen wave, taller than you. Eight windows look out on eight darks.\n\nBelow the lens, a brass panel: a row of lens-slots, a lever marked FLASH, and a wheel that turns the whole lamp to face one way or another. A battered book hangs from a hook.\n\n` +
        (s.f.lampLit ? `The lamp is lit, and faces ${AIM_PHRASE[s.aim]}.` : `The lamp is cold.`) +
        `\n\nOut to sea, the ship's lantern blinks: [[RA RA]].`;
    },
    acts: function (s) {
      var a = [];
      if (!s.f.lampLit) a.push({ id: 'light', label: 'Light the lamp' });
      a.push({ id: 'panel', label: 'Use the signal panel', panel: true });
      a.push({ id: 'book', label: 'Read the battered book' });
      a.push({ id: 'windows', label: 'Look out of the windows' });
      return a;
    },
    exits: function () { return [{ to: 'base', label: 'Down the stair' }]; }
  };

  /* ------------------------------------------------------------ actions */
  // each returns {text, panel?}. g = engine helpers.
  var A = {};

  A.jetty_boat = function (s, g) {
    g.clue('letter');
    return { text: `Under the thwart, in a jar, is the letter that came with the boat — the one the Admiralty handed you along with your appointment.\n\n*To whoever is sent —*\n\n*The Light on Lesser Hush has said the same thing every night for forty-one years, and it has been the wrong thing. I could not find the right one. The island is short a word. You will have to find it.*\n\n*There is no key to anything. Use your head; it is all the island ever lets anyone use.*\n\n*Please feed Ponder.*\n\n*— O. M., Keeper*` };
  };
  A.jetty_sign = function (s, g) {
    g.clue('sign');
    g.lumen('BA', 'Jetty sign: a boat coming in, a crowd waving');
    g.lumen('GV', 'Jetty sign: a boat coming in, a crowd waving');
    return { text: `A weather-bleached board, older than the jetty. Most of the paint is gone, but you can make out the picture: a boat nosing in to this very jetty, and a crowd on the boards waving their hats.\n\nSet into the wood beneath, little glass lenses:\n\n[[BA GV]]` };
  };
  A.jetty_ship = function (s, g) {
    g.clue('ship');
    g.lumen('RA', "The ship's lantern, blinking over and over");
    return { text: `Far out beyond the reef, a ship rides with her lantern lit. She isn't anchored: she drifts in a slow circle, keeping her distance, like a dog that has been told to stay.\n\nHer lantern blinks a short pattern, over and over:\n\n[[RA RA]]\n\nA pause. Then again.` };
  };
  A.path_post = function (s, g) {
    g.lumen('AV', 'Footpath marker, carved with walking footprints');
    return { text: `A squat post, carved on top with a pair of footprints, walking. Beneath them, two lenses:\n\n[[AV]]` };
  };
  A.mangle_look = function (s, g) {
    g.clue('mangle');
    return { text: `A contraption the size of a hay-wagon: two great oak rollers, a flywheel, a crank, and a brass dial with five notches marked I to V. The pointer stands at ${ROMAN[s.tide]}.\n\nA plate on the frame reads:\n\nLESSER HUSH TIDE MANGLE · EST. 1790\n*The Moon having been found unreliable.*` };
  };
  A.mangle_crank = function (s, g) {
    g.clue('mangle');
    return { text: `You take hold of the crank. The dial has five notches.`, panel: { type: 'tide' } };
  };
  A.slip = function (s, g) {
    g.lumen('BV', 'Boat slip: a boat pushing off from the shore');
    return { text: `A stone ramp runs down into the sea, worn smooth by keels. On a post at the top is a carving of a boat pushing off from the shore, and two lenses:\n\n[[BV]]` };
  };
  A.cave_wall = function () {
    return { text: `Chalked on the rock at head height, in a small neat hand: *FIRST NOTCH ONLY. DON'T DAWDLE.*\n\nAbove it, well over your head, a line of weed marks where the sea usually sits.` };
  };
  A.wreck_log = function (s, g) {
    g.clue('margery');
    g.lumen('RR', "Margery's log: the keeper flashed us off");
    return { text: `In the locker, wrapped in oilcloth, a logbook. Most of it is water now. The last legible page:\n\n*…the Keeper flashed us off — [[RR]], [[RR]] — but Master would have the harbour tonight and no argument. Mangle at the second notch. We'll go in over the Teeth on the top of it.*\n\n*Struck. Struck hard. A keel like ours wants the fifth notch at the least, the old men said, and they were right, and I am writing this up the mast.*\n\n*— Wm. Gowe, mate*` };
  };
  A.g_silas = function (s, g) {
    g.clue('stones');
    g.lumen('RA', "Silas Marrow's stone: a figure holding up a lantern");
    return { text: `SILAS MARROW · 1830–1882\n\nA figure holding a lantern up over its head. Beneath it, two lenses:\n\n[[RA]]` };
  };
  A.g_quill = function (s, g) {
    g.clue('stones');
    g.lumen('AA', 'The Quillers\' stone: four figures holding hands');
    return { text: `THE QUILLERS · EZRA · HANNAH · RUTH · LITTLE NED · 1801–1858\n\nFour figures in a row, holding hands. Beneath them:\n\n[[AA]]` };
  };
  A.g_jory = function (s, g) {
    g.clue('stones');
    g.lumen('BA', "Jory Pask's stone: a small figure in a boat");
    g.lumen('BB', "Jory Pask's stone: a great curling wave");
    return { text: `JORY PASK · DROWNED 1832\n\nA small figure in a boat, beneath a great curling wave. Two sets of lenses, side by side:\n\n[[BA BB]]` };
  };
  A.g_gowe = function (s, g) {
    g.clue('stones');
    g.lumen('BA', "William Gowe's stone (mate of the Margery)");
    g.lumen('GG', "William Gowe's stone: a boat broken on jagged points");
    return { text: `WILLIAM GOWE · MATE OF THE MARGERY · 1871\n\nA boat snapped in two across a row of jagged points. Two sets of lenses:\n\n[[BA GG]]` };
  };
  A.g_odile = function (s, g) {
    g.clue('notyet');
    g.lumen('RA', 'An unnamed stone, waiting: the lantern-figure again');
    return { text: `A stone already cut and polished, waiting. The same lantern-figure as on Silas Marrow's stone, and the same lenses:\n\n[[RA]]\n\nBut no name and no dates — only smooth space where they will go. Someone has scratched beneath it, small and neat: *Not yet.*` };
  };
  A.lh_door = function (s, g) {
    g.clue('barred');
    return { text: `It doesn't budge. It isn't locked — it's barred: when you shove, you hear a heavy bar shift in its brackets on the far side.\n\nSomeone barred this door from the inside. And then, presumably, left some other way.` };
  };
  A.cot_door = function (s, g) {
    g.clue('cotlock');
    return { text: `Where a keyhole should be, a little brass lantern is set into the wood, with three empty lens-sockets. Six loose lenses hang beside it on a chain: red, amber, green, blue, white, violet.\n\nEngraved around the lantern:\n\nSPEAK WHO YOU ARE, AND ENTER.`, panel: { type: 'compose', mode: 'cottage', slots: 3 } };
  };
  A.index = function (s, g) {
    return { text: `The Index wheezes awake. A brass plate explains: *Type a word. Every entry in the Keeper's log that holds it will be found, oldest first. Only the first five are shown.*`, panel: { type: 'index' } };
  };
  A.parrot = function (s, g) {
    g.clue('parrot');
    var lines = PARROT.slice();
    if (s.f.jarOpened) lines.push(PARROT_PERHAPS);
    var i = s.parrot % lines.length;
    s.parrot = s.parrot + 1;
    g.mark('parrot:' + i);
    return { text: lines[i], speech: true };
  };
  A.feed = function (s) {
    s.f.fed = true;
    return { text: `There's a tin of seed by the perch. Ponder eats with enormous dignity, cracking each seed as if it had said something foolish. Then he looks up and says, quite clearly, "About time."` };
  };
  A.desk = function (s, g) {
    g.clue('desk');
    return { text: `Bills, a dried starfish, half a biscuit, and — pinned on top, where you would be sure to see it — a list in a small neat hand:\n\nTHINGS THAT ARE TRUE\n\n1. The Ballast will not come in unless she is called properly.\n2. The Signal Book has twenty-four signals. None of them is the right one.\n3. The Index remembers everything I ever wrote in the log, except the words it is no longer allowed to.\n4. Ponder is not a citizen, and may say what he likes.\n5. Feed Ponder.` };
  };
  A.sampler = function (s, g) {
    g.clue('sampler');
    return { text: `A child's sampler in a wooden frame: a stitched cottage, a stitched lighthouse, a row of stitched people holding hands, and a stitched motto:\n\n{x:home} IS THE LAND WHERE OUR PEOPLE ARE\n\nThe first word hasn't been unpicked. The thread is simply *gone*, leaving four letters' worth of empty needle-holes. It is signed *O.M., aged 8*.` };
  };
  A.doorframe = function (s, g) {
    g.clue('chalk');
    return { text: `A column of chalk marks on the doorframe, rubbed out and rewritten many times:\n\nI — cave way open · wreck shows\nII — mind the sand\nIII — as God intended\nIV — jetty awash\nV — Teeth under. Big keels only.` };
  };
  A.notice = function (s, g) {
    g.clue('decrees');
    g.clue('halllock');
    return { text: `BY ORDER OF THE THRIFT OF SPEECH\n\nI. Every word must earn its keep.\nII. Words found idle shall be caught, jarred, and sent to sea aboard the BALLAST.\nIII. The BALLAST shall stand off Lesser Hush, and come in only when the Light calls her {x:home}.\nIV. The Light shall warn her off nightly.\nV. The Hall shall open to the First Word exiled, and to no other.\n\n*— Ald. Pell, for the Council*\n\nSomeone has written underneath in pencil, very small: *Thrift!*` };
  };
  A.house6 = function () {
    return { text: `Pinned to the door of Number 6, curling at the corners:\n\n*Gone to the mainland. Couldn't say {x:why}. — the Pasks*` };
  };
  A.hall_door = function (s, g) {
    g.clue('halllock');
    return { text: `Tall doors, brass-bound. Instead of a handle there is a brass lock with five lettered wheels, and an inscription:\n\nTHE FIRST WORD OPENS.`, panel: { type: 'letters', n: 5 } };
  };
  A.registry = function (s, g) {
    g.clue('registry');
    var rows = REGISTRY.map(function (r) {
      var back = (r[0] === 2 && s.f.jarOpened) ? ` *(returned)*` : '';
      return `No. ${r[0]} (${r[1]} letters) — ${r[2]}${back}`;
    }).join('\n\n');
    return { text: `THE REGISTRY OF EXILED WORDS\n*being the words of Lesser Hush found idle, and sent to sea.*\n\nAs the words themselves are gone from every page, each is entered here by its meaning.\n\n${rows}\n\n…and so on, for three hundred and twelve entries, in smaller and smaller handwriting.`, doc: true };
  };
  A.charter = function (s, g) {
    g.clue('charter');
    return { text: `CHARTER OF THE BALLAST\n\nWhereas the words of Lesser Hush have been found idle;\n\nAnd whereas they have been caught, jarred, and loaded aboard the collier BALLAST;\n\nIt is ordered that the BALLAST stand off Lesser Hush in perpetuity, and come in only when the Light calls her {x:home} (see Registry, No. 40).\n\nAs the Light has no such word, nor ever had, the matter is closed.\n\nTHRIFT!\n*— Ald. Pell*`, doc: true };
  };
  A.chair = function () {
    return { text: `A brass plate on the chair-back: ALD. PELL. On the seat, a scrap of paper in a cramped hand:\n\n*Should never have —*\n\nand nothing more. Whatever he should never have, he couldn't say.` };
  };
  A.jar = function () {
    return { text: `A jar the size of a jam jar, corked and sealed with wax. The paper label says *No. 2*. It must have fallen off the cart.\n\nSomething small inside flutters against the glass, like a moth with a question.` };
  };
  A.uncork = function (s, g) {
    s.f.jarOpened = true;
    if (s.returned.indexOf('perhaps') < 0) s.returned.push('perhaps');
    g.clue('jar');
    return { text: `You ease out the cork. For a moment nothing happens. Then something small and grey and uncertain climbs out over the rim, looks about, and — not quite flying, more *wondering* — drifts out of the doors and away over the roofs.\n\nAll over the island, in every book and on every page, gaps exactly the size of one seven-letter word quietly fill themselves in.` };
  };
  A.bar = function (s) {
    s.f.unbarred = true;
    return { text: `It takes your whole back, but the bar comes up out of its brackets and thuds onto the flags. The great door swings open on the yard, and salt air comes in.\n\nThere. You won't need the cave again.` };
  };
  A.bench = function (s, g) {
    g.clue('slate');
    g.lumen('G', "Odile's slate: 'the land'");
    g.lumen('RG', "Odile's slate: 'this station'");
    g.lumen('W', "Odile's slate: the ship's answer");
    g.lumen('GV', "Odile's slate: 'you may land'");
    return { text: `Under the dead lantern, a slate covered in chalk:\n\n*Nights I tried, and what she answered.*\n\n[[G]] (the land) — she answered [[W]]\n[[RG]] (this station) — [[W]]\n[[GV]] (you may land) — [[W GV]]\n[[RA]] (keeper speaks) — [[RA RA]]\n\n*She wants to. She can't. There is no signal for it in the Book.*\n\n*If nobody comes, I'll go to them, and at least they'll have their keeper.*` };
  };
  A.trap = function (s) {
    return { text: s.tide === 1 ? `Iron rungs go down into the cave. It's dry, for now.` : `Seawater slops and sucks below the trapdoor. The cave is flooded.` };
  };
  A.light = function (s, g) {
    s.f.lampLit = true;
    g.clue('lamp');
    return { text: `There's a tin of matches on the sill. The first is damp, and so is the second. The third flares, and the wick takes, and the great lens fills slowly with light, like a held breath let out.\n\nFor the first time in weeks, the Lesser Hush Light is burning.` };
  };
  A.panel = function (s, g) {
    g.clue('lamp');
    return { text: s.f.lampLit ? `The panel is warm under your hands.` : `The panel is cold. So is the lamp.`, panel: { type: 'lamp', slots: 8 } };
  };
  A.book = function (s, g) {
    g.clue('signalbook');
    SIGNALS.forEach(function (x) { g.lumen(x[0], 'Signal Book: ' + x[1]); });
    var rows = SIGNALS.map(function (x, i) { return `${i + 1}. [[${x[0]}]] — ${x[1]}`; }).join('\n');
    return { text: `THE SIGNAL BOOK OF THE LESSER HUSH LIGHT\n*The Twenty-Four Signals*\n\n${rows}\n\nIn the margin, in Odile's hand: *Twenty-four, and not one of them says it.*`, doc: true };
  };
  A.windows = function (s) {
    var tl = { 1: 'drawn right back', 2: 'low', 3: 'middling', 4: 'high', 5: 'as high as it goes' }[s.tide];
    return { text: `Seaward: the ship's lantern, circling beyond the reef.\nLandward: the dark roofs of the village.\nNorth: the stones on the clifftop.\nDown: the jetty, and your rowboat.\n\nThe sea is ${tl}. From up here you can see the Teeth ${s.tide <= 2 ? 'plainly, black above the water' : s.tide === 5 ? 'only as a faint ripple, deep under' : 'as a line of white water'}.` };
  };

  /* -------------------------------------------------------- submissions */
  var SUB = {};

  SUB.cottage = { at: 'yard', when: function (s) { return !s.f.cottageOpen; } };
  SUB.cottage.run = function (s, g, seq) {
    var c = g.compact(seq);
    if (c === 'RA') {
      s.f.cottageOpen = true;
      return { ok: true, close: true, text: `The lenses glow — red, then amber — and something inside the door unlatches with a grudging click. It knows you.` };
    }
    if (c === 'A') return { text: `The lantern glows amber — a person, yes, obviously — and waits, as if for more.` };
    if (!c) return { text: `The sockets are empty.` };
    return { text: `The lenses flicker [[${c}]] and go dark. The door stays shut.` };
  };

  SUB.letters = { at: 'village', when: function (s) { return !s.f.hallOpen; } };
  SUB.letters.run = function (s, g, word) {
    var w = String(word || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (w === EXILED[0].toUpperCase()) {
      s.f.hallOpen = true;
      return { ok: true, close: true, text: `The wheels click into place. Somewhere deep in the lock, a mechanism that has waited forty-one years to be told it was wrong gives a long, apologetic sigh, and the doors swing in.` };
    }
    return { text: `The wheels click, and nothing happens. The lock seems to expect better of you.` };
  };

  SUB.tide = { at: 'beach' };
  SUB.tide.run = function (s, g, n) {
    n = parseInt(n, 10);
    if (!(n >= 1 && n <= 5)) return { text: `The dial only has five notches.` };
    if (n === s.tide) return { text: `The pointer already stands at ${ROMAN[n]}.` };
    var dir = n < s.tide ? 'down' : 'up';
    s.tide = n;
    g.mark('tide:' + n);
    if (n === 1) g.clue('lowtide');
    var extra = { 1: ` A cave mouth opens at the cliff foot, and the ribs of a wreck rise out of the sand.`, 5: ` The beach shrinks to a grey strip at your feet.` }[n] || '';
    return { text: `You lean on the crank. The rollers groan, the flywheel catches, and the whole sea — the whole sea — slides ${dir} the beach like a tablecloth being drawn. The pointer settles on ${ROMAN[n]}.${extra}` };
  };

  SUB.aim = { at: 'lamp' };
  SUB.aim.run = function (s, g, aim) {
    if (!AIMS[aim]) return { text: `The wheel won't turn that way.` };
    s.aim = aim;
    return { text: s.f.lampLit ? `The great lens turns on its rollers. The beam swings round to face ${AIMS[aim].split(' — ')[1]}.` : `The great lens turns on its rollers to face ${AIMS[aim].split(' — ')[1]}. It would help if it were lit.` };
  };

  SUB.flash = { at: 'lamp' };
  SUB.flash.run = function (s, g, seq) {
    var c = g.compact(seq), show = g.tidy(seq);
    s.seq = show;
    if (!s.f.lampLit) return { text: `You pull the lever. Shutters clack round the lens in the dark — but the lamp isn't lit, and nothing can be seen.` };
    if (!c) return { text: `You pull the lever on an empty panel. The shutters clack; the light stays steady.` };
    s.flashes = (s.flashes || 0) + 1;
    var hasHome = c.indexOf('AAG') >= 0;
    var hasW = c.indexOf('W') >= 0;
    var hasWarn = c.indexOf('RR') >= 0 || c.indexOf('BV') >= 0;
    if (s.aim !== 'sea') {
      if (s.aim === 'village') {
        return { text: `The beam sweeps the shuttered square, spelling [[${show}]] across the closed windows. Nothing stirs.` +
          (hasHome && !hasW ? ` It feels, somehow, like the right word to shine on a village. But there is nobody left in Hush to read it.` : ` There is nobody left in Hush to read it.`) };
      }
      if (s.aim === 'stones') return { text: `The light runs over the clifftop stones, and their old lenses catch it and glint back at you — red, amber, blue — as if the dead were answering in the only words they had.` };
      return { text: `The jetty leaps out of the dark, empty, your rowboat nodding at the end of it.` };
    }
    g.mark('flash:' + c);
    if (hasHome && !hasW && !hasWarn) {
      if (s.tide === 5) {
        s.f.ended = true;
        s.loc = 'lamp';
        return { ok: true, ending: true, text: '' };
      }
      s.f.reefWarned = true;
      g.clue('reefWarned');
      g.lumen('GG', "The ship's answer, when it tried to come in");
      return { reply: 'GG', text: `Out at sea, the ship's lantern stops blinking. It burns steady — and begins, slowly, to grow. She's coming. She's coming round the point —\n\nAnd stops. The lantern hangs there a long while, rocking. Then it blinks, apologetically: [[GG]]. [[GG]].\n\nAnd it slides back out to its old distance.` };
    }
    if (hasHome) return { reply: 'R W', text: `The ship's lantern flickers [[R]]… then [[W]], as if it can't make head or tail of you. You seem to be saying two things at once.` };
    if (hasWarn) return { reply: 'R', text: `The ship answers with a single blink: [[R]]. Seen. She keeps her distance, as she has every night for forty-one years.` };
    if (c.indexOf('RA') >= 0) {
      s.f.contact = true;
      g.clue('contact');
      return { reply: 'RA RA RA RA', text: `For a moment, nothing. Then the ship's lantern goes wild — [[RA RA RA RA]] — over and over, so fast the colours smear. Somebody out there is very glad to see a keeper.` };
    }
    if (c.indexOf('GV') >= 0 && !hasW) {
      g.clue('refused');
      return { reply: 'W GV', text: `The ship's lantern answers slowly: [[W GV]]. A pause. Then again, fainter: [[W GV]]. As if she would like to, very much, and can't.` };
    }
    if (c.indexOf('GAA') >= 0) return { reply: 'AA W', text: `The ship answers [[AA]]… and then, after a long pause, [[W]]. Close to something. Not it.` };
    return { reply: 'R', text: `The ship answers with a single blink: [[R]]. Seen. Nothing more.` };
  };

  /* --------------------------------------------------------------- nudge */
  function nudge(s) {
    var f = s.f, seen = s.seen;
    if (!f.cottageOpen) {
      if (!seen['act:g_silas'] && !seen['act:g_odile'])
        return `The cottage wants you to say who you are — in lenses. Somewhere on this island, people are already written down in lenses. Try the clifftop.`;
      return `The old stones pair pictures of people with lenses. Which picture is you? You were sent here to do a particular job.`;
    }
    if (!f.unbarred && !seen['tide:1'])
      return `The lighthouse was barred from the inside by someone who then left. There must be another way in. The tides here are not left to chance — try winding them.`;
    if (!f.unbarred)
      return `At the first notch the beach shows you something new. Odile's log (try the Index with words like "cave") says where it goes.`;
    if (!f.lampLit) return `It's a lighthouse, and the lamp is cold.`;
    if (!seen['act:notice'] && !seen['act:charter'] && !seen['entry:e23'])
      return `The noticeboard in the village says exactly what would bring the ship in.`;
    if (!f.reefWarned) {
      if (!seen['act:charter'] && !f.hallOpen)
        return `The Hall holds the Charter, and a ledger of what each lost word meant. Its door wants the first word ever caught: Odile was there, and so, in a manner of speaking, was Ponder.`;
      return `The Light must say a word that Lumen has never had. Odile wondered if the lenses were less like names and more like bricks. What is the missing word made of — and what kind of thing is it?`;
    }
    return `She tried. She is very heavy — all those words. What does a heavy keel need to clear the Teeth? Ponder, the chalk and the wreck all have an opinion.`;
  }

  /* -------------------------------------------------------------- ending */
  var ENDING = [
    `Out at sea, the ship's lantern stops blinking. It simply burns — steady, gold — and begins to grow.`,
    `You watch from the lamp room as she comes round the point on the fifth-notch tide: an old black collier sitting so low in the water her deck is nearly awash. She slides over the drowned Teeth as if they had never been there at all.`,
    `By the time you are down the stair and out on the jetty, she is alongside. Someone small stands at her rail in an oilskin, a lantern in one hand, waving her hat with the other.`,
    `Then the hatches open.`,
    `It is like starlings. It is like moths. It is like every bell on a mainland Sunday. Three hundred and twelve words lift out of the hold in a long glittering ribbon and pour over Lesser Hush — into the Hall, down the cold chimneys, through the keyholes of shuttered houses, between the pages of every book.`,
    `On the noticeboard, the gaps fill in. In the cottage, the needle-holes in the sampler fill up with blue thread again. Ponder says something unrepeatable. And on the mainland, in a dozen kitchens, a dozen old islanders put down their cups at once, because they have just remembered how to say {x:why} they left.`,
    `Odile Marrow steps onto the jetty and takes your hand in both of hers. The first word back is always the first word that went, and it is hers to say.`,
    `"{x:sorry}," she says, "for all the trouble. And {x:welcome}. {x:welcome} {x:home}."`
  ];

  var GAME = {
    title: 'The Last Word',
    EXILED: EXILED, ROMAN: ROMAN, INTRO: INTRO, CLUES: CLUES, SIGNALS: SIGNALS,
    REGISTRY: REGISTRY, ENTRIES: ENTRIES, ENTRY_CLUES: ENTRY_CLUES, PARROT: PARROT,
    PARROT_PERHAPS: PARROT_PERHAPS, LOC: L, ACT: A, SUB: SUB, AIMS: AIMS,
    nudge: nudge, ENDING: ENDING, START: 'jetty'
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = GAME;
  else root.GAME = GAME;
})(this);
