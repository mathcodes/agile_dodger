#!/usr/bin/env python3
"""Generate simple test MIDI files with named notes.

Uses the Roland/GM octave convention: middle C = C3 = MIDI 60.

MIDI note table (octaves -2 to 8):
  Note  -2  -1   0   1   2   3*  4   5   6   7   8
  C      0  12  24  36  48  60  72  84  96 108 120
  C#     1  13  25  37  49  61  73  85  97 109 121
  D      2  14  26  38  50  62  74  86  98 110 122
  D#     3  15  27  39  51  63  75  87  99 111 123
  E      4  16  28  40  52  64  76  88 100 112 124
  F      5  17  29  41  53  65  77  89 101 113 125
  F#     6  18  30  42  54  66  78  90 102 114 126
  G      7  19  31  43  55  67  79  91 103 115 127
  G#     8  20  32  44  56  68  80  92 104 116  --
  A      9  21  33  45  57  69  81  93 105 117  --
  A#    10  22  34  46  58  70  82  94 106 118  --
  B     11  23  35  47  59  71  83  95 107 119  --
  (* octave 3 = middle-C octave)

Guitar open strings (standard tuning, Roland octaves):
  Low E = E1  = MIDI 40
  A     = A1  = MIDI 45
  D     = D2  = MIDI 50
  G     = G2  = MIDI 55
  B     = B2  = MIDI 59
  High E= E3  = MIDI 64
"""

from midiutil import MIDIFile

# ---------------------------------------------------------------------------
# Note helper  (Roland/GM: C3 = 60)
# ---------------------------------------------------------------------------
_NOTE_OFFSETS = {
    'C':  0, 'C#': 1, 'Db': 1,
    'D':  2, 'D#': 3, 'Eb': 3,
    'E':  4,
    'F':  5, 'F#': 6, 'Gb': 6,
    'G':  7, 'G#': 8, 'Ab': 8,
    'A':  9, 'A#':10, 'Bb':10,
    'B': 11,
}

def note(name: str, octave: int) -> int:
    """Return MIDI note number.  C3 = 60 (Roland/GM convention)."""
    midi_num = (octave + 2) * 12 + _NOTE_OFFSETS[name]
    assert 0 <= midi_num <= 127, f"{name}{octave} -> {midi_num} out of range"
    return midi_num


# ---------------------------------------------------------------------------
# Test pattern: C major scale around middle-C (C2 – C3, MIDI 36-60)
# ---------------------------------------------------------------------------
midi = MIDIFile(1)
track = 0
channel = 0
time = 0
volume = 100

midi.addTempo(track, 0, 120)

sequence = [
    ('C', 2), ('D', 2), ('E', 2), ('F', 2),
    ('G', 2), ('A', 2),
    ('G', 2), ('F', 2), ('E', 2), ('D', 2),
    ('C', 2),
]

pitches = [note(n, o) for n, o in sequence]

for pitch in pitches:
    midi.addNote(track, channel, pitch, time, 1, volume)
    time += 1

with open('test_scale.mid', 'wb') as f:
    midi.writeFile(f)

labels = [f"{n}{o}" for n, o in sequence]
print("Created test_scale.mid")
print("  Notes:       ", " - ".join(labels))
print("  MIDI numbers:", " - ".join(str(p) for p in pitches))
print()
print("Roland/GM reference  (middle C = C3 = 60):")
print("  Guitar low-E  E1 =", note('E',  1))
print("  Guitar A      A1 =", note('A',  1))
print("  Guitar D      D2 =", note('D',  2))
print("  Guitar G      G2 =", note('G',  2))
print("  Guitar B      B2 =", note('B',  2))
print("  Guitar hi-E   E3 =", note('E',  3))
print("  Middle C      C3 =", note('C',  3))
print("  A440          A3 =", note('A',  3))

