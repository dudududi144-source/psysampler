# PSY LOOPER - CO-PILOT Documentation

## Overview

CO-PILOT is an AI assistant that suggests actions based on context.

It uses a contextual bandit algorithm from psy-foundation to learn from user interactions.

## How It Works

### Contextual Bandit

CO-PILOT uses an epsilon-greedy contextual bandit:

- Context: Current device state (bank, loop type, energy, etc.)
- Actions: Possible suggestions (generate loop, auto-slice, etc.)
- Reward: User feedback (implicit or explicit)
- Exploration: Epsilon-greedy with epsilon=0.1

### Actions

CO-PILOT can suggest 8 actions:

1. suggest-melodic-loop - Generate a melodic loop
2. suggest-rhythmic-loop - Generate a rhythmic loop
3. suggest-bass-loop - Generate a bass loop
4. suggest-fx-loop - Generate an FX loop
5. auto-slice - Automatically slice the audio
6. auto-classify - Classify the loop type
7. suggest-variation - Create a variation
8. suggest-transition - Suggest a transition

## Context Features

CO-PILOT extracts these features from device state:

- currentBank: Active bank index
- hasLoop: Whether a loop is loaded
- loopType: Type of loaded loop
- bpm: Current tempo
- energy: Energy level (0-1)
- timeInSession: Time since session started

## Learning

### Q-Learning

CO-PILOT uses Q-learning to update action values:

Q(s,a) = Q(s,a) + alpha * (r + gamma * max(Q(s',a')) - Q(s,a))

Where:
- alpha = 0.1 (learning rate)
- gamma = 0.9 (discount factor)
- r = reward

### Rewards

Rewards are implicit:

- User accepts suggestion: +1
- User rejects suggestion: -1
- User ignores suggestion: 0

## Usage

### Getting Suggestions

CO-PILOT automatically suggests actions based on context:

1. Analyze current context
2. Select best action (or explore)
3. Display suggestion
4. Update Q-value based on user response

### Manual Trigger

Press the CO-PILOT button to get suggestions manually.

## Export/Import Model

CO-PILOT's learned model can be exported/imported:

- Export: Save Q-table and history
- Import: Restore learned model

## Integration with PSY5

CO-PILOT is based on the contextual bandit from PSY5:

- Same algorithm
- Adapted for looper context
- Extended with looper-specific actions

## License

MIT
