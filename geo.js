/*
 * Copyright (c) 2022, Sean DePottey (seandepottey@gmail.com)
 * All rights reserved
 *------------------------------------------------------*/

const SYMBOLS = 'pcsrdPCSRD'

const DEFAULT_POSITION = 'drd/cssc/ppppp/6/7/8/7/6/PPPPP/CSSC/DRD w 0 1'

// const TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*']

const NUMBER_OF_RANKS = 11;
const NUMBER_OF_FILES_PER_RANK = [3,4,5,6,7,8,7,6,5,4,3]

// #region precomputed move consts
// DIRECTIONS
// Axes are x, y, z
// x is horizontal, y is NW & SE, z is NE, SW (both x & y)
// Where x,y || file,rank
const NW = [0,1]
const NORTH = [1,2]
const NE = [1,1]
const E = [1,0]
const SE = [0,-1]
const SOUTH = [-1,-2]
const SW = [-1,-1]
const W = [-1,0]

const DIRECTIONS = [NW, NE, E, SE, SW, W]

const PYRAMID_ATTACK_DIRECTIONS = [ 
    [0,1], // NW, NE by index
    [3,4]  // SE, SW by index
]

const DIAMOND_OFFSETS = [
    NORTH,  // Direct North (skippping a rank)
    SOUTH   // Direct South (skippping a rank)
]

const SPHERE_ROLLS = [
    // Inner circle
    NW, NE, E, SE, SW, W
    // Outer circle
]

const RING_JUMPS = [
    [0,3], [1,3], [2,3], [3,3], [3,2], [3,1], [3,0], [2,-1], [1, -2],
    [0,-3], [-1, -3], [-2,-3], [-3,-3], [-3,-2], [-3-1], [-3,0], [-2,1], [-1,2]
]

// Array of array of numbers
const SPHERE_MOVES = []
const RING_MOVES = []
const DIAMOND_MOVES = []

const PYRAMID_MOVES_WHITE = []
const PYRAMID_MOVES_BLACK = []
// #endregion

const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    PROMOTION: 3,
    PYRAMID_2: 4
}

const RANK_A = 0;
const RANK_B = 1;
const RANK_J = 9;
const RANK_K = 10;

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
                        '0j': 51, '1j': 52, '2j': 52, '3j': 54,
                            '0k': 55, '1k': 56, '2k': 57
}

function getDisambiguator(move, moves) {
    var from = move.from
    var to = move.to
    var piece = move.piece

    var ambiguities = 0
    var sameRank = 0
    var sameFile = 0

    var numberOfMoves = moves.length
    for (var i = 0, len = numberOfMoves; i < len; i++) {
        var ambigFrom = moves[i].from
        var ambigTo = moves[i].to
        var ambigPiece = moves[i].piece

        // If a move of the same piece type ends on the same tile, this function will help correct the algebraic notation
        if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
            ambiguities++

            if (rank(from) === rank(ambigFrom)) {
                sameRank++
            }

            if (file(from) === file(ambigFrom)) {
                sameFile++
            }
        }
    }

    if (ambiguities > 0) {
        // If there exists a similar moving piece on the same rank and file as the move in question, use the tile as the disambiguator
        if (sameRank > 0 && sameFile > 0) {
            return tileName(from)
        } else if (sameFile > 0) {
            return tileName.charAt(1)
        } else {
            return tileName.charAt(2)
        }
    }

    return ''
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

// Adjusts the file number to axial where the x value aligns diagonally
function axialFile (coord) {
    return (coord.y > 5) ? (coord.x + coord.y - 5) : coord.x
}

// Unadjusts the file number from axial where each rank would start with a file 0
function offsetFile (coord) {
    return (coord.y < 6) ? coord.x : coord.x - coord.y + 5
}

// Returns tile name
function tileName (coord) {
    const f = offsetFile(coord)
    const r = rank(coord)
    return '12345678'.substring(f, f+1) + 'abcdefghijk'.substring(r, r + 1)
}

function isDigit (char) {
    return 'o123456789' .indexOf(char) !== -1
}

function validateCoord (coord) {
    var fileIndex = coord.x
    var rankIndex = coord.y
    // NOTE: This pattern of using a const can replace the numberOfTiles++ incrementing deincrementing, may be faster?
    var filesPerRank = NUMBER_OF_FILES_PER_RANK[rankIndex]
    if (fileIndex > -1 && fileIndex < filesPerRank && rankIndex > -1 && rankIndex < 11) {
        return true
    }
    return false
}

