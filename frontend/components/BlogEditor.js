// frontend/src/components/BlogEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { saveDraft, publishBlog } from "../services/api";
import {
    FiSave,
    FiSend,
    FiFilePlus,
    FiEdit3,
    FiRotateCw,
} from "react-icons/fi"; // Example icons

const BlogEditor = ({
    currentBlog,
    onSave,
    onPublish,
    onClearSelection,
    showToast,
}) => {
    const [id, setId] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activityTimeoutRef = useRef(null);

    useEffect(() => {
        if (currentBlog) {
            setId(currentBlog.id || null);
            setTitle(currentBlog.title || "");
            setContent(currentBlog.content || "");
            setTags(currentBlog.tags ? currentBlog.tags.join(", ") : "");
            setIsDirty(false);
        } else {
            setId(null);
            setTitle("");
            setContent("");
            setTags("");
            setIsDirty(false);
        }
        setIsSubmitting(false); // Reset submitting state
    }, [currentBlog]);

    const handleInputChange = (setter, value) => {
        setter(value);
        setIsDirty(true);
        if (activityTimeoutRef.current)
            clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = setTimeout(() => {
            if (id || title || content) {
                // Check if there's content or it's an existing draft
                triggerAutoSave("Auto-saved (inactivity)");
            }
        }, 5000);
    };

    const triggerAutoSave = useCallback(
        async (sourceMessage = "Auto-saved") => {
            if (!isDirty && sourceMessage !== "Auto-saved (interval)") return;
            if (!id && !title.trim() && !content.trim()) return; // Don't save empty new form

            const blogData = {
                id,
                title: title.trim() || (id ? "Untitled" : ""), // Ensure title is not empty if content exists
                content: content.trim(),
                tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t),
            };

            // Only save if there's an ID or substantial content
            if (!blogData.id && !blogData.title && !blogData.content) {
                return;
            }

            try {
                const response = await saveDraft(blogData);
                setId(response.data.id);
                onSave(response.data); // Update parent state
                showToast(
                    `${sourceMessage} at ${new Date().toLocaleTimeString()}`,
                    "info"
                );
                setIsDirty(false);
            } catch (error) {
                console.error("Error auto-saving draft:", error);
                showToast("Error auto-saving draft.", "error");
            }
        },
        [id, title, content, tags, onSave, isDirty, showToast]
    );

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (isDirty && (id || title.trim() || content.trim())) {
                triggerAutoSave("Auto-saved (interval)");
            }
        }, 30000);

        return () => {
            clearInterval(autoSaveInterval);
            if (activityTimeoutRef.current)
                clearTimeout(activityTimeoutRef.current);
        };
    }, [id, title, content, triggerAutoSave, isDirty]);

    const handleManualSaveDraft = async () => {
        if (!title.trim() && !content.trim()) {
            showToast("Please enter title or content to save draft.", "error");
            return;
        }
        setIsSubmitting(true);
        const blogData = {
            id,
            title: title.trim() || "Untitled Draft",
            content: content.trim(),
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
        };
        try {
            const response = await saveDraft(blogData);
            setId(response.data.id);
            onSave(response.data);
            showToast("Draft saved successfully!", "success");
            setIsDirty(false);
        } catch (error) {
            console.error("Error saving draft:", error);
            showToast("Error saving draft.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) {
            showToast("Title and Content are required to publish.", "error");
            return;
        }
        setIsSubmitting(true);
        const blogData = {
            id,
            title: title.trim(),
            content: content.trim(),
            tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
        };
        try {
            const response = await publishBlog(blogData);
            onPublish(response.data); // This updates the blog in App.js state
            showToast("Blog published successfully!", "success");
            // If it was a new post being published, or an existing draft, update its ID and clear dirty
            setId(response.data.id);
            setIsDirty(false);
        } catch (error) {
            console.error("Error publishing blog:", error);
            showToast("Error publishing blog.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewPost = () => {
        if (isDirty && (title.trim() || content.trim())) {
            if (
                window.confirm(
                    "You have unsaved changes. Are you sure? Your current changes will be auto-saved as a draft first."
                )
            ) {
                triggerAutoSave("Auto-saved before new post");
                onClearSelection();
            }
        } else {
            onClearSelection();
        }
    };

    return (
        <div className="blog-editor-card">
            <div className="editor-header">
                <h2>
                    {id ? (
                        <FiEdit3 className="icon" />
                    ) : (
                        <FiFilePlus className="icon" />
                    )}
                    {id ? " Edit Blog Post" : " Create New Post"}
                    {isDirty && (
                        <span
                            className="dirty-indicator"
                            title="Unsaved changes"
                        ></span>
                    )}
                </h2>
                <button onClick={handleNewPost} className="btn btn-outline">
                    <FiRotateCw className="icon" /> New Post
                </button>
            </div>

            <div className="form-group">
                <label htmlFor="blog-title">Title</label>
                <input
                    id="blog-title"
                    type="text"
                    placeholder="Enter your blog title here..."
                    value={title}
                    onChange={(e) =>
                        handleInputChange(setTitle, e.target.value)
                    }
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <label htmlFor="blog-content">Content</label>
                <textarea
                    id="blog-content"
                    placeholder="Start writing your masterpiece..."
                    value={content}
                    onChange={(e) =>
                        handleInputChange(setContent, e.target.value)
                    }
                    rows={15}
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <label htmlFor="blog-tags">Tags (comma-separated)</label>
                <input
                    id="blog-tags"
                    type="text"
                    placeholder="e.g., technology, programming, life"
                    value={tags}
                    onChange={(e) => handleInputChange(setTags, e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <div className="editor-actions">
                <button
                    onClick={handleManualSaveDraft}
                    className="btn btn-draft"
                    disabled={
                        (!isDirty && id !== null) ||
                        isSubmitting ||
                        (!title.trim() && !content.trim())
                    }
                >
                    <FiSave className="icon" /> Save Draft
                </button>
                <button
                    onClick={handlePublish}
                    className="btn btn-secondary"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                >
                    <FiSend className="icon" /> Publish
                </button>
            </div>
        </div>
    );
};

export default BlogEditor;
