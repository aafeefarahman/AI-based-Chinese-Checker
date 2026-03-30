from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from game import game_bp

app = Flask(__name__)
app.secret_key = "chinese_checkers_secret_2024"

# Must explicitly allow the frontend origin with credentials
CORS(app,
     origins=["http://localhost:3000", "http://127.0.0.1:3000",
              "http://localhost:3001", "http://127.0.0.1:3001"],
     supports_credentials=True)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(game_bp, url_prefix="/api/game")

if __name__ == "__main__":
    app.run(debug=False, port=5000, host="127.0.0.1")
