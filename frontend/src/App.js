// frontend/src/App.js
import React, { useState, useEffect, useCallback } from "react";
import BlogEditor from "./components/BlogEditor";
import BlogList from "./components/BlogList";
import { getAllBlogs, deleteBlog as apiDeleteBlog } from "./services/api";
import "./App.css";
import { FiFeather } from "react-icons/fi"; // App header icon

function App() {
    const [blogs, setBlogs] = useState([]);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: "", type: "", show: false });

    const showToast = (message, type = "info", duration = 3000) => {
        setToast({ message, type, show: true });
        setTimeout(() => {
            setToast({ message: "", type: "", show: false });
        }, duration);
    };

    const fetchBlogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllBlogs();
            setBlogs(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch blogs:", err);
            setError(
                "Oh no! Failed to load blogs. Please check if the backend server is happy and running."
            );
            setBlogs([]);
            showToast("Could not fetch blogs. Is the server running?", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleSaveOrPublish = (updatedBlog) => {
        setBlogs((prevBlogs) => {
            const existingIndex = prevBlogs.findIndex(
                (b) => b.id === updatedBlog.id
            );
            if (existingIndex !== -1) {
                const newBlogs = [...prevBlogs];
                newBlogs[existingIndex] = updatedBlog;
                return newBlogs;
            } else {
                return [updatedBlog, ...prevBlogs];
            }
        });
        if (currentBlog && currentBlog.id === updatedBlog.id) {
            setCurrentBlog(updatedBlog); // Keep editor updated if current blog was saved/published
        } else if (!currentBlog && updatedBlog.status === "draft") {
            setCurrentBlog(updatedBlog); // If new draft, load it in editor
        }
        // If a draft was just published, and it was the currentBlog, we might want to clear editor or keep it
        // For now, if it's the same ID, it stays loaded.
    };

    const handleEditBlog = (blogToEdit) => {
        // Check for unsaved changes in current editor before switching
        const editorIsDirty = document.querySelector(
            ".editor-header .dirty-indicator"
        ); // Simple check
        if (editorIsDirty && currentBlog && currentBlog.id !== blogToEdit.id) {
            if (
                !window.confirm(
                    "You have unsaved changes in the current post. Are you sure you want to discard them and edit another? (Auto-save should have kicked in)"
                )
            ) {
                return; // User cancelled
            }
        }
        setCurrentBlog(blogToEdit);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleClearSelection = () => {
        setCurrentBlog(null);
    };

    const handleDeleteBlog = async (blogId) => {
        // Confirmation is now handled in BlogItem, but could be here too
        try {
            setIsLoading(true); // Indicate activity
            await apiDeleteBlog(blogId);
            setBlogs((prevBlogs) => prevBlogs.filter((b) => b.id !== blogId));
            if (currentBlog && currentBlog.id === blogId) {
                setCurrentBlog(null);
            }
            showToast("Blog post deleted successfully!", "success");
        } catch (err) {
            console.error("Failed to delete blog:", err);
            showToast("Failed to delete blog post.", "error");
            setError("Could not delete the post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>
                    <FiFeather /> Stunning Blog Platform
                </h1>
            </header>
            <main>
                <BlogEditor
                    currentBlog={currentBlog}
                    onSave={handleSaveOrPublish}
                    onPublish={handleSaveOrPublish}
                    onClearSelection={handleClearSelection}
                    showToast={showToast}
                />
                <hr className="separator" />
                {isLoading && (
                    <p className="loading-indicator">
                        Fetching your masterpieces...
                    </p>
                )}
                {error && !isLoading && (
                    <p className="error-message">{error}</p>
                )}

                {!isLoading && !error && (
                    <BlogList
                        blogs={blogs}
                        onEdit={handleEditBlog}
                        onDelete={handleDeleteBlog}
                    />
                )}
            </main>

            {toast.show && (
                <div
                    className={`toast-message ${toast.type} ${
                        toast.show ? "show" : ""
                    }`}
                >
                    {toast.message}
                </div>
            )}

            <footer>
                <p>
                    © {new Date().getFullYear()} Your Name/Company - Built with
                    Passion & React
                </p>
            </footer>
        </div>
    );
}

export default App;
