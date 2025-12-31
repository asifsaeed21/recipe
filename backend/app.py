import os
import pickle
import zipfile
import numpy as np
from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # FIX: Enable frontend-backend communication

# --- Load Model from Zip File ---
ZIP_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'recipe_model.pkl.zip')
MODEL_NAME_IN_ZIP = 'recipe_model.pkl'

# Global variables for model
tfidf = None
tfidf_matrix = None
df = None

def load_model_from_zip():
	"""Extract and load model from zip file at runtime"""
	global tfidf, tfidf_matrix, df
	
	try:
		# Check if zip file exists
		if not os.path.exists(ZIP_MODEL_PATH):
			raise FileNotFoundError(f"Model zip file not found: {ZIP_MODEL_PATH}")
		
		print(f"Loading model from zip: {ZIP_MODEL_PATH}")
		
		# Extract and load model from zip file directly in memory
		with zipfile.ZipFile(ZIP_MODEL_PATH, 'r') as zip_ref:
			# Find the model file in zip (ignore __MACOSX files)
			model_file = None
			for file_info in zip_ref.namelist():
				if file_info.endswith('.pkl') and not file_info.startswith('__MACOSX'):
					model_file = file_info
					break
			
			if model_file is None:
				raise FileNotFoundError("recipe_model.pkl not found in zip file")
			
			# Load model directly from zip file
			with zip_ref.open(model_file) as f:
				model = pickle.load(f)
		
		tfidf = model['tfidf']
		tfidf_matrix = model['tfidf_matrix']
		df = model['df']
		print("Model loaded successfully from zip file!")
		
	except Exception as e:
		print(f"Model loading error: {e}")
		tfidf = None
		tfidf_matrix = None
		df = None
		raise

# Load model at startup
try:
	load_model_from_zip()
except Exception as e:
	print(f"Failed to load model: {e}")


# --- Recommendation Logic ---
def recommend_recipes(ingredients, top_n=15):
	if tfidf is None or tfidf_matrix is None or df is None:
		raise RuntimeError("Model not loaded properly.")

	if not ingredients.strip():
		return []

	# Vectorize input
	input_vec = tfidf.transform([ingredients])

	# Calculate cosine similarity
	similarity_scores = cosine_similarity(input_vec, tfidf_matrix).flatten()

	# Get top N results (get more indices to ensure we have enough unique recipes)
	top_indices = np.argsort(similarity_scores)[::-1][:top_n * 10]  # Get more candidates
	results = []
	seen_titles = set()  # Track unique recipe titles

	for idx in top_indices:
		row = df.iloc[idx]
		recipe_title = row["recipe_title"]
		
		# Skip if we've already seen this recipe title
		if recipe_title in seen_titles:
			continue
		
		seen_titles.add(recipe_title)
		results.append({
			"recipe_title": recipe_title,
			"category": row["category"],
			"subcategory": row["subcategory"],
			"description": row["description"],
			"ingredients": row["ingredients"],
			"directions": row["directions"],
			"num_ingredients": int(row["num_ingredients"]),
			"num_steps": int(row["num_steps"]),
			"similarity": float(similarity_scores[idx])
		})
		
		# Stop if we have enough unique recipes
		if len(results) >= top_n:
			break

	return results


# --- API Endpoint ---
@app.route('/recommend', methods=['POST'])
def recommend():
	data = request.get_json()

	if not data or "ingredients" not in data:
		return jsonify({"error": "Ingredients not provided"}), 400

	ingredients = data["ingredients"]

	try:
		output = recommend_recipes(ingredients)
		return jsonify({"recipes": output})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
	return jsonify({"status": "healthy", "message": "Recipe API is running"}), 200

@app.route('/', methods=['GET'])
def home():
	return jsonify({"message": "Recipe Recommendation API", "endpoints": ["/health", "/recommend"]}), 200

if __name__ == '__main__':
	app.run(debug=True, host='127.0.0.1', port=5001)
