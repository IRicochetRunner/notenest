// src/components/Packs.jsx
import { useState, useEffect, useRef } from "react";

// ── ALBUM ART CACHE + HOOK ───────────────────────────────────
const artCache = {};

function useAlbumArt(title, artist) {
  const [url, setUrl] = useState(artCache[`${title}__${artist}`] || null);
  useEffect(() => {
    const key = `${title}__${artist}`;
    if (artCache[key]) { setUrl(artCache[key]); return; }
    const q = encodeURIComponent(`${title} ${artist}`);
    fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`)
      .then(r => r.json())
      .then(d => {
        const art = d.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") || null;
        artCache[key] = art;
        setUrl(art);
      })
      .catch(() => {});
  }, [title, artist]);
  return url;
}

// Fetch art for multiple songs, staggered
function usePackAlbumArts(songs) {
  const [arts, setArts] = useState({});
  const fetched = useRef(new Set());
  useEffect(() => {
    songs.forEach((song, i) => {
      const key = `${song.title}__${song.artist}`;
      if (fetched.current.has(key)) return;
      fetched.current.add(key);
      setTimeout(() => {
        if (artCache[key]) { setArts(a => ({ ...a, [key]: artCache[key] })); return; }
        const q = encodeURIComponent(`${song.title} ${song.artist}`);
        fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`)
          .then(r => r.json())
          .then(d => {
            const art = d.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") || null;
            artCache[key] = art;
            setArts(a => ({ ...a, [key]: art }));
          })
          .catch(() => {});
      }, i * 120);
    });
  }, [songs]);
  return arts;
}


