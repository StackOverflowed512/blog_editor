// frontend/src/components/BlogList.js
import React from "react";
import BlogItem from "./BlogItem";
import { FiArchive, FiSend } from "react-icons/fi"; // Icons for section titles

const BlogList = ({ blogs, onEdit, onDelete }) => {
    const drafts = blogs
        .filter((blog) => blog.status === "draft")
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const published = blogs
        .filter((blog) => blog.status === "published")
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return (
        <div className="blog-list-container">
            <div className="list-section">
                <h2>
                    <FiArchive className="icon" /> Drafts ({drafts.length})
                </h2>
                {drafts.length > 0 ? (
                    drafts.map((blog) => (
                        <BlogItem
                            key={blog.id}
                            blog={blog}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                ) : (
                    <p className="empty-list-message">
                        No drafts yet. Start writing something amazing!
                    </p>
                )}
            </div>
            <div className="list-section">
                <h2>
                    <FiSend className="icon" /> Published ({published.length})
                </h2>
                {published.length > 0 ? (
                    published.map((blog) => (
                        <BlogItem
                            key={blog.id}
                            blog={blog}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                ) : (
                    <p className="empty-list-message">
                        No blogs published yet. Time to share your thoughts!
                    </p>
                )}
            </div>
        </div>
    );
};

export default BlogList;
