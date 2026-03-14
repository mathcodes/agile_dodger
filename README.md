# Guitar Scale Visualizer

A comprehensive web-based guitar learning tool that displays scales, chords, and chord voicings on an interactive fretboard. Perfect for guitarists of all levels to practice scales, understand chord theory, and learn music.

## Features

### Core Features
- **Interactive Fretboard Display** - Visual representation of guitar scales with circular note markers
- **9 Guitar Tunings** - Standard, Drop D, Open D, Open G, Open E, Open A, DADGAD, Half Step Down, Full Step Down
- **15 Scale Types** - Major, Minor (Natural, Harmonic, Melodic), Dorian, Phrygian, Lydian, Mixolydian, Locrian, Pentatonic (Major & Minor), Blues, Harmonic Minor Pentatonic, and more
- **Chord Generation** - Automatically generates diatonic chords for any scale in any key
- **Multiple Chord Voicings** - Discovers up to 8 playable voicings per chord; click to cycle through alternatives
- **Color-Coded Chord Tones** - All roots appear in one color, all thirds in another, etc. across all chords for easy harmonic analysis
- **PDF Export** - Download current scale/tuning configuration as PDF

### Practice Tools
- **Chromatic Tuner** - Real-time pitch detection using your microphone for accurate string tuning
- **MIDI File Playback** - Upload MIDI files to hear playback with visual note highlighting on the fretboard
- **Interactive Controls** - Real-time rendering as you change key, scale, and tuning

## Getting Started

### Basic Usage

