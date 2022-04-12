/*
 * Copyright (c) 2022, Sean DePottey (seandepottey@gmail.com)
 * All rights reserved
 *------------------------------------------------------*/

const SYMBOLS = 'pcsrdPCSRD'

const DEFAULT_POSITION = 'drd/cssc/ppppp/6/7/8/7/6/PPPPP/CSSC/DRD w 0 1'

// const TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*']

// DIRECTIONS
// Axes are x, y, z
// x is horizontal, y is NW & SE, z is NE, SW (both x & y)
// Where x,y || file,rank
const NW = [0,1]
const NE = [1,1]
const E = [1,0]
const SE = [0,-1]
const SW = [-1,-1]
const W = [-1,0]

const DIRECTIONS = [NW, NE, E, SE, SW, W]

const NUMBER_OF_RANKS = 11;

const NUM_TILES_TO_EDGE = []

// Array of array of numbers
const SPHERE_MOVES = []
const RING_MOVES = []
const DIAMOND_MOVES = []

const PYRAMID_OFFSETS = [ 
    [0,1], // NW, NE by index
    [3,4]  // SE, SW by index
]

const PYRAMID_MOVES_WHITE = []
const PYRAMID_MOVES_BLACK = []

const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    PROMOTION: 3,
    PYRAMID_2: 4
}

const TILE_MAP = {
                            '0a': 0, '1a': 1, '2a': 2,
                        '0b': 3, '1b': 4, '2b': 5, '3b': 6,
                    '0c': 7, '1c': 8, '2c': 9, '3c': 10, '4c': 11,
                '0d': 12, '1d': 13, '2d': 14, '3d': 15, '4d': 16, '5d': 17,
            '0e': 18, '1e': 19, '2e': 20, '3e': 21, '4e': 22, '5e': 23, '6e': 24,
        '0f': 25, '1f': 26, '2f': 27, '3f': 28, '4f': 29, '5f': 30, '6f': 31, '7f': 32,
            '0g': 33, '1g': 34, '2g': 35, '3g': 36, '4g': 37, '5g': 38, '6g': 39,
                '0h': 40, '1h': 41, '2h': 42, '3h': 43, '4h': 44, '5h': 45,
                    '0i': 46, '1i': 47, '2i': 48, '3i': 49, '4i': 50,
                        '0j': 51, '1i': 52, '2i': 52, '3i': 54,
                            '0k': 55, '1k': 56, '2k': 57
}

/***************************
 * UTILITY FUNCTIONS
 ***************************/
function rank (coord) {
    return coord.x
}

// File is stored using hexagonal axial coord
function file (coord) {
    return coord.y
}

// Unadjusts the file number from axial where each rank would start with a file 0
function offsetFile(coord) {
    return (coord.y < 6) ? coord.x : coord.x - rankIndex + 5
}

// Returns tile name
function tileName (coord) {
    const f = offsetFile(coord)
    const r = rank(i)
    return '12345678'.substring(f, f+1) + 'abcdefghijk'.substring(r, r + 1)
}

/***************************
 * PUBLIC CONSTANTS
 ***************************/
export const BLACK = 'b'
export const WHITE = 'w'

export const EMPTY = -1

export const PYRAMID = 'p'
export const COLUMN = 'c'
export const SPHERE = 's'
export const RING = 'r'
export const DIAMOND = 'd'

// export const TILES = (function () {
//     /**/
//     var tiles = []
//     for (const i = TILE_MAP; i < NUMBER_OF_RANKS; i++) {

//     }
//     return keys
// })()

// NOTE: Flags can and maybe should be converted to integers for speed
export const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    PROMOTION: 'p',
    PYRAMID_2: 'q'
}

