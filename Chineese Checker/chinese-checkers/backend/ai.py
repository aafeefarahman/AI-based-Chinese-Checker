"""
AI Module - Minimax with Alpha-Beta Pruning
Heuristic: sum of distances from each piece to its goal positions
"""
import math
from board import PLAYER_GOAL, ROW_COLS

# Precompute goal center for distance heuristic
def _goal_center(player):
    goals = PLAYER_GOAL[player]
    avg_r = sum(r for r, c in goals) / len(goals)
    avg_c = sum(c for r, c in goals) / len(goals)
    return avg_r, avg_c

GOAL_CENTERS = {0: _goal_center(0), 1: _goal_center(1)}

def hex_distance(r1, c1, r2, c2):
    """Approximate hex grid distance"""
    return math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2)

def heuristic(board, player):
    """
    Heuristic function for board evaluation from player's perspective.
    
    Score = sum of distances of opponent pieces to their goal
           - sum of distances of player pieces to their goal
    
    Lower distance to goal = better score.
    Bonus for pieces already in goal zone.
    """
    opponent = 1 - player
    score = 0

    # Player pieces: minimize distance to goal
    player_pieces = board.get_pieces(player)
    goal_positions = set(map(tuple, PLAYER_GOAL[player]))
    goal_center = GOAL_CENTERS[player]

    for r, c in player_pieces:
        dist = hex_distance(r, c, goal_center[0], goal_center[1])
        score -= dist  # closer to goal = higher score
        if (r, c) in goal_positions:
            score += 5  # bonus for being in goal zone

    # Opponent pieces: maximize their distance to goal (penalize opponent progress)
    opp_pieces = board.get_pieces(opponent)
    opp_goal_center = GOAL_CENTERS[opponent]
    opp_goal_positions = set(map(tuple, PLAYER_GOAL[opponent]))

    for r, c in opp_pieces:
        dist = hex_distance(r, c, opp_goal_center[0], opp_goal_center[1])
        score += dist  # opponent far from goal = better for us
        if (r, c) in opp_goal_positions:
            score -= 5

    return score

def get_all_moves(board, player):
    """Get all (from, to) moves for a player"""
    moves = []
    for pos in board.get_pieces(player):
        r, c = pos
        for dest in board.get_valid_moves(r, c):
            moves.append(((r, c), tuple(dest)))
    return moves

def minimax(board, depth, alpha, beta, maximizing_player, player):
    """
    Minimax with alpha-beta pruning.
    
    Args:
        board: current board state
        depth: remaining search depth
        alpha, beta: pruning bounds
        maximizing_player: True if current node maximizes score
        player: the AI player index (0 or 1)
    
    Returns:
        (score, best_move)
    """
    winner = board.check_winner()
    if winner == player:
        return (10000 + depth, None)  # win sooner is better
    if winner is not None:
        return (-10000 - depth, None)  # lose later is better

    if depth == 0:
        return (heuristic(board, player), None)

    current = player if maximizing_player else (1 - player)
    moves = get_all_moves(board, current)

    if not moves:
        return (heuristic(board, player), None)

    # Sort moves by heuristic for better pruning (move ordering)
    def move_score(m):
        b = board.copy()
        b.move_piece(m[0][0], m[0][1], m[1][0], m[1][1])
        return heuristic(b, player)

    moves.sort(key=move_score, reverse=maximizing_player)
    # Limit branching factor for performance
    moves = moves[:12]

    best_move = None

    if maximizing_player:
        best_val = -math.inf
        for move in moves:
            b = board.copy()
            b.move_piece(move[0][0], move[0][1], move[1][0], move[1][1])
            val, _ = minimax(b, depth - 1, alpha, beta, False, player)
            if val > best_val:
                best_val = val
                best_move = move
            alpha = max(alpha, val)
            if beta <= alpha:
                break
        return (best_val, best_move)
    else:
        best_val = math.inf
        for move in moves:
            b = board.copy()
            b.move_piece(move[0][0], move[0][1], move[1][0], move[1][1])
            val, _ = minimax(b, depth - 1, alpha, beta, True, player)
            if val < best_val:
                best_val = val
                best_move = move
            beta = min(beta, val)
            if beta <= alpha:
                break
        return (best_val, best_move)

def get_ai_move(board, player, depth=3):
    """
    Entry point: returns best (from_pos, to_pos) for given player.
    Uses minimax with alpha-beta pruning.
    """
    _, move = minimax(board, depth, -math.inf, math.inf, True, player)
    return move