1. **Open the app** - Open `guitar_scale_visualizer.html` in your web browser
2. **Select a Tuning** - Choose from 9 standard guitar tunings
3. **Select a Key** - Choose your musical key (C, C#, D, etc.)
4. **Select a Scale** - Pick from 15 different scale types
5. **View Results** - The fretboard displays where to play notes; chords show below with color-coded tones

### Tuning Options
| Name | Notes |
|------|-------|
| Standard | E A D G B e |
| Drop D | D A D G B e |
| Open D | D A D F# A d |
| Open G | D G D G B d |
| Open E | E B E G# B e |
| Open A | E A E A C# e |
| DADGAD | D A D G A d |
| Half Step Down | Eb Ab Db Gb Bb eb |
| Full Step Down | D G C F A d |

### Scale Types
- **Major** - Bright, happy sound
- **Minor (Natural)** - Dark, sad sound
- **Minor (Harmonic)** - Minor with raised 7th
- **Minor (Melodic)** - Minor with raised 6th & 7th ascending
- **Dorian** - Minor with raised 6th
- **Phrygian** - Minor with lowered 2nd
- **Lydian** - Major with raised 4th
- **Mixolydian** - Major with lowered 7th
- **Locrian** - Diminished sound
- **Pentatonic (Major)** - 5-note major scale
- **Pentatonic (Minor)** - 5-note minor scale
- **Blues** - Pentatonic minor with blue note
- **Harmonic Minor Pentatonic** - Minor pentatonic with raised 7th
- **Chromatic** - All 12 semitones

## MIDI File Support

### MIDI File Requirements

For MIDI files to work properly with the visualizer, they should meet these specifications:

#### File Format
- **Format**: Standard MIDI file (.mid or .midi)
- **Type**: Type 0 or Type 1 MIDI files are supported

#### Timing & Tempo
- **Tempo**: 60–180 BPM recommended (highly complex tempos may not visualize smoothly)
- **Time Signature**: 4/4 is standard
- **Resolution**: 480 PPQ (Pulses Per Quarter) or 384 PPQ recommended

#### Note Content
- **Note Range**: Middle C (C4) to C7 works best
  - The app visualizes notes from MIDI note 36 (C2) to 96 (C7)
  - Guitar-friendly range: MIDI notes 40 (E2) to 84 (C6)
- **Note Velocity**: Any velocity works (0–127)
- **Note Timing**: Notes should be clearly separated for visual tracking
- **Polyphony**: Multiple simultaneous notes are supported

#### Track Configuration
- **Single Track**: One melodic track with note events
- **Multiple Tracks**: Only the first track with notes will be visualized
- **Program Changes**: Remove if possible (app ignores them)
- **Controller Events**: Controllers are ignored safely

#### Best Practices
- Keep the MIDI file under 2 minutes for best visualization performance
- Use a single melody line to keep the visualization clear
- Avoid extremely fast note sequences (sub-16th note runs)
- Use consistent note durations (quarter notes, eighth notes) for clarity
- Export from DAW with default settings (no special effects or filters)

### Creating Example MIDI Files

If you don't have a MIDI file, here's how to create one:

#### Option 1: Using a Piano Roll DAW (Easiest)
1. Open GarageBand, FL Studio, Logic Pro, Ableton, or similar
2. Create a MIDI track
3. Enter a simple melody (8–16 notes)
4. Use middle octaves (C4 to C5)
5. Export as .mid file

#### Option 2: Using Python (Simple Script)
Create a file named `create_example_midi.py`:

```python
from midiutil import MIDIFile

# Create a MIDI file with 4 beats per measure
midi = MIDIFile(1)
track = 0
channel = 0
tempo = 120

# Add tempo
midi.addTempo(track, 0, tempo)

# Add a simple C major scale melody
notes = [60, 62, 64, 65, 67, 69, 71, 72]  # C D E F G A B C
start_time = 0

for note in notes:
    duration = 1  # 1 beat (quarter note)
    midi.addNote(track, channel, note, start_time, duration, 100)
    start_time += duration

# Save the file
with open('example_scale.mid', 'wb') as output_file:
    midi.writeFile(output_file)

print("Created example_scale.mid")
```

Run: `pip install midiutil && python create_example_midi.py`

#### Option 3: Using MuseScore (Free, GUI-Based)
1. Download MuseScore (free, open-source)
2. Create a new score
3. Use the note input tool to enter a simple melody
4. Export as MIDI (.mid)

### Using MIDI Files in the App

1. Click **MIDI File** input in the controls
2. Select your .mid or .midi file
3. Click **Play** to start playback
4. Notes will highlight on the fretboard as they play
5. Use **Pause** to stop playback
6. Click again to adjust playback position

**Note**: The MIDI file plays back at its original tempo. If notes play too fast or slow, adjust the tempo when creating the MIDI file.

## Chord Information

### Diatonic Chords
The app generates all diatonic chords for the selected scale. These are the "in-key" chords that naturally harmonize with the scale.

### Chord Voicings
Each chord displays up to 8 different voicings (finger positions on the fretboard).
- **Click any chord diagram** to cycle through available voicings
- **Voicing counter** shows current voicing (e.g., `[3/7]` = 3rd of 7 voicings)
- Voicings are scored by playability (comfortable finger span, reasonable reach)

### Chord Tone Colors
Each chord tone position has a consistent color across all chords:
- **Red** = Root (1st)
- **Orange** = 3rd
- **Teal** = 5th
- **Fuchsia** = 7th
- **Yellow** = 9th
- **Green** = 11th
- **Purple** = 13th

This makes it easy to see harmonic function: all roots are red regardless of which chord.

## Using the Chromatic Tuner

1. Click **Start Tuner** button
2. Allow microphone access when prompted
3. Pluck an open string
4. The tuner shows:
   - Current note detected (large text)
   - Frequency in Hz
   - Visual meter showing sharpness/flatness (red = flat, green = in-tune)
5. Adjust your string until the meter shows green and "In tune" status
6. Click **Stop Tuner** when done

## Exporting to PDF

1. Adjust your scale/tuning/key settings until satisfied
2. Click **Download PDF**
3. PDF containing the current fretboard visualization will download

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Tuner and MIDI playback require:
- Microphone access (for tuner)
- File upload support (for MIDI)
- Web Audio API support (all modern browsers)

## Tips & Tricks

### Learning Scales
1. Select a scale and key
2. Play through the circles on one string
3. Switch strings to see the pattern across the fretboard
4. Practice muscle memory by changing keys

### Understanding Chord Theory
1. Generate chords for a major scale (e.g., C major)
2. Notice the pattern: I, ii, iii, IV, V, vi, vii°
3. Click each chord to see different voicings
4. Notice how the same chord tone (3rd, 5th, etc.) maintains the same color

### Using MIDI for Practice
1. Record a short melodic MIDI (8–16 bars)
2. Set your scale to the MIDI's key
3. Play it back while watching the fretboard
4. Try to play along on your guitar

### MIDI Playback Troubleshooting
**Issue**: MIDI file doesn't play
- Ensure the file is a valid .mid or .midi
- Try a different MIDI file to isolate the issue
- Check browser console (F12) for errors

**Issue**: Notes don't highlight
- Some less common MIDI files may have incompatible formatting
- Create a new MIDI file using standard note events only

**Issue**: Playback is too fast/slow
- This is the MIDI file's original tempo
- Create a new version with different BPM in your DAW

## Technical Details

### File Structure
- `guitar_scale_visualizer.html` - Complete app (HTML, CSS, JavaScript)
- All code is self-contained in a single file for easy distribution

### Technologies Used
- **HTML5 Canvas & SVG** - Fretboard and chord diagram rendering
- **Web Audio API** - Microphone access and pitch detection (tuner)
- **MIDI Parser** - midi-parser-js library for MIDI file support
- **jsPDF** - PDF generation and export
- **Vanilla JavaScript** - No frameworks required

### Performance
- Real-time rendering: < 100ms per scale change
- Supports up to 20 chords in a scale
- MIDI files up to ~5 minutes generally work smoothly

## Known Limitations

- MIDI playback is visual only (notes are highlighted, not heard—use your MIDI file's audio)
- Scordatura and non-standard tunings are limited to provided options
- Fretboard display shows first 12 frets (standard for most scales)
- Tuner requires microphone browser permissions

## License & Credits

Built with vanilla JavaScript and modern browser APIs. MIDI parsing provided by midi-parser-js, PDF generation by jsPDF.

---

**Enjoy learning guitar with visual, interactive tools!**
