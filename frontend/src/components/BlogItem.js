// frontend/src/components/BlogItem.js
import React from "react";
import {
    FiEdit,
    FiTrash2,
    FiTag,
    FiClock,
    FiCheckCircle,
    FiFileText,
} from "react-icons/fi";

const BlogItem = ({ blog, onEdit, onDelete }) => {
    const handleDelete = () => {
        if (
            window.confirm(
                `Are you sure you want to delete "${
                    blog.title || "this post"
                }"? This action cannot be undone.`
            )
        ) {
            onDelete(blog.id);
        }
    };

    return (
        <div className="blog-item-card">
            <div className={`status-ribbon ${blog.status}`}>{blog.status}</div>
            <h3>{blog.title || "Untitled Post"}</h3>
            <div className="blog-item-meta">
                <span>
                    {blog.status === "published" ? (
                        <FiCheckCircle className="icon" />
                    ) : (
                        <FiFileText className="icon" />
                    )}
                    Status:{" "}
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </span>
                <span>
                    <FiClock className="icon" />
                    Updated: {new Date(blog.updated_at).toLocaleDateString()}
                </span>
            </div>

            {blog.tags && blog.tags.length > 0 && (
                <div className="blog-item-tags">
                    <FiTag
                        className="icon"
                        style={{
                            marginRight: "5px",
                            color: "var(--text-light)",
                        }}
                    />
                    {blog.tags.map((tag) => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Simple content preview - could be expanded */}
            <p
                style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9em",
                    maxHeight: "60px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {blog.content.substring(0, 100)}
                {blog.content.length > 100 ? "..." : ""}
            </p>

            <div className="blog-item-actions">
                <button
                    onClick={() => onEdit(blog)}
                    className="btn btn-primary"
                >
                    <FiEdit className="icon" /> Edit
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                    <FiTrash2 className="icon" /> Delete
                </button>
            </div>
        </div>
    );
};

export default BlogItem;
