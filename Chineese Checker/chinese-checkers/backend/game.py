from flask import Blueprint, request, jsonify
from ai import get_ai_move
from board import ChineseCheckersBoard

game_bp = Blueprint("game", __name__)

# In-memory game state (per session via simple dict)
games = {}

@game_bp.route("/new", methods=["POST"])
def new_game():
    data = request.get_json()
    mode = data.get("mode", "human_vs_ai")  # human_vs_ai | ai_vs_ai
    game_id = data.get("game_id", "default")

    board = ChineseCheckersBoard()
    games[game_id] = {
        "board": board,
        "mode": mode,
        "current_player": 0,
        "step_count": 0,
        "winner": None
    }
    return jsonify({
        "game_id": game_id,
        "board": board.to_dict(),
        "current_player": 0,
        "mode": mode
    })

@game_bp.route("/state/<game_id>", methods=["GET"])
def get_state(game_id):
    if game_id not in games:
        return jsonify({"error": "Game not found"}), 404
    g = games[game_id]
    return jsonify({
        "board": g["board"].to_dict(),
        "current_player": g["current_player"],
        "step_count": g["step_count"],
        "winner": g["winner"],
        "mode": g["mode"]
    })

@game_bp.route("/moves", methods=["POST"])
def get_moves():
    data = request.get_json()
    game_id = data.get("game_id", "default")
    row = data.get("row")
    col = data.get("col")

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 404

    g = games[game_id]
    moves = g["board"].get_valid_moves(row, col)
    return jsonify({"moves": moves})

@game_bp.route("/move", methods=["POST"])
def make_move():
    data = request.get_json()
    game_id = data.get("game_id", "default")
    from_pos = data.get("from")
    to_pos = data.get("to")

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 404

    g = games[game_id]
    board = g["board"]
    current_player = g["current_player"]

    # Ownership check — piece must belong to current player
    piece_owner = board.board.get((from_pos[0], from_pos[1]))
    if piece_owner != current_player:
        return jsonify({"error": "Not your piece"}), 403

    success = board.move_piece(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
    if not success:
        return jsonify({"error": "Invalid move"}), 400

    g["step_count"] += 1
    winner = board.check_winner()
    g["winner"] = winner

    # Advance turn
    if not winner:
        g["current_player"] = 1 - g["current_player"]

    return jsonify({
        "board": board.to_dict(),
        "current_player": g["current_player"],
        "step_count": g["step_count"],
        "winner": winner
    })

@game_bp.route("/ai_move", methods=["POST"])
def ai_move():
    data = request.get_json()
    game_id = data.get("game_id", "default")
    depth = data.get("depth", 3)

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 404

    g = games[game_id]
    board = g["board"]
    player = g["current_player"]

    move = get_ai_move(board, player, depth)
    if not move:
        return jsonify({"error": "No moves available"}), 400

    board.move_piece(move[0][0], move[0][1], move[1][0], move[1][1])
    g["step_count"] += 1
    winner = board.check_winner()
    g["winner"] = winner

    if not winner:
        g["current_player"] = 1 - g["current_player"]

    return jsonify({
        "board": board.to_dict(),
        "current_player": g["current_player"],
        "step_count": g["step_count"],
        "winner": winner,
        "move": move
    })