export const Geo = function (gfen) {
    var board = new Array( Array(8), Array(11) )
    var diamonds = { w: [EMPTY, EMPTY], b: [EMPTY, EMPTY] }
    var turn = WHITE
    var halfMoves = 0
    var moveNumber = 1
    var history = []

    function isWhite (piece) {
        return piece.color === WHITE
    }

    // If a user passes in a gfen string, load it, else default to starting position
    if (typeof fen === 'undefined') {
        load (DEFAULT_POSITION)
    } else {
        load (gfen)
    }

    function reset () {
        load(DEFAULT_POSITION)
    }

    function load (gfen) {
        var tokens = gfen.split(/\s+/)
        var position = tokens[0]
        
        var numberOfTilesPerRank = 3;
        var fileIndex = 0;
        var rankIndex = 10;
        var tile = [0,0];

        if (!validateGfen (gfen).valid) {
            return false;
        }

        var numberOfSymbols = position.length;
        for (let char = 0; char < numberOfSymbols; char++) {
            tile = [fileIndex, rankIndex]
            var symbol = position[char];
            if(symbol === '/') {
                fileIndex = 0;
                rankIndex--;
                // Adjust row count
                if (rankIndex > 5) {
                    numberOfTilesPerRank++;
                } else {
                    numberOfTilesPerRank--;
                }
            } else if(isDigit(symbol)) {
                fileIndex += parseInt(symbol)
            } else {
                var pieceColor = (symbol === symbol.toLowerCase()) ? WHITE : BLACK
                put({ type: symbol.toLowerCase(), color: pieceColor }, tile)
            }
        }

        turn = tokens[1]
        halfMoves = parseInt(tokens[2], 10)
        moveNumber = parseInt(tokens[3], 10)

        updateSetup(generateGfen)

        return true;
    }

    function validateGfen (gfen) {
        var tokens = gfen.split(/\s+/)
        
        // 1: Are there 4 sepearate fields
        if(tokens.length !== 4) {
            return { valid: false }
        }

        // 2: Move count is an integer >= 0
        if(isNaN(tokens[3]) || parseInt(tokens[3], 10) <= 0) {
            return { valid: false }
        }

        // 3: Half move counter is an integer > 0
        if(isNaN(tokens[2]) || parseInt(tokens[2], 10) < 0) {
            return { valid: false }
        }

        //

        return true
    }

    function generateGfen () {
        var gfen = ''
        var empty = 0
        var numberOfTilesPerRank = 3

        for (var rankIndex = 10; rankIndex >= 0; rankIndex--) {
            empty = 0
            for(var fileIndex = 0; fileIndex < numberOfTilesPerRank; fileIndex++) {
                if(board[rankIndex][fileIndex] == null) {
                    empty++
                } else {
                    if(empty > 0) {
                        gfen += empty
                        empty = 0;
                    }
                    var pieceColor = board[rankIndex][fileIndex].color
                    var pieceType = board[rankIndex][fileIndex].type
    
                    gfen += (pieceColor === WHITE) ? pieceType.toUpperCase() : pieceType.toLowerCase()
                }
            }
            if(empty > 0) {
                gfen += empty
            }
            if(rankIndex != 0) {
                gfen += '/'
            }
        }

        return [gfen, turn, halfMoves, moveNumber].join(' ')
    }

    function updateSetup(gfen) {
        if(history.length > 0) return

        if(gfen !== DEFAULT_POSITION) {

        }
    }

    function get(tile) {
        var piece = board[tile.y][tile.x]
        return piece ? { type: piece.type, color: piece.color } : null
    }

    function put(piece, tile) {
        // Validate object
        if(!('type' in piece && 'color' in piece)) {
            return false
        }

        // Check for piece
        if(SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            return false
        }

        // Validate tile
        var tileName = tileName(tile)
        if (!(tileName in TILE_MAP)) {
            return false
        }

        /* don't let user place more than 2 dimaonds per side */
        if(piece.type == DIAMOND &&
            diamonds[piece.color][0] != EMPTY && diamonds[piece.color][1] != EMPTY
        ) {
            return false
        }

        board[tile.y][tile.x] = { type: piece.type, color: piece.color }

        // NOTE: add logic for tracking diamonds position here (within the diamonds[])
        if(piece.type == DIAMOND) {
            diamonds[piece.color][piece.dNum]
        }

        updateSetup(generateGfen)

        return true
    }

    function remove (tile) {
        var piece = get(tile)
        board[tile.y][tile.x] = null
        if(piece && piece.type === DIAMOND) {
            diamonds[piece.color[piece.dNum]] = EMPTY
            // NOTE: number of diamonds
        }

        updateSetup(generateGfen)

        return piece
    }

    function buildMove(board, from, to, flags, promotion) {
        var move = {
            from: from,
            to: to,
            flags: flags
        }

        if (promotion) {
            move.isPromotion = true
            move.promotion = promotion
        }

        var capturedPiece = board[to.y][to.x]
        if (capturedPiece) {
            move.isCapture = true
            move.capture = capturedPiece
        }

        return move
    }

    // #region Move generation
    function generateMoves() {
        var moves = []
        var lastRankBeforePromotion = isWhite() ? 9 : 1

        // generatePyramidMoves()
        // generateColumnMoves()
        // generateSphereMoves()
        // generateRingMoves()
        // generateDiamondMoves()
    }

    function generatePyramidMoves() {
        // myPyramids = pieces[us]
    }

    function generateColumnMoves() {
        // myColumns = 
    }

    function generateSphereMoves() {
        // mySpheres = 
    }

    function generateRingMoves() {
        // myRings =
    }

    function generateDiamondMoves() {
        // myDimaonds =
    }
    // #endregion
    
    /* convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     */
    function moveToSan(move, moves) {
        var output = ''

        if (move.piece !== PYRAMID) {
            var disambiguator = getDisambiguator(move, moves)
            output += move.piece.toUpperCase() + disambiguator
        }

        if (move.flags & (BITS.CAPTURE)) {
            if(move.piece === PYRAMID) {
                output += tileName(move.from)[0]
            }
            output += 'x'
        }

        output += tileName(move.to)

        if(move.flags & BITS.PROMOTION) {
            output += '=' + move.promotion.toUpperCase()
        }

        makeMove(move)
        if (gameOver()) {
            output += '#'
        }
        undoMove()

        return output
    }

    function gameOver() {
        if (diamonds[0][0] == null && diamonds[0][1] === null || diamonds[1][0] === null && diamonds[1][1] === null) {
            return true
        }
        return false
    }

    function insufficientMaterial() {

    }

    function inThreeFoldRepition() {

    }

    function push(move) {
        history.push({
            move: move,
            turn: turn,
            halfMoves: halfMoves,
            moveNumber: moveNumber
        })
    }

    function makeMove(move) {
        const us = turn
        const them = swapColor(us)
        push(move)

        const to = move.to
        const from = move.from

        board[to.y[to.x]] = board[from.y[from.x]]
        board[from.y[from.x]] = null

        /* Promotion */
        if(moves.flags & BITS.PROMOTION)
    }
}