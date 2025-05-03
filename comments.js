class CommentSystem {
    constructor() {
        this.commentsContainer = document.getElementById('comments-container');
        this.commentForm = document.getElementById('comment-form');
        this.currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        this.repo = 'githubkiroloshany/sunrise-in-egypt';
        this.setupEventListeners();
        this.loadComments();
    }

    async loadComments() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/comments.json`);
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            const pageComments = content[this.currentPage] || [];
            this.displayComments(pageComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.commentsContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
        }
    }

    displayComments(comments) {
        if (comments.length === 0) {
            this.commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }

        this.commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <p>${comment.text}</p>
                <div class="comment-meta">
                    <small>${new Date(comment.date).toLocaleString()}</small>
                    <div class="reactions">
                        <button class="reaction-btn ${comment.liked ? 'active' : ''}" 
                                onclick="commentSystem.toggleLike('${comment.id}')">
                            👍 ${comment.likes}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async submitComment(event) {
        event.preventDefault();
        
        const authorElement = document.getElementById('author-name');
        const textElement = document.getElementById('comment-text');
        
        const author = authorElement.value.trim();
        const text = textElement.value.trim();
        
        if (!author || !text) {
            alert('Please fill in all fields');
            return;
        }

        const newComment = {
            id: `comment_${Date.now()}`,
            author,
            text,
            date: new Date().toISOString(),
            likes: 0,
            liked: false
        };

        try {
            // Get current comments
            const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/comments.json`);
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            // Add new comment
            if (!content[this.currentPage]) {
                content[this.currentPage] = [];
            }
            content[this.currentPage].push(newComment);

            // Update comments file
            await this.updateCommentsFile(content, data.sha);

            // Clear form
            authorElement.value = '';
            textElement.value = '';

            // Reload comments
            this.loadComments();
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Error submitting comment. Please try again later.');
        }
    }

    async updateCommentsFile(content, sha) {
        const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/comments.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.getGitHubToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update comments',
                content: btoa(JSON.stringify(content, null, 2)),
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update comments');
        }
    }

    setupEventListeners() {
        this.commentForm.addEventListener('submit', (e) => this.submitComment(e));
    }

    getGitHubToken() {
        // Replace with your GitHub Personal Access Token
        return 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';
    }
}

// Initialize comment system
const commentSystem = new CommentSystem();