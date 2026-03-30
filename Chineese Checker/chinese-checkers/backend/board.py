"""
Chinese Checkers Board Logic
Star-shaped board with 121 positions (standard 2-player setup)
Player 0: starts at top triangle (rows 0-3)
Player 1: starts at bottom triangle (rows 13-16)
"""

# Standard Chinese Checkers board layout
# Each row: (start_col_offset, num_holes)
BOARD_ROWS = [
    (4, 1),   # row 0
    (3, 2),   # row 1
    (2, 3),   # row 2
    (1, 4),   # row 3
    (0, 13),  # row 4
    (0, 12),  # row 5  -- actually standard is different, let me use correct layout
    (0, 11),  # row 6
    (0, 10),  # row 7
    (0, 9),   # row 8 (middle)
    (0, 10),  # row 9
    (0, 11),  # row 10
    (0, 12),  # row 11
    (0, 13),  # row 12
    (1, 4),   # row 13
    (2, 3),   # row 14
    (3, 2),   # row 15
    (4, 1),   # row 16
]

# Correct standard layout using col indices per row
ROW_COLS = {
    0:  [4],
    1:  [3, 5],
    2:  [2, 4, 6],
    3:  [1, 3, 5, 7],
    4:  [0, 2, 4, 6, 8, 10, 12],
    5:  [1, 3, 5, 7, 9, 11],
    6:  [2, 4, 6, 8, 10],
    7:  [3, 5, 7, 9],
    8:  [4, 6, 8],
    9:  [3, 5, 7, 9],
    10: [2, 4, 6, 8, 10],
    11: [1, 3, 5, 7, 9, 11],
    12: [0, 2, 4, 6, 8, 10, 12],
    13: [1, 3, 5, 7],
    14: [2, 4, 6],
    15: [3, 5],
    16: [4],
}

# Player 0 starts at top (rows 0-3), goal is bottom (rows 13-16)
# Player 1 starts at bottom (rows 13-16), goal is top (rows 0-3)
PLAYER_START = {
    0: [(r, c) for r in [0, 1, 2, 3] for c in ROW_COLS[r]],
    1: [(r, c) for r in [13, 14, 15, 16] for c in ROW_COLS[r]],
}

PLAYER_GOAL = {
    0: [(r, c) for r in [13, 14, 15, 16] for c in ROW_COLS[r]],
    1: [(r, c) for r in [0, 1, 2, 3] for c in ROW_COLS[r]],
}

# 6 directions for hex grid (row, col deltas)
# On this board, even/odd rows shift differently
DIRECTIONS = [(-1, -1), (-1, 1), (0, -2), (0, 2), (1, -1), (1, 1)]


class ChineseCheckersBoard:
    def __init__(self):
        # board[row][col] = None | 0 | 1  (player index)
        self.board = {}
        self._init_board()
        self.move_history = []

    def _init_board(self):
        # Initialize all valid positions to empty
        for row, cols in ROW_COLS.items():
            for col in cols:
                self.board[(row, col)] = None

        # Place player pieces
        for player, positions in PLAYER_START.items():
            for pos in positions:
                self.board[pos] = player

    def is_valid_pos(self, row, col):
        return (row, col) in self.board

    def get_valid_moves(self, row, col):
        """Return all valid destination positions for piece at (row, col)"""
        if not self.is_valid_pos(row, col):
            return []
        if self.board[(row, col)] is None:
            return []

        moves = set()
        # Single step moves
        for dr, dc in DIRECTIONS:
            nr, nc = row + dr, col + dc
            if self.is_valid_pos(nr, nc) and self.board[(nr, nc)] is None:
                moves.add((nr, nc))

        # Jump moves (chain jumps via BFS)
        visited = set()
        visited.add((row, col))
        queue = [(row, col)]
        while queue:
            cr, cc = queue.pop(0)
            for dr, dc in DIRECTIONS:
                mr, mc = cr + dr, cc + dc   # middle
                lr, lc = cr + 2*dr, cc + 2*dc  # landing
                if (self.is_valid_pos(mr, mc) and self.board[(mr, mc)] is not None and
                        self.is_valid_pos(lr, lc) and self.board[(lr, lc)] is None and
                        (lr, lc) not in visited):
                    visited.add((lr, lc))
                    moves.add((lr, lc))
                    queue.append((lr, lc))

        return [list(m) for m in moves]

    def move_piece(self, from_row, from_col, to_row, to_col):
        """Move piece, returns True if successful"""
        if not self.is_valid_pos(from_row, from_col):
            return False
        if not self.is_valid_pos(to_row, to_col):
            return False
        if self.board[(from_row, from_col)] is None:
            return False
        if self.board[(to_row, to_col)] is not None:
            return False

        valid = self.get_valid_moves(from_row, from_col)
        if [to_row, to_col] not in valid:
            return False

        player = self.board[(from_row, from_col)]
        self.board[(from_row, from_col)] = None
        self.board[(to_row, to_col)] = player
        self.move_history.append(((from_row, from_col), (to_row, to_col)))
        return True

    def undo_move(self):
        """Undo last move"""
        if not self.move_history:
            return False
        (fr, fc), (tr, tc) = self.move_history.pop()
        self.board[(fr, fc)] = self.board[(tr, tc)]
        self.board[(tr, tc)] = None
        return True

    def check_winner(self):
        """Return player index if they've won, else None"""
        for player in [0, 1]:
            goal = PLAYER_GOAL[player]
            if all(self.board.get(pos) == player for pos in goal):
                return player
        return None

    def get_pieces(self, player):
        """Return list of positions for player's pieces"""
        return [(r, c) for (r, c), v in self.board.items() if v == player]

    def to_dict(self):
        """Serialize board for JSON response"""
        cells = []
        for (row, col), player in self.board.items():
            cells.append({"row": row, "col": col, "player": player})
        return {"cells": cells, "row_cols": {str(k): v for k, v in ROW_COLS.items()}}

    def copy(self):
        """Deep copy of board"""
        new_board = ChineseCheckersBoard.__new__(ChineseCheckersBoard)
        new_board.board = dict(self.board)
        new_board.move_history = list(self.move_history)
        return new_board
