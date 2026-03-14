#!/usr/bin/env python3
"""
Simple MIDI Generator for Guitar Scale Visualizer
Creates example MIDI files compatible with the guitar scale visualizer app.
"""

import sys
import subprocess
import shutil

try:
    from midiutil import MIDIFile
except ImportError:
    print("Error: midiutil is not installed in this Python environment.")
    print()
    
    # Try to find and use conda Python
    conda_python = shutil.which("python") or shutil.which("python3")
    
    print("Attempting to install midiutil...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "midiutil"])
        from midiutil import MIDIFile
        print("✓ midiutil installed successfully!")
        print()
    except Exception as e:
        print(f"Auto-install failed: {e}")
        print()
        print("SOLUTION: Run this with Anaconda Python:")
        print()
        print("  conda activate")
        print("  python create_example_midi.py")
        print()
        print("OR install with conda:")
        print()
        print("  conda install -c conda-forge python-midi")
        print()
        print("Alternative: Install midiutil for current Python:")
        print(f"  {sys.executable} -m pip install --break-system-packages midiutil")
        print()
        exit(1)


# ---------------------------------------------------------------------------
# MIDI note-number table (Roland / GM convention: middle C = C3 = 60)
# Based on the standard MIDI note chart (octaves -2 through 8).
#
#  Formula: note(name, octave) = (octave + 2) * 12 + semitone_offset
#  Octave -2 starts at MIDI 0; octave 3 is middle-C octave (C3 = 60)
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
    """Return the MIDI note number for *name* in *octave*.

    Uses the Roland/GM octave convention where C3 = 60 (middle C).
    Valid octave range: -2 to 8 (MIDI 0-127).

    Examples
    --------
    >>> note('C',  3)   # 60 – middle C
    60
    >>> note('A',  3)   # 69 – A440
    69
    >>> note('E',  1)   # 40 – open low-E on standard-tuned guitar
    40
    >>> note('Eb', 1)   # 39 – open low-E♭ (Eb tuning)
    39
    """
    if name not in _NOTE_OFFSETS:
        raise ValueError(f"Unknown note name '{name}'. Use C, C#, Db, D, … B.")
    midi_num = (octave + 2) * 12 + _NOTE_OFFSETS[name]
    if not (0 <= midi_num <= 127):
        raise ValueError(f"{name}{octave} maps to MIDI {midi_num}, which is out of range 0-127.")
    return midi_num


# Guitar open-string MIDI numbers (standard tuning, Roland/GM octaves)
# Low E1=40, A1=45, D2=50, G2=55, B2=59, High E3=64
GUITAR_OPEN = {
    'E_low':  note('E', 1),   # 40
    'A':      note('A', 1),   # 45
    'D':      note('D', 2),   # 50
    'G':      note('G', 2),   # 55
    'B':      note('B', 2),   # 59
    'E_high': note('E', 3),   # 64
}

# Handy octave-labelled note reference (printed when run with --notes)
MIDI_TABLE = {f"{n}{o}": note(n, o)
              for o in range(-2, 9)
              for n in ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
              if 0 <= (o + 2) * 12 + _NOTE_OFFSETS[n] <= 127}


def create_major_scale_midi():
    """Create a C major scale ascending and descending"""
    # Use format 0 for better compatibility
    midi = MIDIFile(1, file_format=0)
    track = 0
    channel = 0
    time = 0
    tempo = 120  # BPM
    
    midi.addTempo(track, 0, tempo)
    
    # C major scale: C3 D3 E3 F3 G3 A3 B3 C4  (Roland: C3=60)
    notes = [note('C',3), note('D',3), note('E',3), note('F',3),
             note('G',3), note('A',3), note('B',3), note('C',4)]
    
    # Ascending
    for n in notes:
        midi.addNote(track, channel, n, time, 1, 100)  # 1 beat, velocity 100
        time += 1
    
    # Rest
    time += 1
    
    # Descending
    for n in reversed(notes):
        midi.addNote(track, channel, n, time, 1, 100)
        time += 1
    
    with open('example_scale.mid', 'wb') as f:
        midi.writeFile(f)
    
    print("✓ Created: example_scale.mid")
    print("  - C major scale ascending and descending")
    print("  - Tempo: 120 BPM")
    print("  - Duration: ~17 beats")


def create_melody_midi():
    """Create a simple melody (Twinkle Twinkle Little Star)"""
    midi = MIDIFile(1, file_format=0)
    track = 0
    channel = 0
    time = 0
    tempo = 100
    
    midi.addTempo(track, 0, tempo)
    
    # Twinkle Twinkle: C C G G A A G  (C3 octave, Roland convention)
    melody = [note('C',3), note('C',3), note('G',3), note('G',3),
              note('A',3), note('A',3), note('G',3)]
    
    for n in melody:
        midi.addNote(track, channel, n, time, 1, 100)
        time += 1
    
    # Rest
    time += 1
    
    # Second phrase: F F E E D D C
    melody2 = [note('F',3), note('F',3), note('E',3), note('E',3),
               note('D',3), note('D',3), note('C',3)]
    
    for n in melody2:
        midi.addNote(track, channel, n, time, 1, 100)
        time += 1
    
    with open('example_melody.mid', 'wb') as f:
        midi.writeFile(f)
    
    print("✓ Created: example_melody.mid")
    print("  - Twinkle Twinkle Little Star (simplified)")
    print("  - Tempo: 100 BPM")
    print("  - Duration: ~16 beats")


def create_chord_progression_midi():
    """Create a simple I-IV-V-I chord progression as melody"""
    midi = MIDIFile(1, file_format=0)
    track = 0
    channel = 0
    time = 0
    tempo = 120
    
    midi.addTempo(track, 0, tempo)
    
    # C major I-IV-V-I root notes: C3 F3 G3 C4
    progression = [
        note('C', 3), note('C', 3),
        note('F', 3), note('F', 3),
        note('G', 3), note('G', 3),
        note('C', 4), note('C', 4),
    ]
    
    for n in progression:
        midi.addNote(track, channel, n, time, 1, 100)
        time += 1
    
    with open('example_progression.mid', 'wb') as f:
        midi.writeFile(f)
    
    print("✓ Created: example_progression.mid")
    print("  - I-IV-V-I chord progression (C major)")
    print("  - Tempo: 120 BPM")
    print("  - Duration: ~8 beats")


def create_pentatonic_midi():
    """Create a minor pentatonic scale lick"""
    midi = MIDIFile(1, file_format=0)
    track = 0
    channel = 0
    time = 0
    tempo = 120
    
    midi.addTempo(track, 0, tempo)
    
    # A minor pentatonic: A2 C3 D3 E3 G3 A3 (Roland octaves)
    # Lick pattern
    lick = [
        note('A', 2), note('A', 2),
        note('C', 3), note('D', 3), note('C', 3),
        note('D', 3), note('E', 3), note('D', 3),
        note('E', 3), note('G', 3), note('E', 3),
        note('G', 3), note('A', 3), note('G', 3),
        note('E', 3), note('D', 3),
    ]
    
    for n in lick:
        midi.addNote(track, channel, n, time, 0.5, 100)  # Shorter notes
        time += 0.5
    
    with open('example_pentatonic.mid', 'wb') as f:
        midi.writeFile(f)
    
    print("✓ Created: example_pentatonic.mid")
    print("  - A minor pentatonic lick")
    print("  - Tempo: 120 BPM")
    print("  - Duration: ~8 beats")


def create_low_e_blues_midi():
    """E minor blues lick starting on the open low-E string (E1 = MIDI 40)"""
    midi = MIDIFile(1, file_format=0)
    track, channel, time, tempo = 0, 0, 0, 90
    midi.addTempo(track, 0, tempo)

    # E minor blues scale: E G A Bb B D  (low-register, guitar-friendly)
    # E1=40, G1=43, A1=45, Bb1=46, B1=47, D2=50, E2=52
    lick = [
        (note('E', 1), 1.0),
        (note('G', 1), 0.5), (note('A', 1), 0.5),
        (note('Bb',1), 0.5), (note('B', 1), 0.5),
        (note('D', 2), 1.0),
        (note('E', 2), 1.5),
        (note('D', 2), 0.5),
        (note('B', 1), 0.5), (note('Bb',1), 0.5),
        (note('A', 1), 1.0),
        (note('G', 1), 0.5), (note('E', 1), 1.0),
    ]

    for pitch, dur in lick:
        midi.addNote(track, channel, pitch, time, dur, 100)
        time += dur

    with open('example_blues_low.mid', 'wb') as f:
        midi.writeFile(f)

    print("✓ Created: example_blues_low.mid")
    print("  - E minor blues lick (low register, E1–E2, MIDI 40–52)")
    print("  - Tempo: 90 BPM")


def create_two_octave_scale_midi():
    """C major scale spanning two full octaves (C2–C4, MIDI 36–60)"""
    midi = MIDIFile(1, file_format=0)
    track, channel, time, tempo = 0, 0, 0, 100
    midi.addTempo(track, 0, tempo)

    # C2 to C4 ascending then descending
    ascending = [
        note('C', 2), note('D', 2), note('E', 2), note('F', 2),
        note('G', 2), note('A', 2), note('B', 2),
        note('C', 3), note('D', 3), note('E', 3), note('F', 3),
        note('G', 3), note('A', 3), note('B', 3),
        note('C', 4),
    ]

    for n in ascending:
        midi.addNote(track, channel, n, time, 0.75, 90)
        time += 0.75

    time += 0.5  # small rest at the top

    for n in reversed(ascending):
        midi.addNote(track, channel, n, time, 0.75, 90)
        time += 0.75

    with open('example_two_octave.mid', 'wb') as f:
        midi.writeFile(f)

    print("✓ Created: example_two_octave.mid")
    print("  - C major scale, two octaves (C2–C4, MIDI 36–60)")
    print("  - Tempo: 100 BPM")


def create_high_register_midi():
    """Melody in the upper fretboard register (E3–E4, MIDI 64–76)"""
    midi = MIDIFile(1, file_format=0)
    track, channel, time, tempo = 0, 0, 0, 110
    midi.addTempo(track, 0, tempo)

    # G major scale from the high-E string area: G3 A3 B3 C4 D4 E4
    phrase = [
        note('E', 3), note('F#',3), note('G', 3), note('A', 3),
        note('B', 3), note('C', 4), note('D', 4), note('E', 4),
        note('D', 4), note('C', 4), note('B', 3), note('A', 3),
        note('G', 3), note('F#',3), note('E', 3),
    ]

    for n in phrase:
        midi.addNote(track, channel, n, time, 0.5, 95)
        time += 0.5

    with open('example_high_register.mid', 'wb') as f:
        midi.writeFile(f)

    print("✓ Created: example_high_register.mid")
    print("  - G major run, high register (E3–E4, MIDI 64–76)")
    print("  - Tempo: 110 BPM")


def create_chromatic_midi():
    """Chromatic run across all 12 frets on a single string (low-E string)"""
    midi = MIDIFile(1, file_format=0)
    track, channel, time, tempo = 0, 0, 0, 80
    midi.addTempo(track, 0, tempo)

    # Low E string open = E1 (MIDI 40), frets 1-12 = F1 … E2 (41-52)
    chromatic_up   = list(range(note('E', 1), note('E', 2) + 1))  # 40–52
    chromatic_down = list(reversed(chromatic_up))

    for n in chromatic_up + chromatic_down:
        midi.addNote(track, channel, n, time, 0.5, 90)
        time += 0.5

    with open('example_chromatic.mid', 'wb') as f:
        midi.writeFile(f)

    print("✓ Created: example_chromatic.mid")
    print("  - Chromatic run: E1–E2 up and back (MIDI 40–52)")
    print("  - Tempo: 80 BPM  |  Tests all 13 frets on low-E string")


def print_note_table():
    """Print the full MIDI note table (Roland/GM convention, C3=60)."""
    names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
    header = f"{'Note':<6}" + "".join(f"{o:>5}" for o in range(-2, 9))
    print(header)
    print("-" * len(header))
    for name in names:
        row = f"{name:<6}"
        for octave in range(-2, 9):
            midi_num = (octave + 2) * 12 + _NOTE_OFFSETS[name]
            if 0 <= midi_num <= 127:
                marker = "*" if midi_num == 60 else " "
                row += f"{midi_num:>4}{marker}"
            else:
                row += f"{'–':>5}"
        print(row)
    print("  (* = middle C, C3 = MIDI 60)")


if __name__ == '__main__':
    import sys

    if '--notes' in sys.argv:
        print("MIDI Note Table  (Roland/GM: C3 = 60 = middle C)")
        print("=" * 60)
        print_note_table()
        print()
        print("Guitar open strings (standard tuning):")
        for name, midi_num in GUITAR_OPEN.items():
            print(f"  {name:<8} MIDI {midi_num}")
        exit(0)

    print("Guitar Scale Visualizer - MIDI Generator")
    print("=" * 50)
    print()
    
    try:
        create_major_scale_midi()
        create_melody_midi()
        create_chord_progression_midi()
        create_pentatonic_midi()
        create_low_e_blues_midi()
        create_two_octave_scale_midi()
        create_high_register_midi()
        create_chromatic_midi()
        
        print()
        print("=" * 50)
        print("All example MIDI files created successfully!")
        print()
        print("Next steps:")
        print("1. Open guitar_scale_visualizer.html in your browser")
        print("2. Click 'MIDI File' and select one of the created files")
        print("3. Click 'Play' to see the notes highlighted on the fretboard")
        print()
        print("Tip: run with --notes to print the full MIDI note table.")
        print()
        
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