// ── SONG BREAKDOWNS ──────────────────────────────────────────
const SONG_BREAKDOWNS = {
  "Give It Away": {
    fact: "Flea wrote this bass line as a warm-up exercise before a rehearsal — the band heard it and built the whole song around it.",
    focus: "The line lives entirely on the E string. Nail the thumb slap and muted dead notes before adding speed.",
    chips: ["Thumb slap", "Dead notes", "E string groove"],
  },
  "Under the Bridge": {
    fact: "John Frusciante wrote the lyrics as a poem about loneliness. Flea's bass enters slowly and builds — matching the emotional arc perfectly.",
    focus: "Play with your fingers, not a pick. The verse line is all about space — don't fill every beat.",
    chips: ["Fingerstyle", "Space & dynamics", "Walking bass"],
  },
  "Around the World": {
    fact: "The entire song is one repeating riff — Flea plays it 67 times. Endurance and consistency are the lesson here.",
    focus: "Slap the root, pop the octave. Get the pattern locked at half speed before bringing it up to tempo.",
    chips: ["Octave patterns", "Slap & pop", "Stamina"],
  },
  "Can't Stop": {
    fact: "Flea improvised the main riff in the studio. The syncopated rhythm is deceptively tricky — it constantly lands slightly off the beat.",
    focus: "Count the rests. The groove lives in what you don't play as much as what you do.",
    chips: ["Syncopation", "Groove", "Funk rhythm"],
  },
  "Higher Ground": {
    fact: "Originally a Stevie Wonder song. Flea's slap version is faster and more aggressive — a masterclass in reinterpreting a classic.",
    focus: "The thumb needs to bounce off the string immediately — no resting. Practice the thumb motion slowly and separately first.",
    chips: ["Slap Bass", "Thumb bounce", "Speed building"],
  },
  "Aeroplane": {
    fact: "Flea plays this while singing backing vocals live — one of the hardest coordination feats in rock bass.",
    focus: "The verse groove is a funk pattern with ghost notes between every slap. Ghost notes are the secret ingredient.",
    chips: ["Ghost notes", "Slap Bass", "Coordination"],
  },
  "Come Together": {
    fact: "McCartney's bass line was the last thing recorded. Lennon told him to 'just do something interesting' — and he did.",
    focus: "The signature slide at the start sets the tone. Use your middle finger and let the note ring into the slide.",
    chips: ["Slides", "Melodic bass", "Finger independence"],
  },
  "Something": {
    fact: "Frank Sinatra called it the greatest love song of the last 50 years. McCartney's bass follows the vocal melody almost note for note.",
    focus: "This is about tone and touch. Play softly, stay close to the neck, and let the notes breathe.",
    chips: ["Melodic bass", "Tone control", "Dynamics"],
  },
  "Hey Jude": {
    fact: "The bass doesn't enter until 1:05 — McCartney holds back deliberately to make the entry hit harder.",
    focus: "Simple, rootsy playing. The lesson here is restraint: serve the song, don't overplay.",
    chips: ["Restraint", "Root notes", "Song support"],
  },
  "Paperback Writer": {
    fact: "One of the first pop songs where the bass was mixed loud enough to actually hear — a landmark in bass history.",
    focus: "The riff alternates between a low drone and a climbing line. Keep your fretting hand relaxed or you'll fatigue fast.",
    chips: ["Riff playing", "Drone notes", "Hand relaxation"],
  },
  "The Spirit of Radio": {
    fact: "Geddy plays this while singing and operating keyboard pedals with his feet simultaneously.",
    focus: "The intro is pure fingerstyle speed. Use strict alternating fingers and practice with a metronome at 60% first.",
    chips: ["Alternating fingers", "Speed", "Precision"],
  },
  "Tom Sawyer": {
    fact: "The synth intro was played by Geddy with his feet on a Taurus bass pedal while playing bass with his hands.",
    focus: "The main riff is in 4/4 but feels odd because of where the accents land. Tap your foot and feel where beat 1 is.",
    chips: ["Odd accents", "Lead bass", "Tone"],
  },
  "YYZ": {
    fact: "The intro is Morse code for YYZ — the airport code for Toronto Pearson. Rush's hometown airport.",
    focus: "The main riff is in 5/4. Count it as 3+2 — it clicks once you hear the groupings.",
    chips: ["5/4 time", "Odd time", "Precision"],
  },
  "Whole Lotta Love": {
    fact: "JPJ recorded the bass in one afternoon. The iconic riff was written in about 10 minutes during a soundcheck.",
    focus: "Low and heavy. Use your bridge pickup for maximum growl and keep the notes short and punchy.",
    chips: ["Heavy groove", "Punchy articulation", "Tone"],
  },
  "Enter Sandman": {
    fact: "Jason Newsted's bass was notoriously buried in the mix on this album. What you hear is mostly the guitar — lean into the guitar riff.",
    focus: "Follow the guitar riff exactly. The power comes from the two instruments locking together perfectly.",
    chips: ["Riff unison", "Heavy picking", "Timing"],
  },
  "Nothing Else Matters": {
    fact: "James Hetfield wrote this on the phone with his girlfriend, cradling the guitar with one hand so she wouldn't hear.",
    focus: "This is a fingerpicking guitar piece at heart. Go slow, let every note ring, and focus on clean fretting.",
    chips: ["Fingerpicking", "Clean fretting", "Dynamics"],
  },
  "Master of Puppets": {
    fact: "The mid-section breakdown was inspired by a church hymn. The tempo drops dramatically — don't rush back into the main riff.",
    focus: "The main riff requires strict down-picking at high speed. Build up gradually — this one injures wrists if rushed.",
    chips: ["Down-picking", "Stamina", "Speed building"],
  },
  "Seven Nation Army": {
    fact: "It's actually a guitar through an octave pedal — not a bass at all. Still one of the most recognizable bass-sounding riffs ever.",
    focus: "Five frets on the low E string. Nail the timing and the slight pause before the last two notes.",
    chips: ["Riff", "Timing", "Simplicity"],
  },
  "Another One Bites the Dust": {
    fact: "John Deacon was inspired by the bass line from 'Good Times' by Chic. Michael Jackson reportedly begged Queen to release it as a single.",
    focus: "The groove is everything. Keep it locked in, slightly behind the beat, and resist the urge to add anything extra.",
    chips: ["Groove", "Pocket playing", "Restraint"],
  },
  "Billie Jean": {
    fact: "The bass line loops 145 times throughout the song. Louis Johnson played it but MJ wrote every note.",
    focus: "It never changes — but your feel has to stay perfect the whole way through. Practice playing it 10 times in a row without losing the groove.",
    chips: ["Consistency", "Groove", "Stamina"],
  },
  "Hysteria": {
    fact: "Chris Wolstenholme wrote this bass line while the rest of Muse were watching TV. It took him three weeks to be able to play it up to speed.",
    focus: "Pure fingerstyle speed. The right hand is everything here — alternate index and middle finger strictly and build speed slowly.",
    chips: ["Fingerstyle speed", "Endurance", "Right hand technique"],
  },
  "Purple Haze": {
    fact: "The opening chord is a dissonant tritone — the 'devil's interval' that was historically banned by the church. Jimi opened with it anyway.",
    focus: "The riff is all in the fretting hand. Let the notes ring into each other slightly — that blurry quality is intentional.",
    chips: ["Tritone riff", "String bending", "Sustain"],
  },
  "Little Wing": {
    fact: "Hendrix wrote this in about 15 minutes backstage at the Monterey Pop Festival. It's considered one of the most harmonically sophisticated guitar pieces in rock.",
    focus: "The chord-melody technique means you're playing chords and melody simultaneously. Focus on the thumb handling the bass notes.",
    chips: ["Chord melody", "Thumb technique", "Harmony"],
  },
  "Stairway to Heaven": {
    fact: "Page wrote the intro in one night at Headley Grange. The song has four distinct sections — treat each one as its own piece.",
    focus: "The intro fingerpicking uses a descending bass line under constant treble strings. Pin your ring finger on the high B and D strings and let the bass line move underneath.",
    chips: ["Fingerpicking", "Descending bass", "Open strings"],
  },
  "Kashmir": {
    fact: "The guitar is tuned to DADGAD — an open tuning Page discovered through folk music. The riff has a Middle Eastern feel that no standard tuning can replicate.",
    focus: "The main riff repeats in 3/4 while the drums play in 4/4 — it creates a hypnotic polyrhythm. Feel both pulses simultaneously.",
    chips: ["DADGAD tuning", "Polyrhythm", "Open tuning"],
  },
  "In the Air Tonight": {
    fact: "The famous drum fill at 3:40 wasn't planned — Collins improvised it in the studio and it became one of the most iconic moments in pop history.",
    focus: "The whole song builds to that fill. When it arrives, hit the snare with everything you have — dynamics are the entire lesson here.",
    chips: ["Drum fill", "Dynamics", "Timing"],
  },
  "When the Levee Breaks": {
    fact: "Bonham set up his kit at the bottom of a stairwell at Headley Grange to get that massive reverb. There were microphones at the top of the stairs.",
    focus: "The shuffle feel is the hardest part. It should swing slightly — not straight 8ths, not full swing. Feel it in your body.",
    chips: ["Shuffle groove", "Swing feel", "Power"],
  },
  "Smells Like Teen Spirit": {
    fact: "Dave Grohl learned the drum part in one afternoon. The simple verse-to-chorus dynamic shift is the whole lesson.",
    focus: "The quiet verse and explosive chorus dynamic is everything. The transition needs to be sudden and committed.",
    chips: ["Rock beat", "Dynamics", "Hi-hat control"],
  },
  "Wonderwall": {
    fact: "Noel Gallagher wrote this about his then-girlfriend. The capo on the 2nd fret gives it that jangly, bright sound that's impossible to replicate without one.",
    focus: "Use a capo on fret 2. The strumming pattern is the hardest part — it's slightly syncopated. Tap your foot and lock in the rhythm before adding the chords.",
    chips: ["Capo technique", "Strumming pattern", "Open chords"],
  },
};

