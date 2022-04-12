# geo-js

geo-js.js is a javascript move generator for the geo board game. It's intended for user input on the front end.
generate/validation & piece placement/movement

## Installation

To install the stable version:

```
#NPM
npm install geo-js.js
```

## Example Code

## User interface

By design, geo-js.js is headless and does not include a user interface.

## API

## Constructor: Geo([ gfen ])

The Geo() constructor takes an optional parameter which specifies a board configuration using 
Geo Forsyth-Edwards Notation which is based upon [Forsyth-Edwards Notation](http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation).

```js
// The board defaults to the starting position when called with no parameters
const geo = new Geo()

// pass in a Gfen string to load a particular board position
const geo = new Geo(
    ''
)
```

### .ascii()

Returns a string containing an ASCII diagram of the current position.

```js
const geo = new Geo()

// In geo ranks are represented by letters and files are represented by numbers. This is due to the length of a geo board having 11 ranks, 
// so by flipping the typical chess `${letter}${number}` moves can still be represented by two characters
// To make moves
geo.move('8e')
geo.move('4d')

geo.ascii()
// -> '     +--------+
//         /
//        /
//
//
//
//
//
//
//
//
//
//
```

### .board()

Returns a 2D array representation of the current position. Empty tiles are represented by `null`.

```js
const geo = new Geo()

geo.board()
```

### .clear()

Clears the board.

```js
geo.clear()
geo.gfen()
```

### .deleteComment()

Delete and return the comment for the current position, if it exists

### .gfen()

Returns the GFEN string for the current position.

```js
const geo = new Geo()

```

### .gameOver()
Returns true if the game has ended via elimination, stalemate, draw, threefold repetition, or insufficient material. Otherwise, returns false.

```js
const geo = new Geo()
geo.game_over()
// -> false

// stalemate
geo.load('')
geo.gameOver()
// -> true

// elimination
geo.load('')
geo.gameOver()
// -> true
```

### .get(tile)

Returns the piece on the target tile:

```js
geo.clear()
geo.put({ type: geo.Pyramid, color: geo.black }, 'a5') // put a black pyramid on a5

geo.get('5a')
// -> { type: 'p', color: 'b' }
geo.get('6a')
// -> null
```

### .history([ options? ])

Returns a list containing the mvoes of the current game. Options is an optional 
parameter which may contain a 'verbose' flag. See .moves() for a description of 
the verbose move fields.

```js
const geo = new Geo()
geo.move('4e')
geo.move('5e')
geo.move('4f')

geo.history()
// -> ['4e', '5e', '4f']

geo.history({ verbose: true })
// -> [{ geo: 'w', from }]
```

### .inDraw()

Returns a boolean on wheater the current board position is a draw (50-move rule or insufficient material).

```js
const geo = new Geo('')
// -> true
```

### .inThreefoldRepitition()

Returns a boolean for if the current board position has occurred three or more times.

```js
const geo = new Geo('')
//
geo.inThreefoldRepitition()
// -> false

geo.move()
// -> false

geo.move()
// -> true
```

### .insufficentMaterial()

Returns true if a game is drawn due to insufficient material ()

```js
const geo = new Geo('')
geo.insufficientMaterial()
// -> true
```

### .load(gfen)

The board is cleared, and the gfen string is loaded. Returns true if the position was 
successfully loaded, otherwise false.

```js
const geo = new Geo()
geo.load('')
// -> true

geo.load()
// -> false, bad piece X
```

### .move(move, [ options? ])

Attempts to make a move on the board, returning a move object if the mvoe was legal, otherwise null. The .move function can be called two ways, by passing a string in Standard Algebraic Notation (SAN):

```js
const geo = new Geo()

geo.move('4e')
// -> { color: 'w', from }

geo.move('')
// -> { }

geo.move('')
// -> { }
```

Or by passing .move() a move object (only the 'to', 'from', and when necessary
'promotion', fields are needed):

```js
const geo = new Geo()

geo.move({ from: '', to: ''})
// -> { color: 'w', from '2g', to: ''}
```

An optional sloppy flag can be used to parse a variety of non-standard move
notations:

```js
const geo = new Geo()

// various forms of Long Algebraic Notation
geo.move()
// -> 
```

### .moves([ options? ])

Returns a list of legal moves from the current position. The function takes an optional parameter which controls the single-tile move generation and verbosity.

```js
const geo = new Geo()
geo.moves()
// -> [
//      ]

geo.moves({ tile: '2e' })
// -> ['', '']

geo.moves({ tile: '3d' })
// -> []

geo.moves({ verbose: true })
// ->   [{ color: 'w', from: '' 
//      },
//      ...
//      ]
```

The _piece, _captured, and _promotion fields contain the lowercase representation of the applicable piece.

The _flags field in verbose mode may contain one or more of the following values:

-   'n' - a non-capture
-   'b' - a pyramid push of tile tiles
-   'p' - a promotion
-   'c' - a standard capture

A flag of 'bc' would mean a pyramid captured a peice on the it's corresponding 2 push rank.

### .put(piece, tile)

Place a piece on the tile where piece is an object with the form
{ type: ..., color: ... }. Returns true if the piece was successfully placed,
otherwise, the board remains unchanged and false is returned. `put()` will fail
when passed an invalid piece or tile, or when three or more diamonds of the same
color are placed.

```js
geo.clear()

geo.put({})
// -> true
geo.put({})
// -> true

geo.gfen('')
// -> 

geo.put({}) // invalid piece
// -> false

geo.clear()

geo.put({ type: 'z', color: 'w' }, 'a1')
// -> false

geo.put()
// -> false
```

### .removeTile(tile)

Remove and return the piece on _tile.

```js
geo.clear()
geo.put({}) // put a 
geo.put({})

geo.remove('5a')
// -> { type: 'p', color: 'b' }
geo.remove('')
// -> 
```

### .reset()

Reset the board to the initial starting position.

### .tileColor(tile)

Returns the color of the tile ('light' or 'dark')

```js
const geo = Geo()
geo.tileColor('a1')
// -> 'light'
```

### .turn()

Returns the current side to move.

```js
geo.load('')
geo.turn()
// -> 'b'
```

### .undo()

Takeback the last half-move, returning a move object if successful, otherwise null.

```js
const geo = new Geo()

geo.gfen()
// -> 
geo.move('4e')
geo.gfen()

geo.undo()
// -> {}
geo.gfen()
// -> 
geo.undo()
// -> null
```

### .validateGfen(gfen):

Returns a validation object specifying validation or the errors found within the GFEN string.

```js
geo.validateGfen('')
// -> 

geo.validateGfen('')
// -> {  }
```