function clone (obj) {
    var dupe = obj instanceof Array ? [] : {}

    for (var property in obj) {
        if (typeof property === 'object') {
            dupe[property] = clone (obj[property])
        } else {
            dupe[property] = obj[property]
        }
    }

    return dupe
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

// Precomputed Move Data
export const pmd = (function () {
    var numOfTilesToEdge = []
    var numberOfTilesPerRank = 3
    
    var nwLengthStart = 5
    var neLengthStart = 7
    var seLengthStart = 0
    var swLengthStart = 0

    for (var rankIndex = 0; rankIndex < NUMBER_OF_RANKS; rankIndex++) {
        var nwTiles = nwLengthStart
        var neTiles = neLengthStart
        var seTiles = seLengthStart
        var swTiles = swLengthStart
        var lastTileIndex = numberOfTilesPerRank

        for (var fileIndex = 0; fileIndex < numberOfTilesPerRank; fileIndex++) {
            // #region directional to boards edge
            // x axis is as expected length is equal to numberOfTilesPerRow
            // y axis goes 0-[6-8] from the SE to the NW
            // z axis goes 0-[6-8] from the SW to the NE

            // With 3,5 as an example
            // NW = 3
            // NE = 4
            // SE = 4
            // SW = 3
            var axI = axialFile({ x: fileIndex, y: rankIndex})

            numOfTilesToEdge[rankIndex][axI][0] = nwTiles
            numOfTilesToEdge[rankIndex][axI][1] = neTiles
            numOfTilesToEdge[rankIndex][axI][2] = (numberOfTilesPerRank - 1) - fileIndex
            numOfTilesToEdge[rankIndex][axI][3] = seTiles
            numOfTilesToEdge[rankIndex][axI][4] = swTiles
            numOfTilesToEdge[rankIndex][axI][5] = fileIndex

            if (rankIndex < 4) {
                nwTiles++
            } else if (rankIndex === 4 && nwTiles < 6) {
                nwTiles++
            } else if (rankIndex > 4 && fileIndex < (numberOfTilesPerRank - 3)) {
                nwTiles++
            }

            if (rankIndex < 4) {
                neTiles--
            } else if (rankIndex === 4 && fileIndex > 0) {
                neTiles--
            } else if (rankIndex > 4 && fileIndex > 1) {
                neTiles--
            }

            if (rankIndex < 6 && fileIndex > 1) {
                seTiles--
            } else if (rankIndex === 6 && fileIndex > 0) {
                seTiles--
            } else if (rankIndex > 6) {
                seTiles--;
            }

            if (rankIndex < 6 && fileIndex < (numberOfTilesPerRank - 3)) {
                swTiles++
            } else if (rankIndex === 6 && swTiles < 6) {
                swTiles++
            } else if (rankIndex > 6) {
                swTiles++
            }
            // #endregion
        }
        // Adjust row count
        if(rankIndex < 5) {
            numberOfTilesPerRank++
        } else {
            numberOfTilesPerRank--;
        }

        // Adjust diagonal starting counts NW, NE, SE, SW
        if (rankIndex < 5) {
            nwLengthStart--;
        }

        if (rankIndex > 2) {
            neLengthStart--;
        }

        if (rankIndex < 7) {
            seLengthStart++
        }

        if(rankIndex > 4) {
            swLengthStart++
        }
    }
})()

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
    var header = {}

    function isWhite (piece) {
        return piece.color === WHITE
    }

    // If a user passes in a gfen string, load it, else default to starting position
    if (typeof gfen === 'undefined') {
        load (DEFAULT_POSITION, false)
    } else {
        load (gfen, true)
    }

    function reset () {
        load(DEFAULT_POSITION, false)
    }

    function load (gfen, validate) {
        var tokens = gfen.split(/\s+/)
        var position = tokens[0]
        
        var fileIndex = 0;
        var rankIndex = 10;
        var tile = [0,0];

        // Only run validation on custom gfens
        if(validate) {
            if (!validateGfen (gfen).valid) {
                return false;
            }
        }

        var numberOfSymbols = position.length;
        for (let char = 0; char < numberOfSymbols; char++) {
            var axialIndex = axialFile({x: fileIndex, y: rankIndex})
            tile = [axialIndex, rankIndex]
            var symbol = position[char];
            if(symbol === '/') {
                fileIndex = 0;
                rankIndex--;
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
        var positions = tokens[0]
        var whitePieces = []
        var blackPieces = []
        
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

        // 4: Check positions for errors
        var numberOfSymbols = positions.length;
        var whiteDiamonds = 0
        var blackDimaonds = 0
        var maxIndexOfTilesPerRank = 2
        var rankIndex = 10
        var fileIndex = 0

        for (let char = 0; char < numberOfSymbols; char++) {
            var axialIndex = axialFile(fileIndex)
            var tile = [axialIndex, rankIndex]
            var symbol = positions[char];
            if (symbol == '/') {
                fileIndex = 0
                rankIndex--
                if(rankIndex > 5) {
                    maxIndexOfTilesPerRank++
                } else {
                    maxIndexOfTilesPerRank--
                }
            } else {
                if (isDigit(symbol)) {
                    fileIndex += parseInt(symbol)
                } else {
                    switch (symbol) {
                        case 'd':
                            blackDimaonds++
                            break;
                        case 'D':
                            whiteDiamonds++
                            break;
                    }
                    fileIndex++
                }
            }
            // If a file is too long
            if(fileIndex > maxIndexOfTilesPerRank) {
                return { valid: false }
            }
        }

        // 5: Position doesn't have at least one diamond per side
        if (whiteDiamonds === 0 || blackDimaonds === 0 ) {
            return { valid: false }
        }

        return true
    }

    function generateGfen () {
        var gfen = ''
        var empty = 0
        var numberOfTilesPerRank = 3

        for (var rankIndex = 10; rankIndex >= 0; rankIndex--) {
            empty = 0
            for(var fileIndex = 0; fileIndex < numberOfTilesPerRank; fileIndex++) {
                var axialIndex = axialFile(fileIndex)
                if(board[rankIndex][axialIndex] == null) {
                    empty++
                } else {
                    if(empty > 0) {
                        gfen += empty
                        empty = 0;
                    }
                    var pieceColor = board[rankIndex][axialIndex].color
                    var pieceType = board[rankIndex][axialIndex].type
    
                    gfen += (pieceColor === WHITE) ? pieceType.toUpperCase() : pieceType.toLowerCase()
                }
            }
            if(empty > 0) {
                gfen += empty
            }
            if(rankIndex != 0) {
                gfen += '/'
            }
            if(rankIndex > 5) {
                numberOfTilesPerRank++
            } else {
                numberOfTilesPerRank--
            }
        }

        return [gfen, turn, halfMoves, moveNumber].join(' ')
    }

    function updateSetup(gfen) {
        if(history.length > 0) return
            
        if(gfen !== DEFAULT_POSITION) {
            header['GFEN'] = gfen
        } else {
            delete header['GFEN']
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
            move.flags |= BITS.PROMOTION
            move.promotion = promotion
        }

        var capturedPiece = board[to.y][to.x]
        if (capturedPiece) {
            move.capture = capturedPiece
        }

        return move
    }

    // #region Move generation
    function generateMoves() {
        var moves = []
        
        var pieceType = 
            typeof options !== 'undefined' && 
            'piece' in options &&
            typeof options.piece === 'string'
            ? options.piece.toLowerCase()
            : true

        var numberOfTilesPerRank = 3

        for (var rankIndex = 0; rankIndex < NUMBER_OF_RANKS; rankIndex++) {
            for (var fileIndex = 0; fileIndex < numberOfTilesPerRank; fileIndex++) {
                piece = board[rankIndex][fileIndex]
                if(piece == null || piece.color !== us) {
                    continue
                }
                
                // NOTE: CONCATENATE THE ARRAYS HERE
                if (piece.type === PYRAMID && (pieceType === true || pieceType === PYRAMID)) {
                    var pyramidMoves = generatePyramidMoves(piece)
                    moves.concat(pyramidMoves)
                }

                if (piece.type === COLUMN && (pieceType === true || pieceType === COLUMN)) {
                    var columnsMoves = generateColumnMoves(piece)
                    moves.concat(columnsMoves)
                }

                if (piece.type === SPHERE && (pieceType === true || pieceType === SPHERE)) {
                    var sphereMoves = generateSphereMoves(piece)
                    moves.concat(sphereMoves)
                }

                if (piece.type === RING && (pieceType === true || pieceType === RING)) {
                    var ringMoves = generateRingMoves(piece)
                    moves.concat(ringMoves)
                }

                if (piece.type === DIAMOND && (pieceType === true || pieceType === DIAMOND)) {
                    var diamondMoves = generateDiamondMoves(piece)
                    moves.concat(diamondMoves)
                }
            }
            if (rankIndex < 5) {
                numberOfTilesPerRank++
            } else {
                numberOfTilesPerRank--
            }
        }

        return Moves
    }

    function generatePyramidMoves(tile) {
        var moves = []
        var rank = tile.y
        var whitePiece = isWhite(piece.color)
        var finalRankBeforePromotion = whitePiece ? 9 : 1
        var startRank = whitePiece ? 2 : 8
        var oneStepFromPromotion = rank == finalRankBeforePromotion
        var dir = whitePiece ? PYRAMID_ATTACK_DIRECTIONS[0] : PYRAMID_ATTACK_DIRECTIONS[1]
        if (rank === startRank) {
            var targetX = tile.x + N[0]
            var targetY = tile.y + N[1]
            var target = board[targetY][targetX]
            moves.push(buildMove(board, moves, tile, target, BITS.PYRAMID_2))
        }
        for (var j = 0; j < 2; j++) {
            var tilesToEdge = numOfTilesToEdge[tile.y][tile.x][dir][j]
            if (tilesToEdge > 0) {
                var moveDir = dir[j]
                var targetX = tile.x + DIRECTIONS[moveDir][0]
                var targetY = tile.y + DIRECTIONS[moveDir][1]
                var target = board[targetY][targetX]
                var flag = (typeof target.type === "undefined") ? BITS.NORMAL : BITS.CAPTURE
                var promotion = oneStepFromPromotion ? true : false

                if (promotion) {
                    var pieces = [COLUMN, SPHERE, RING, DIAMOND]
                    var numberOfPieceTypes = pieces.length;
                    for (var i = 0; i < numberOfPieceTypes; i++) {
                        move.push(buildMove(board, from, to, flags, pieces[i]))
                    }
                } else {
                    moves.push(buildMove(board, moves, tile, target, flag))
                }
            }
        }
        return moves
    }

    function generateColumnMoves(tile) {
        var moves = []
        for (var dirIndex = 0; dirIndex < 6; dirIndex++) {
            var tilesToEdge = numOfTilesToEdge[tile.y][tile.x][dirIndex]
            for (var n = 0; n < tilesToEdge; n++) {
                if (n < 6) {
                    var targetX = tile.x + DIRECTIONS[dirIndex][0] * (n + 1)
                    var targetY = tile.y + DIRECTIONS[dirIndex][1] * (n + 1)
                    var target = board[targetY][targetX]
                    var color = target.color
                    var enemy = swapColor(color)
                    if (color === tile.color) {
                        break
                    }
                    
                    if (color !== enemy) {
                        moves.push(buildMove(board, tile, target, BITS.NORMAL))
                        break
                    } else {
                        moves.push(buildMove(board, tile, target, BITS.CAPTURE))
                    }
                }
            }
        }
        return moves
    }

    function generateSphereMoves(tile) {
        var moves = []
        // NOTE: Can add an array here to check if a move in the outer circle has already been found.
        for (var dirIndex = 0; dirIndex < 6; dirIndex++) {
            // Inner circle
            var targetX = tile.x + DIRECTIONS[dirIndex][0]
            var targetY = tile.y + DIRECTIONS[dirIndex][1]
            var target = board[targetY][targetX]
            var color = target.color
            var enemy = swapColor(color)
            if (color === tile.color) {
                continue
            }

            if (color !== enemy) {
                moves.push(buildMove(board, tile, target, BITS.NORMAL))

                for (var offset = - 1; offset < 2; offset++) {
                    var offsetDir = dirIndex + offset;
                    if (offsetDir < 0) {
                        offsetDir = 5; // The last direction
                    }
                    if (offsetDir > 5) {
                        offsetDir = 0;
                    }
                    var t2X = target.x + DIRECTIONS[offsetDir][0]
                    var t2Y = target.y + DIRECTIONS[offsetDir][1]
                    var targetCoord = { x: t2X, y: t2Y }
                    var isValid = validateCoord(targetCoord)
                    if (isValid) {
                        var move2 = board[t2Y][t2Y]
                        var flag = color !== enemy ? BITS.NORMAL : BITS.CAPTURE
                        // NOTE: Currently moves are duplicated within here
                        // a possible solution would be a slightly more complex 
                        // version of the diamond north south check
                        moves.push(buildMove(board, tile, move2, flag))
                    }
                }
            } else {
                moves.push(buildMove(board, tile, target, BITS.CAPTURE))
            }
        }
        return moves
    }

    function generateRingMoves(tile) {
        var moves = []
        var moves = []

        var numberOfJumps = RING_JUMPS.length
        for (var jump = 0; jump < numberOfJumps; jump++) {
            var targetX = RING_JUMPS[jump][0]
            var targetY = RING_JUMPS[jump][1]
            var targetCoord = { x: targetX, y: targetY }
            var isValid = validateCoord(targetCoord)
            if (isValid) {
                var target = board[targetY][targetX]
                var color = target.color
                if(color === tile.color) {
                    continue
                }
                var flag = color !== enemy ? BITS.NORMAL : BITS.CAPTURE
                buildMove(board, tile, target, flag)
            }
        }
        return moves
    }

    function generateDiamondMoves(tile) {
        var moves = []
        var north = false
        var south = false
        for (var dirIndex = 0; dirIndex < 6; dirIndex++) {
            // Inner circle
            var targetX = tile.x + DIRECTIONS[dirIndex][0]
            var targetY = tile.y + DIRECTIONS[dirIndex][1]
            var target = board[targetY][targetX]
            var color = target.color
            var enemy = swapColor(color)
            if (color === tile.color) {
                continue
            }

            if (color !== enemy) {
                moves.push(buildMove(board, moves, tile, target, BITS.NORMAL))
                switch (dirIndex) {
                    case 0 || 1:
                        if(!north) {
                            // Add direct north
                            var nX = tile.x + NORTH[0]
                            var nY = tile.y + NORTH[1]
                            var northTarget = board[nY][nX]
                            moves.push(buildMove(board, moves, tile))
                            north = true
                        }
                        break;
                    case 3 || 4:
                        if(!south) {
                            // Add direct south
                            var sX = tile.x + SOUTH[0]
                            var sY = tile.y + SOUTH[1]
                            var southTarget
                            south = true
                        }
                }
            } else {
                moves.push(buildMove(board, moves, tile, target, BITS.CAPTURE))
            }
        }
        return moves
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

    function eliminated() {
        if (diamonds[0][0] == null && diamonds[0][1] === null || diamonds[1][0] === null && diamonds[1][1] === null) {
            return true
        }
        return false
    }

    function insufficientMaterial() {
        console.log("Write insufficient material")
    }

    function inThreeFoldRepition() {
        console.log("Write three fold repition")
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

        const toCoord = move.to
        const fromCoord = move.from
        let boardFrom = board[fromCoord.y][fromCoord.x]
        let boardTo = board[toCoord.y][toCoord.x]

        /* if we captured an enemy diamond */
        if(boardTo.type === DIAMOND) {
            diamonds[them][boardTo.dNum] = null
        }

        boardTo = boardFrom
        boardFrom = null

        /* Promotion */
        if (move.flags & BITS.PROMOTION) {
            boardTo = { type: move.promotion, color: us }
        }

        /* if we moved a dimaond */
        if (boardTo.type === DIAMOND) {
            diamonds[us][boardTo.dNum] = null
        }

        if (move.piece === PYRAMID) {
            halfMoves = 0
        } else if (move.flags & (BITS.CAPTURE)) {
            halfMoves = 0
        } else {
            halfMoves++
        }

        if(turn === BLACK) {
            moveNumber++
        }
        turn = swapColor(turn)
    }

    function undoMove() {
        var old = history.pop()
        if (old == null) {
            null
        }

        var move = old.move
        diamonds = old.diamonds
        turn = old.turn
        halfMoves = old.halfMoves
        moveNumber = old.moveNumber

        var us = turn
        var them = swapColor(us)

        var from = move.from
        var to = move.to

        var moveF = board[from.y][from.x]
        var moveT = board[to.y][to.x]

        moveF = moveT
        moveF.type = move.piece // to undo any promotions
        moveT = null

        if (move.flags & BITS.CAPTURE) {
            moveT = { type: move.captured, color: them }
        }

        return move
    }

    function outputMove(move) {
        var clone = clone (move)
        clone.san = moveToSan(clone, generateMoves({ legal: true }))
        clone.to = tileName(clone.to)
        clone.from = tileName(clone.from)

        var flags = ''

        for (var flag in BITS) {
            if (BITS[flag] & move.flags) {
                flags += FLAGS[flag]
            }
        }
        move.flags = flags

        return clone
    }

    return {
        /*****************************************
         * PUBLIC API
         *****************************************/
        load: function(gfen) {
            return load(gfen)
        },

        reset: function() {
            return reset()
        },

        moves: function (options) {
            /* The internal representation of a move is in 0x88 format, and 
             * not meant to be human readable. The code below converts the 0x88
             * tile coordinates to alegbraic coordinates. 
             * It also prunes an unnecessarry move keys resulting from a verbose call
             */

            var moves = []
            for (var i = 0, len = uglyMoves.length; i < len; i++) {
                if (
                    typeof options !== 'undefined' &&
                    'verbose' in options &&
                    options.verbose
                ) {
                    moves.push(makePretty(uglyMoves[i]))
                } else {
                    moves.push(
                        moveToSan(uglyMoves[i], generateMoves({ legal: true }))
                    )
                }
            }

            return moves
        },

        eliminated: function() {
            return eliminated()
        },

        inDraw: function() {
            return (
                halfMoves >= 100 ||
                insufficientMaterial() ||
                inThreeFoldRepition
            )
        },

        insufficientMaterial: function() {
            return insufficientMaterial
        },

        inThreeFoldRepition: function() {
            return inThreeFoldRepition
        },

        gameOver: function() {
            return (
                halfMoves >= 100 ||
                eliminated() ||
                insufficientMaterial ||
                inThreeFoldRepition
            )
        },

        validateGfen: function() {
            return validateGfen
        },

        gfen: function() {
            return generateGfen
        },

        board: function() {
            var output = []
            row = []
            numberOfTilesPerRank = 3

            for(var rankIndex = 0; rankIndex < 11; rankIndex++ ) {
                for(var fileIndex = 0; fileIndex < numberOfTilesPerRank; fileIndex++) {
                    if(board[rankIndex][fileIndex] == null) {
                        row.push(null)
                    } else {
                        var tile = board[rankIndex][fileIndex];
                        row.push({
                            tile: tileName(fileIndex, rankIndex),
                            type: tile.type,
                            color: tile.color
                        })
                    }
                    if(fileIndex === numberOfTilesPerRank - 1) {
                        output.push(row)
                        row = []
                    }
                }
                if(rankIndex < 5) {
                    numberOfTilesPerRank++
                } else {
                    numberOfTilesPerRank--;
                }
            }

            return output
        },

        turn: function() {
            return turn
        },

        move: function (move, options) {
            /* The move function can be called with in the following parameters:
             *
             * .move({ from: 'h7', <- where the 'move' is a move object (additional
             *         to :'h8',      fields are ignored)
             *         promotion: 'q',
             *      })
             */

            var moveObj = null
            if (typeof move === 'object') {
                var moves = generateMoves()

                /* convert move object to 0x88 */
                for (var i = 0, len = move.length; i < len; i++) {
                    if (move.from === tileName(move[i].from) &&
                        move.to === tileName(move[i].to) &&
                        (!('promotion' in moves[i])) ||
                        move.promotion === moves[i].promotion
                    ) {
                        moveObj = moves[i]
                        break
                    }
                }
            }

            // Failed to find move
            if (!moveObj) {
                return null
            }

            var sanMove = outputMove(moveObj)

            makeMove(moveObj)

            return sanMove
        },

        generatePyramidMoves: function (tile) {
            return generatePyramidMoves(tile)
        },

        generateColumnMoves: function (tile) {
            return generateColumnMoves(tile)
        },

        generateSphereMoves: function (tile) {
            return generateSphereMoves(tile)
        },

        generateRingMoves: function (tile) {
            return generateRingMoves(tile)
        },

        generateDiamondMoves: function (tile) {
            return generateDiamondMoves(tile)
        },

        undo: function() {
            var move = undoMove()
            return move ? outputMove(move) : null
        },

        put: function() {
            return put(piece, tile)
        },

        get: function(tile) {
            return get(tile)
        },

        ascii() {
            var s = 'COMING SOON!\n'
            return s
        },

        remove: function() {
            return remove
        },

        darkTile: function(tile) {
            var offset = (tile.x > 5) ? 1: 0
            if(tile.y % 2 == 0 && (tile.x - offset) % 2 != 0) {
                return true
            }
            return false
        },

        history: function (options) {
            var reversedHistory = []
            var moveHistory = []
            var verbose = 
                typeof options !== 'undefined' && 
                'verbose' in options &&
                options.verbose

            while (history.length > 0) {
                reversedHistory.push(undoMove())
            }

            while (reversedHistory.length > 0) {
                var prevMove = reversedHistory.pop()
                if(verbose) {
                    moveHistory.push(outputMove(prevMove))
                } else {
                    moveHistory.push(moveToSan(move, generateMoves({ legal: true })))
                }
                makeMove(prevMove)
            }

            return moveHistory
        }
    }
}