// ── PACK DATA ────────────────────────────────────────────────
const ALL_PACKS = [
  {
    id: "flea",
    pro: true,
    instrument: "Bass",
    type: "musician",
    title: "Learn Like Flea",
    subtitle: "Red Hot Chili Peppers",
    description: "Master Flea's signature slap-funk style through his most iconic bass lines — from stadium anthems to groove-heavy deep cuts.",
    color: "#e84c3d",
    gradient: "from-[#e84c3d] to-[#ff8c42]",
    difficulty: "Intermediate",
    songs: [
      { title: "Give It Away", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Beginner", duration: "4:43" },
      { title: "Under the Bridge", artist: "Red Hot Chili Peppers", skill: "Fingerstyle", difficulty: "Beginner", duration: "4:24" },
      { title: "Around the World", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Intermediate", duration: "3:58" },
      { title: "Can't Stop", artist: "Red Hot Chili Peppers", skill: "Groove", difficulty: "Intermediate", duration: "4:29" },
      { title: "Higher Ground", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Advanced", duration: "3:48" },
      { title: "Aeroplane", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Advanced", duration: "4:45" },
    ],
  },
  {
    id: "mcartney",
    pro: true,
    instrument: "Bass",
    type: "musician",
    title: "Learn Like McCartney",
    subtitle: "The Beatles",
    description: "Paul McCartney's melodic bass playing changed music forever. These lines are deceptively musical — perfect for developing taste.",
    color: "#1a3a8f",
    gradient: "from-[#1a3a8f] to-[#4a72e8]",
    difficulty: "Beginner",
    songs: [
      { title: "Come Together", artist: "The Beatles", skill: "Fingerstyle", difficulty: "Beginner", duration: "4:19" },
      { title: "Something", artist: "The Beatles", skill: "Melodic Bass", difficulty: "Beginner", duration: "3:02" },
      { title: "Hey Jude", artist: "The Beatles", skill: "Groove", difficulty: "Beginner", duration: "7:11" },
      { title: "Paperback Writer", artist: "The Beatles", skill: "Melodic Bass", difficulty: "Intermediate", duration: "2:17" },
      { title: "Blackbird", artist: "The Beatles", skill: "Fingerpicking", difficulty: "Intermediate", duration: "2:18" },
    ],
  },
  {
    id: "geddy",
    pro: true,
    instrument: "Bass",
    type: "musician",
    title: "Learn Like Geddy Lee",
    subtitle: "Rush",
    description: "One of rock's most technically demanding bassists. These lines will push your chops and coordination to the limit.",
    color: "#7c3aed",
    gradient: "from-[#7c3aed] to-[#a855f7]",
    difficulty: "Advanced",
    songs: [
      { title: "The Spirit of Radio", artist: "Rush", skill: "Fingerstyle", difficulty: "Intermediate", duration: "4:57" },
      { title: "Tom Sawyer", artist: "Rush", skill: "Lead Bass", difficulty: "Advanced", duration: "4:33" },
      { title: "YYZ", artist: "Rush", skill: "Lead Bass", difficulty: "Advanced", duration: "4:25" },
      { title: "Limelight", artist: "Rush", skill: "Fingerstyle", difficulty: "Advanced", duration: "4:19" },
    ],
  },
  {
    id: "jpj",
    pro: true,
    instrument: "Bass",
    type: "musician",
    title: "Learn Like John Paul Jones",
    subtitle: "Led Zeppelin",
    description: "The foundation of one of rock's greatest bands. JPJ's bass lines are groovy, powerful, and surprisingly approachable.",
    color: "#b45309",
    gradient: "from-[#b45309] to-[#f59e0b]",
    difficulty: "Intermediate",
    songs: [
      { title: "Whole Lotta Love", artist: "Led Zeppelin", skill: "Groove", difficulty: "Beginner", duration: "5:34" },
      { title: "Ramble On", artist: "Led Zeppelin", skill: "Fingerstyle", difficulty: "Intermediate", duration: "4:23" },
      { title: "The Lemon Song", artist: "Led Zeppelin", skill: "Blues Bass", difficulty: "Intermediate", duration: "6:19" },
      { title: "Dazed and Confused", artist: "Led Zeppelin", skill: "Lead Bass", difficulty: "Advanced", duration: "6:28" },
    ],
  },
  {
    id: "metallica",
    pro: true,
    instrument: "Guitar",
    type: "band",
    title: "Metallica Essentials",
    subtitle: "Thrash Metal Foundations",
    description: "From chugging riffs to complex arrangements — Metallica's catalog is a masterclass in heavy bass playing.",
    color: "#374151",
    gradient: "from-[#374151] to-[#6b7280]",
    difficulty: "Intermediate",
    songs: [
      { title: "Enter Sandman", artist: "Metallica", skill: "Power Chords", difficulty: "Beginner", duration: "5:31" },
      { title: "Nothing Else Matters", artist: "Metallica", skill: "Fingerpicking", difficulty: "Beginner", duration: "6:28" },
      { title: "Master of Puppets", artist: "Metallica", skill: "Heavy Riff", difficulty: "Intermediate", duration: "8:35" },
      { title: "One", artist: "Metallica", skill: "Lead Bass", difficulty: "Advanced", duration: "7:25" },
      { title: "Fade to Black", artist: "Metallica", skill: "Fingerstyle", difficulty: "Intermediate", duration: "6:57" },
    ],
  },
  {
    id: "rhcp",
    pro: true,
    instrument: "Guitar",
    type: "band",
    title: "RHCP Deep Cuts",
    subtitle: "Beyond the Hits",
    description: "Go deeper into the Red Hot Chili Peppers' catalog — the B-sides and album tracks that will really level up your playing.",
    color: "#dc2626",
    gradient: "from-[#dc2626] to-[#ef4444]",
    difficulty: "Intermediate",
    songs: [
      { title: "Scar Tissue", artist: "Red Hot Chili Peppers", skill: "Fingerstyle", difficulty: "Beginner", duration: "3:37" },
      { title: "Soul to Squeeze", artist: "Red Hot Chili Peppers", skill: "Groove", difficulty: "Beginner", duration: "4:49" },
      { title: "Californication", artist: "Red Hot Chili Peppers", skill: "Melodic Bass", difficulty: "Intermediate", duration: "5:21" },
      { title: "Parallel Universe", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Advanced", duration: "4:30" },
    ],
  },
  {
    id: "beginner-bass",
    instrument: "Bass",
    type: "difficulty",
    title: "Beginner Bass Lines",
    subtitle: "Start Your Journey",
    description: "The best songs to learn first — great tone, simple patterns, and instantly recognizable. Build your foundation here.",
    color: "#16a34a",
    gradient: "from-[#16a34a] to-[#22c55e]",
    difficulty: "Beginner",
    songs: [
      { title: "Seven Nation Army", artist: "The White Stripes", skill: "Riff", difficulty: "Beginner", duration: "3:51" },
      { title: "Another One Bites the Dust", artist: "Queen", skill: "Groove", difficulty: "Beginner", duration: "3:35" },
      { title: "Come As You Are", artist: "Nirvana", skill: "Bassline", difficulty: "Beginner", duration: "3:38" },
      { title: "Money", artist: "Pink Floyd", skill: "Groove", difficulty: "Beginner", duration: "6:30" },
      { title: "Smoke on the Water", artist: "Deep Purple", skill: "Riff", difficulty: "Beginner", duration: "5:40" },
      { title: "Billie Jean", artist: "Michael Jackson", skill: "Groove", difficulty: "Beginner", duration: "4:54" },
    ],
  },
  {
    id: "intermediate-bass",
    instrument: "Bass",
    type: "difficulty",
    title: "Next Level Bass",
    subtitle: "Level Up Your Playing",
    description: "You've got the basics — now it's time to develop real groove, dynamics, and style with these step-up songs.",
    color: "#4a72e8",
    gradient: "from-[#1a3a8f] to-[#4a72e8]",
    difficulty: "Intermediate",
    songs: [
      { title: "Hysteria", artist: "Muse", skill: "Fingerstyle", difficulty: "Intermediate", duration: "3:46" },
      { title: "Longview", artist: "Green Day", skill: "Fingerstyle", difficulty: "Intermediate", duration: "3:59" },
      { title: "Feel Good Inc.", artist: "Gorillaz", skill: "Groove", difficulty: "Intermediate", duration: "3:41" },
      { title: "Schism", artist: "Tool", skill: "Lead Bass", difficulty: "Intermediate", duration: "6:47" },
    ],
  },
  {
    id: "advanced-bass",
    instrument: "Bass",
    type: "difficulty",
    title: "Bass Master Class",
    subtitle: "Push Your Limits",
    description: "For serious players ready to tackle the most demanding bass lines in rock. These will take real dedication.",
    color: "#dc2626",
    gradient: "from-[#dc2626] to-[#f97316]",
    difficulty: "Advanced",
    songs: [
      { title: "Portrait of Tracy", artist: "Jaco Pastorius", skill: "Harmonics", difficulty: "Advanced", duration: "4:02" },
      { title: "Teen Town", artist: "Weather Report", skill: "Lead Bass", difficulty: "Advanced", duration: "2:46" },
      { title: "Psycho Killer", artist: "Talking Heads", skill: "Groove", difficulty: "Advanced", duration: "4:20" },
    ],
  },
  {
    id: "slap-bass",
    instrument: "Bass",
    type: "technique",
    title: "Slap Bass Masterclass",
    subtitle: "Thumb + Pop Technique",
    description: "The most fun technique in bass. Start with simple slaps and work up to full thumb-pop patterns.",
    color: "#d97706",
    gradient: "from-[#d97706] to-[#fbbf24]",
    difficulty: "Intermediate",
    songs: [
      { title: "Higher Ground", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Intermediate", duration: "3:48" },
      { title: "Give It Away", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Intermediate", duration: "4:43" },
      { title: "Around the World", artist: "Red Hot Chili Peppers", skill: "Slap Bass", difficulty: "Intermediate", duration: "3:58" },
      { title: "Classical Thump", artist: "Victor Wooten", skill: "Slap Bass", difficulty: "Advanced", duration: "4:09" },
    ],
  },
  {
    id: "fingerstyle",
    instrument: "Guitar",
    type: "technique",
    title: "Fingerstyle Foundations",
    subtitle: "Two-Finger Technique",
    description: "The bread and butter of bass playing. Develop speed, tone, and consistency with these essential fingerstyle lines.",
    color: "#0891b2",
    gradient: "from-[#0891b2] to-[#06b6d4]",
    difficulty: "Beginner",
    songs: [
      { title: "Longview", artist: "Green Day", skill: "Fingerstyle", difficulty: "Beginner", duration: "3:59" },
      { title: "Come Together", artist: "The Beatles", skill: "Fingerstyle", difficulty: "Beginner", duration: "4:19" },
      { title: "Hysteria", artist: "Muse", skill: "Fingerstyle", difficulty: "Intermediate", duration: "3:46" },
      { title: "The Chain", artist: "Fleetwood Mac", skill: "Fingerstyle", difficulty: "Intermediate", duration: "4:29" },
      { title: "YYZ", artist: "Rush", skill: "Fingerstyle", difficulty: "Advanced", duration: "4:25" },
    ],
  },
  {
    id: "pick-playing",
    instrument: "Guitar",
    type: "technique",
    title: "Pick Playing Essentials",
    subtitle: "Precision & Attack",
    description: "Pick bass has a unique bite and definition. Essential for punk, metal, and any time you need serious attack.",
    color: "#7c3aed",
    gradient: "from-[#7c3aed] to-[#8b5cf6]",
    difficulty: "Beginner",
    songs: [
      { title: "My Generation", artist: "The Who", skill: "Pick Playing", difficulty: "Beginner", duration: "3:16" },
      { title: "Blitzkrieg Bop", artist: "Ramones", skill: "Pick Playing", difficulty: "Beginner", duration: "2:13" },
      { title: "Holiday", artist: "Green Day", skill: "Pick Playing", difficulty: "Beginner", duration: "3:52" },
    ],
  },
  {
    id: "jimi",
    pro: true,
    instrument: "Guitar",
    type: "musician",
    title: "Learn Like Jimi Hendrix",
    subtitle: "Guitar Legend",
    description: "Hendrix redefined what was possible on guitar. These tracks cover his signature chord voicings, whammy bar tricks, and soulful phrasing.",
    color: "#9333ea",
    gradient: "from-[#9333ea] to-[#c084fc]",
    difficulty: "Intermediate",
    songs: [
      { title: "Purple Haze", artist: "Jimi Hendrix", skill: "Riff", difficulty: "Beginner", duration: "2:51" },
      { title: "Little Wing", artist: "Jimi Hendrix", skill: "Chord Melody", difficulty: "Intermediate", duration: "2:22" },
      { title: "Voodoo Child (Slight Return)", artist: "Jimi Hendrix", skill: "Lead Guitar", difficulty: "Advanced", duration: "5:12" },
      { title: "Hey Joe", artist: "Jimi Hendrix", skill: "Blues Lead", difficulty: "Intermediate", duration: "3:29" },
      { title: "Crosstown Traffic", artist: "Jimi Hendrix", skill: "Riff", difficulty: "Intermediate", duration: "2:25" },
    ],
  },
  {
    id: "page",
    pro: true,
    instrument: "Guitar",
    type: "musician",
    title: "Learn Like Jimmy Page",
    subtitle: "Led Zeppelin",
    description: "From acoustic fingerpicking to thunderous riffs — Page's guitar work spans every style and remains endlessly rewarding to study.",
    color: "#92400e",
    gradient: "from-[#92400e] to-[#d97706]",
    difficulty: "Intermediate",
    songs: [
      { title: "Stairway to Heaven", artist: "Led Zeppelin", skill: "Fingerpicking", difficulty: "Intermediate", duration: "8:02" },
      { title: "Whole Lotta Love", artist: "Led Zeppelin", skill: "Riff", difficulty: "Beginner", duration: "5:34" },
      { title: "Kashmir", artist: "Led Zeppelin", skill: "Riff", difficulty: "Intermediate", duration: "8:28" },
      { title: "Heartbreaker", artist: "Led Zeppelin", skill: "Lead Guitar", difficulty: "Advanced", duration: "4:14" },
      { title: "The Rain Song", artist: "Led Zeppelin", skill: "Open Tuning", difficulty: "Advanced", duration: "7:39" },
    ],
  },
  {
    id: "guitar-beginner",
    instrument: "Guitar",
    type: "technique",
    title: "First Guitar Songs",
    subtitle: "Start Here",
    description: "The iconic beginner guitar songs every player should know. Simple enough to learn fast, satisfying enough to keep you hooked.",
    color: "#0d9488",
    gradient: "from-[#0d9488] to-[#14b8a6]",
    difficulty: "Beginner",
    songs: [
      { title: "Knockin' on Heaven's Door", artist: "Bob Dylan", skill: "Open Chords", difficulty: "Beginner", duration: "2:31" },
      { title: "Wonderwall", artist: "Oasis", skill: "Open Chords", difficulty: "Beginner", duration: "4:18" },
      { title: "Horse With No Name", artist: "America", skill: "Open Chords", difficulty: "Beginner", duration: "4:10" },
      { title: "Brown Eyed Girl", artist: "Van Morrison", skill: "Strumming", difficulty: "Beginner", duration: "3:04" },
      { title: "House of the Rising Sun", artist: "The Animals", skill: "Fingerpicking", difficulty: "Beginner", duration: "4:31" },
    ],
  },
  {
    id: "bonham",
    pro: true,
    instrument: "Drums",
    type: "musician",
    title: "Learn Like John Bonham",
    subtitle: "Led Zeppelin",
    description: "The greatest rock drummer who ever lived. Bonham's feel, power, and groove are studied by every serious drummer. Learn the songs that defined rock drumming.",
    color: "#be123c",
    gradient: "from-[#be123c] to-[#f43f5e]",
    difficulty: "Intermediate",
    songs: [
      { title: "Moby Dick", artist: "Led Zeppelin", skill: "Groove", difficulty: "Intermediate", duration: "4:21" },
      { title: "When the Levee Breaks", artist: "Led Zeppelin", skill: "Groove", difficulty: "Intermediate", duration: "7:07" },
      { title: "Good Times Bad Times", artist: "Led Zeppelin", skill: "Kick Drum", difficulty: "Advanced", duration: "2:46" },
      { title: "Fool in the Rain", artist: "Led Zeppelin", skill: "Shuffle", difficulty: "Advanced", duration: "6:12" },
      { title: "Rock and Roll", artist: "Led Zeppelin", skill: "Groove", difficulty: "Intermediate", duration: "3:40" },
    ],
  },
  {
    id: "drums-beginner",
    instrument: "Drums",
    type: "difficulty",
    title: "Beginner Drum Songs",
    subtitle: "Start Your Groove",
    description: "The best songs to learn drums on — solid backbeats, steady tempos, and iconic grooves that teach you the fundamentals.",
    color: "#ea580c",
    gradient: "from-[#ea580c] to-[#fb923c]",
    difficulty: "Beginner",
    songs: [
      { title: "We Will Rock You", artist: "Queen", skill: "Backbeat", difficulty: "Beginner", duration: "2:01" },
      { title: "Smells Like Teen Spirit", artist: "Nirvana", skill: "Rock Beat", difficulty: "Beginner", duration: "5:01" },
      { title: "Eye of the Tiger", artist: "Survivor", skill: "Groove", difficulty: "Beginner", duration: "4:04" },
      { title: "Back in Black", artist: "AC/DC", skill: "Rock Beat", difficulty: "Beginner", duration: "4:15" },
      { title: "Come As You Are", artist: "Nirvana", skill: "Groove", difficulty: "Beginner", duration: "3:38" },
    ],
  },
  {
    id: "drums-technique",
    instrument: "Drums",
    type: "technique",
    title: "Drum Fills Masterclass",
    subtitle: "Chops & Transitions",
    description: "Level up your drumming with the most iconic fills in rock history. These songs are studies in how to move between sections with power and style.",
    color: "#475569",
    gradient: "from-[#475569] to-[#64748b]",
    difficulty: "Intermediate",
    songs: [
      { title: "Tom Sawyer", artist: "Rush", skill: "Drum Fills", difficulty: "Advanced", duration: "4:33" },
      { title: "In the Air Tonight", artist: "Phil Collins", skill: "Drum Fill", difficulty: "Beginner", duration: "5:33" },
      { title: "Hot for Teacher", artist: "Van Halen", skill: "Drum Intro", difficulty: "Advanced", duration: "4:44" },
      { title: "YYZ", artist: "Rush", skill: "Polyrhythm", difficulty: "Advanced", duration: "4:25" },
      { title: "Rosanna", artist: "Toto", skill: "Half-Time Shuffle", difficulty: "Advanced", duration: "5:09" },
    ],
  },
];

const TYPE_LABELS = {
  musician:   { label: "Musician" },
  band:       { label: "Band" },
  difficulty: { label: "Difficulty" },
  technique:  { label: "Technique" },
};

const DIFF_COLOR = {
  Beginner:     "bg-green-100 text-green-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced:     "bg-red-100 text-red-600",
};

// ── ALBUM COLLAGE (2x2 grid of covers) ───────────────────────
function AlbumCollage({ songs, color }) {
  const arts = usePackAlbumArts(songs.slice(0, 4));
  const slots = songs.slice(0, 4);

  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      {slots.map((song, i) => {
        const key = `${song.title}__${song.artist}`;
        const art = arts[key];
        return (
          <div key={i} className="overflow-hidden relative">
            {art ? (
              <img src={art} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-xl font-black"
                style={{ background: color, fontFamily:"Nunito,sans-serif" }}>
                {song.title[0]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SONG ROW WITH ART ────────────────────────────────────────
function SongRowWithArt({ song, index, done, adding, onAdd, packColor }) {
  const art = useAlbumArt(song.title, song.artist);
  const [expanded, setExpanded] = useState(false);
  const breakdown = SONG_BREAKDOWNS[song.title];

  return (
    <div className={`rounded-2xl border transition-all overflow-hidden ${done ? "bg-green-50 border-green-200" : "bg-[#f8f9ff] border-[#e8eeff]"}`}>
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Album art */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#e8eeff]">
          {art
            ? <img src={art} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-[#6b7a9e] font-black text-lg" style={{ fontFamily:"Nunito,sans-serif" }}>{song.title[0]}</div>
          }
        </div>

        {/* Step badge */}
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs ${done ? "bg-green-500 text-white" : "bg-[#e8eeff] text-[#6b7a9e]"}`}
          style={{ fontFamily:"Nunito,sans-serif" }}>
          {done ? "✓" : index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#0d1b3e] text-sm truncate" style={{ fontFamily:"Nunito,sans-serif" }}>{song.title}</div>
          <div className="text-xs text-[#6b7a9e]">{song.artist}</div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold bg-[#e8eeff] text-[#1a3a8f] px-2 py-1 rounded-full">{song.skill}</span>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${DIFF_COLOR[song.difficulty]}`}>{song.difficulty}</span>
          <span className="text-[10px] text-[#b0baca] font-medium hidden sm:block">{song.duration}</span>
        </div>

        {/* Expand button */}
        {breakdown && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center bg-[#e8eeff] text-[#1a3a8f] border-none cursor-pointer hover:bg-[#1a3a8f] hover:text-white transition-all text-xs font-bold">
            {expanded ? "−" : "?"}
          </button>
        )}

        {/* Add button */}
        <button
          onClick={onAdd}
          className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            done ? "bg-green-100 text-green-700 border-green-200" :
            adding ? "bg-green-500 text-white border-green-500" :
            "bg-[#e8eeff] text-[#1a3a8f] border-[#dde4f5] hover:bg-[#1a3a8f] hover:text-white hover:border-[#1a3a8f]"
          }`}
        >
          {done ? "In library" : adding ? "Added!" : "+ Add"}
        </button>
      </div>

      {/* Breakdown panel */}
      {expanded && breakdown && (
        <div className="px-5 pb-5 pt-1 border-t border-[#e8eeff]">
          {/* Micro-skill chips */}
          <div className="flex gap-2 flex-wrap mb-4">
            {breakdown.chips.map(c => (
              <span key={c} className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: packColor }}>
                {c}
              </span>
            ))}
          </div>
          {/* Fun fact */}
          <div className="mb-3">
            <div className="text-[10px] font-black text-[#6b7a9e] uppercase tracking-wider mb-1">Fun fact</div>
            <p className="text-sm text-[#0d1b3e] leading-relaxed">{breakdown.fact}</p>
          </div>
          {/* What to focus on */}
          <div className="bg-white rounded-xl p-3 border border-[#dde4f5]">
            <div className="text-[10px] font-black text-[#1a3a8f] uppercase tracking-wider mb-1">What to focus on</div>
            <p className="text-sm text-[#0d1b3e] leading-relaxed">{breakdown.focus}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PACK CARD ─────────────────────────────────────────────────
function PackCard({ pack, onOpen, isStarted, progress, isPro }) {
  const locked = pack.pro && !isPro;
  return (
    <div
      onClick={() => onOpen(pack)}
      className={"bg-white rounded-2xl border border-[#dde4f5] overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col relative " + (locked ? "opacity-80" : "")}
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* PRO lock badge */}
      {locked && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-[#f0a500] text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg>
          PRO
        </div>
      )}
      {/* Square album collage header — takes up 60% */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: "60%" }}>
        <AlbumCollage songs={pack.songs} color={pack.color} />
        {locked && <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />}
        {/* Dark gradient overlay with title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex gap-1.5 mb-1.5">
            <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {TYPE_LABELS[pack.type].label}
            </span>
            <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {pack.difficulty}
            </span>
          </div>
          <h3 className="font-black text-white text-base leading-tight" style={{ fontFamily:"Nunito,sans-serif" }}>{pack.title}</h3>
          <p className="text-white/60 text-xs">{pack.subtitle}</p>
        </div>
      </div>

      {/* Bottom info — takes remaining 40% */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <p className="text-xs text-[#6b7a9e] leading-relaxed line-clamp-2">{pack.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-bold text-[#6b7a9e]">{pack.songs.length} songs</span>
          {locked ? (
            <span className="text-xs font-bold text-[#f0a500] bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              Upgrade →
            </span>
          ) : isStarted ? (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: pack.color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: pack.color }}>{progress}%</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-[#1a3a8f] bg-[#e8eeff] px-3 py-1 rounded-xl group-hover:bg-[#1a3a8f] group-hover:text-white transition-all">
              View →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PACK MODAL ────────────────────────────────────────────────
function PackModal({ pack, onClose, onStart, isStarted, completedSongs, onAddSong, isPro }) {
  const [adding, setAdding] = useState(null);
  const arts = usePackAlbumArts(pack.songs.slice(0, 4));
  const locked = pack.pro && !isPro;

  const progress = isStarted ? Math.round((completedSongs.size / pack.songs.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* Header — album collage + overlay */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 220 }}>
          {/* 4-up collage */}
          <div className="grid grid-cols-4 h-full">
            {pack.songs.slice(0, 4).map((song, i) => {
              const key = `${song.title}__${song.artist}`;
              const art = arts[key];
              return (
                <div key={i} className="overflow-hidden relative">
                  {art
                    ? <img src={art} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ background: pack.color }} />
                  }
                </div>
              );
            })}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-none cursor-pointer hover:bg-black/60 text-sm z-10">
            ✕
          </button>
          {/* Text */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="flex gap-2 mb-2">
              <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">{TYPE_LABELS[pack.type].label}</span>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">{pack.difficulty}</span>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">{pack.songs.length} songs</span>
            </div>
            <h2 className="font-black text-2xl text-white leading-tight" style={{ fontFamily:"Nunito,sans-serif" }}>{pack.title}</h2>
            <p className="text-white/60 text-sm">{pack.subtitle}</p>
          </div>
        </div>

        {/* Progress */}
        {isStarted && (
          <div className="px-6 py-3 bg-[#f0f4ff] border-b border-[#dde4f5] flex-shrink-0">
            <div className="flex justify-between text-sm font-bold mb-1.5">
              <span className="text-[#0d1b3e]">Progress</span>
              <span style={{ color: pack.color }}>{completedSongs.size}/{pack.songs.length} · {progress}%</span>
            </div>
            <div className="h-2 bg-[#dde4f5] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: pack.color }} />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <p className="text-sm text-[#6b7a9e] leading-relaxed">{pack.description}</p>
        </div>

        {/* Songs / Upgrade wall */}
        {locked ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-amber-500"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg>
            </div>
            <div className="font-black text-xl text-[#0d1b3e] mb-2" style={{fontFamily:"Nunito,sans-serif"}}>Pro Pack</div>
            <p className="text-sm text-[#6b7a9e] mb-6 max-w-xs leading-relaxed">
              <strong className="text-[#0d1b3e]">{pack.title}</strong> is only available on the Pro plan. Upgrade to unlock all {9} artist & band packs.
            </p>
            <div className="bg-[#f0f4ff] rounded-2xl p-4 w-full max-w-xs mb-6 text-left">
              {["Unlimited songs","All 18 packs unlocked","Unlimited attachments","Unlimited setlists","Monthly progress reports"].map(f => (
                <div key={f} className="flex items-center gap-2 py-1.5">
                  <div className="w-4 h-4 bg-[#1a3a8f] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-xs font-bold text-[#0d1b3e]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose}
              className="w-full max-w-xs bg-[#1a3a8f] text-white font-black py-3.5 rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer"
              style={{fontFamily:"Nunito,sans-serif"}}>
              Upgrade to Pro — $7/mo →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-3">Songs in this pack</div>
            <div className="flex flex-col gap-2">
              {pack.songs.map((song, i) => (
                <SongRowWithArt
                  key={song.title}
                  song={song}
                  index={i}
                  done={completedSongs.has(song.title)}
                  adding={adding === song.title}
                  packColor={pack.color}
                  onAdd={() => {
                    onAddSong(song, pack.instrument);
                    setAdding(song.title);
                    setTimeout(() => setAdding(null), 1500);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {!locked && (
        <div className="px-6 py-4 border-t border-[#dde4f5] flex items-center justify-between flex-shrink-0 bg-[#fafbff]">
          <span className="text-sm text-[#6b7a9e]">
            {isStarted ? `${pack.songs.length - completedSongs.size} remaining` : `${pack.songs.length} songs to learn`}
          </span>
          {!isStarted ? (
            <button onClick={() => { onStart(pack); onClose(); }}
              className="bg-[#1a3a8f] text-white font-black px-6 py-3 rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer"
              style={{ fontFamily:"Nunito,sans-serif" }}>
              Start this pack
            </button>
          ) : progress === 100 ? (
            <div className="bg-green-500 text-white font-black px-6 py-3 rounded-2xl" style={{ fontFamily:"Nunito,sans-serif" }}>
              Pack complete!
            </div>
          ) : (
            <button onClick={onClose}
              className="bg-[#1a3a8f] text-white font-black px-6 py-3 rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer"
              style={{ fontFamily:"Nunito,sans-serif" }}>
              Continue learning
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Packs({ songs, onAddSong, isPro = false }) {
  const [filter, setFilter] = useState("all");
  const [openPack, setOpenPack] = useState(null);
  const [startedPacks, setStartedPacks] = useState(new Set());

  const libraryTitles = new Set(songs.map(s => s.title));

  function getCompletedSongs(pack) {
    return new Set(pack.songs.map(s => s.title).filter(t => libraryTitles.has(t)));
  }

  function getProgress(pack) {
    return Math.round((getCompletedSongs(pack).size / pack.songs.length) * 100);
  }

  function handlePackOpen(pack) {
    setOpenPack(pack);
  }

  function handleAddSong(song, packInstrument) {
    onAddSong({
      id: Date.now(),
      title: song.title,
      artist: song.artist,
      skills: [song.skill],
      rating: 0,
      progress: 0,
      date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      notes: "",
      parts: [],
      structure: [],
      instrument: packInstrument || null,
    });
  }

  const filters = [
    { id: "all",        label: "All" },
    { id: "musician",   label: "By Musician" },
    { id: "band",       label: "By Band" },
    { id: "difficulty", label: "By Difficulty" },
    { id: "technique",  label: "By Technique" },
  ];

  const myPacks = ALL_PACKS.filter(p => startedPacks.has(p.id) || getCompletedSongs(p).size > 0);
  const browsePacks = ALL_PACKS.filter(p => filter === "all" || p.type === filter);
  const proCount = ALL_PACKS.filter(p => p.pro).length;

  return (
    <div>
      {!isPro && (
        <div className="mb-6 bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8] rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white"><path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/></svg>
            </div>
            <div>
              <div className="text-white font-black text-sm" style={{fontFamily:"Nunito,sans-serif"}}>{proCount} packs are Pro-only</div>
              <div className="text-white/70 text-xs">Upgrade to unlock all artist & band packs</div>
            </div>
          </div>
          <button className="flex-shrink-0 bg-white text-[#1a3a8f] font-black text-xs px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-[#e8eeff] transition-all" style={{fontFamily:"Nunito,sans-serif"}}>
            Upgrade to Pro $7/mo →
          </button>
        </div>
      )}

      {myPacks.length > 0 && (
        <div className="mb-10">
          <h3 className="font-black text-base text-[#0d1b3e] mb-4" style={{ fontFamily:"Nunito,sans-serif" }}>My Packs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myPacks.map(pack => (
              <PackCard key={pack.id} pack={pack} onOpen={handlePackOpen} isStarted progress={getProgress(pack)} isPro={isPro} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-base text-[#0d1b3e]" style={{ fontFamily:"Nunito,sans-serif" }}>Browse Packs</h3>
          <p className="text-xs text-[#6b7a9e]">{browsePacks.length} packs · <span className="text-amber-500 font-bold">{browsePacks.filter(p=>p.pro).length} Pro</span></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filter === f.id ? "bg-[#1a3a8f] text-white border-[#1a3a8f]" : "bg-white text-[#6b7a9e] border-[#dde4f5] hover:border-[#4a72e8]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {browsePacks.map(pack => (
          <PackCard key={pack.id} pack={pack} onOpen={handlePackOpen}
            isStarted={startedPacks.has(pack.id) || getCompletedSongs(pack).size > 0}
            progress={getProgress(pack)} isPro={isPro} />
        ))}
      </div>

      {openPack && (
        <PackModal
          pack={openPack}
          onClose={() => setOpenPack(null)}
          onStart={p => setStartedPacks(prev => new Set([...prev, p.id]))}
          isStarted={startedPacks.has(openPack.id) || getCompletedSongs(openPack).size > 0}
          completedSongs={getCompletedSongs(openPack)}
          onAddSong={openPack.pro && !isPro ? null : handleAddSong}
          isPro={isPro}
        />
      )}
    </div>
  );
}