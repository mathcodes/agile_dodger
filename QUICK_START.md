# Quick Start Guide

## Installation & Setup

### 1. Open the App
Simply open `guitar_scale_visualizer.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

**No installation required!** Everything is self-contained in the HTML file.


## Creating Example MIDI Files

We've included a helper script to generate example MIDI files:

### Quick Start (if you have Anaconda/conda)
```bash
conda activate
python create_example_midi.py
```

### If you don't have conda installed
```bash
pip3 install midiutil
python3 create_example_midi.py
```

This creates 4 example MIDI files:
- `example_scale.mid` - C major scale ascending/descending
- `example_melody.mid` - "Twinkle Twinkle Little Star"
- `example_progression.mid` - I-IV-V-I chord progression
- `example_pentatonic.mid` - A minor pentatonic lick

### Using the Generated MIDI Files
1. Click **MIDI File** input in the app
2. Select one of the generated `example_*.mid` files
3. Click **Play** to hear and visualize playback
4. The fretboard will highlight notes as they play

## Minimal MIDI File Requirements

If the generated MIDI files don't work or you have a custom file:

**Required:**
- Standard MIDI file format (.mid or .midi)
- Note events with pitch (0-127)
- Tempo (any 60-180 BPM is fine)

**Optimal for Guitar:**
- Notes in range C2-C7 (MIDI 36-96)
- Single melody line (not chords)
- 8-16 notes maximum for clarity
- Consistent note lengths (no extreme variations)

## Troubleshooting MIDI

**File won't play?**
- Ensure it's a valid .mid/.midi file
- Try one of the generated examples first
- Check browser console (F12) for errors

**Notes highlight incorrectly?**
- Some MIDI files with special formatting won't parse correctly
- Generate a new MIDI using the provided Python script or a DAW

**Playback too slow/fast?**
- This is the MIDI file's original tempo
- Use a DAW to adjust BPM and export again

## Tips for Best Results

### With the Fretboard
1. Select a **key** that matches your MIDI file's key
2. Select a **scale** that contains the MIDI notes
3. Change **tuning** if needed
4. Play MIDI - notes will highlight on the fretboard

### With Chords
1. After selecting scale/key, scroll down to see diatonic chords
2. **Click any chord** to cycle through voicings
3. Chord tone colors are consistent (see legend at bottom)
4. Colors represent position: Root=Red, 3rd=Orange, 5th=Teal, etc.

### With the Tuner
1. Click **Start Tuner**
2. Allow microphone access
3. Pluck each open string
4. Adjust until green and "In tune"
5. Click **Stop Tuner** when done

---

**Questions?** Refer to the full README.md for detailed documentation.
