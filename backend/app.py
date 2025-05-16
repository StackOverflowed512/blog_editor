# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Blog
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Database Configuration ---
# Option 1: In-memory (for quick testing, data lost on restart)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

# Option 2: File-based SQLite (persistent)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# --- Helper to create tables ---
with app.app_context():
    db.create_all()

# --- API Endpoints ---

@app.route('/api/blogs/save-draft', methods=['POST'])
def save_draft():
    data = request.json
    blog_id = data.get('id')
    
    if not data.get('title') and not data.get('content'):
        return jsonify({'error': 'Title or content is required to save a draft'}), 400

    if blog_id: # Update existing draft
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        blog.title = data.get('title', blog.title)
        blog.content = data.get('content', blog.content)
        blog.tags = ','.join(data.get('tags', [])) if data.get('tags') else blog.tags
        blog.status = 'draft' # Ensure it's a draft
    else: # Create new draft
        blog = Blog(
            title=data.get('title', 'Untitled Draft'),
            content=data.get('content', ''),
            tags=','.join(data.get('tags', [])),
            status='draft'
        )
        db.session.add(blog)
    
    try:
        db.session.commit()
        return jsonify(blog.to_dict()), 200 if blog_id else 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/blogs/publish', methods=['POST'])
def publish_blog():
    data = request.json
    blog_id = data.get('id')

    if not data.get('title'):
        return jsonify({'error': 'Title is required to publish'}), 400
    if not data.get('content'):
        return jsonify({'error': 'Content is required to publish'}), 400

    if blog_id: # Update existing blog and publish
        blog = Blog.query.get(blog_id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        blog.title = data.get('title')
        blog.content = data.get('content')
        blog.tags = ','.join(data.get('tags', [])) if data.get('tags') else None
        blog.status = 'published'
    else: # Create new blog and publish
        blog = Blog(
            title=data.get('title'),
            content=data.get('content'),
            tags=','.join(data.get('tags', [])),
            status='published'
        )
        db.session.add(blog)
        
    try:
        db.session.commit()
        return jsonify(blog.to_dict()), 200 if blog_id else 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/blogs', methods=['GET'])
def get_all_blogs():
    try:
        blogs = Blog.query.order_by(Blog.updated_at.desc()).all()
        return jsonify([blog.to_dict() for blog in blogs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/blogs/<int:id>', methods=['GET'])
def get_blog_by_id(id):
    try:
        blog = Blog.query.get(id)
        if blog:
            return jsonify(blog.to_dict()), 200
        else:
            return jsonify({'error': 'Blog not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
@app.route('/api/blogs/<int:id>', methods=['DELETE']) # Optional: For deleting posts
def delete_blog(id):
    try:
        blog = Blog.query.get(id)
        if not blog:
            return jsonify({'error': 'Blog not found'}), 404
        db.session.delete(blog)
        db.session.commit()
        return jsonify({'message': 'Blog deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001) # Use a different port than React's default 3000