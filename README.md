## Mega Man

### Background

**Mega Man** was released in 1987 on the NES (Nintendo Entertainment System).  The original video game remains an enduring and timeless classic, marking the start of a franchise that would to date sell over 30 million copies worldwide.  The Mega Man franchise has become one of the most well known video game franchise of all time and continues to owe much of its future game mechanics to the original.

This project intends to showcase a basic sets of features that define this classic jump & run genre game in plain javascript:
- side to side scrolling (with the help of Canvas)
- character animation (sprites)
- music and interactive sound (with the help of Howler)
- movement and lifepoints (plain javascript)

### Functionality & MVP  

The project implementation should allow the user to:

- to move the character in 2D (running side-to-side, jumping up and down)
- start, pause, restart gameplay
- complete at least one level where the goal is defeat an ai enemy of some kind
- mute music and sound

This project will also include:

- an **ABOUT** modal describing the game and its rules
- a production **README**

### Wireframes

This app will consist of a single screen with game viewport, game controls, and nav links to the Github, my LinkedIn, and the About modal.  Game controls will include Start, Stop, Reset buttons, and Mute control.

![wireframes](images/mockup.png)

### Architecture and Technologies

This project will be implemented with the following technologies:

- Vanilla JavaScript and `jquery` for overall structure and game logic,
- `Canvas` for rendering,
- Webpack to bundle and serve up the various scripts
- HowlerJS to manipulate music and sound

In addition to the webpack entry file, there will be three scripts involved in this project:

`game.js`: this script will handle the logic for creating and updating the the elements of the game.

`canvas.js`: this script will handle the rendering of the game elements.

`howler.js` or `sound.js`: this script will house the logic for music and sound.

### Implementation Timeline

**Day 1**: Setup all necessary Node modules, including getting webpack up and running and `Howler.js` installed.

Create `webpack.config.js` as well as `package.json`.  Write a basic entry file and the bare bones of all 3 scripts outlined above.  Learn the basics of `Howler.js`.  Goals for the day:

- Get a green bundle with `webpack`
- Learn enough Canvas to animate a sprite

**Day 2**: Create the elements of the game and fine tune the physics of running and jumping

- Protagonist should be able to move left and right and jump up and down
- A platform element ("Bricks") to serve as floor and walls
- Render projectiles that the protagonist can "shoot"
- An initial level where the protagonist can move about
- Have the game restart when the protagonist falls off screen

**Day 3**: Add sound

- Learn enough about `HowlerJS` to add sound when the protagonist shoots and jumps.
- Add music
- Add control to mute both sound and music
- Add enemy that jumps and shoots randomly in place at the protagonist

**Day 4**: Install the controls for the user to interact with the game.  Style the front-end, making it polished and professional.  Goals for the day:

- Create controls for the game to stop, start, reset, and toggle mute
- Have a styled page with contact links

### Bonus features

Some possible updates are:

- Add more levels
- Add more game elements (enemy types)
- Point System
- Persisting scores (arcade scoreboard)
