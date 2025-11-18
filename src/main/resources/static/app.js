// app.js

const API_BASE_URL = '/api/notes';
const AUTH_BASE_URL = '/api/auth';

let authToken = null;
let currentUsername = null;

// エラーメッセージを表示するヘルパー関数
function displayError(message) {
    const errorElement = document.getElementById('error-message');
    if (!message) {
        errorElement.textContent = '';
        return;
    }
    errorElement.textContent = 'エラー: ' + message;
}

function updateAuthStatus() {
    const statusElement = document.getElementById('auth-status');
    const logoutButton = document.getElementById('logout-button');

    if (!statusElement || !logoutButton) {
        return;
    }

    if (authToken && currentUsername) {
        statusElement.textContent = `ログイン中: ${currentUsername}`;
        logoutButton.disabled = false;
    } else if (authToken) {
        statusElement.textContent = 'ログイン中';
        logoutButton.disabled = false;
    } else {
        statusElement.textContent = '未ログイン';
        logoutButton.disabled = true;
    }
}

function setAuthToken(token, username) {
    authToken = token;
    currentUsername = username;
    updateAuthStatus();
}

function clearAuthToken() {
    authToken = null;
    currentUsername = null;
    updateAuthStatus();
}

function ensureAuthenticated() {
    if (!authToken) {
        displayError('先にログインしてください。');
        return false;
    }
    return true;
}

async function handleAuthRequest(endpoint, credentials, successMessage) {
    displayError('');
    try {
        const response = await fetch(`${AUTH_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`${response.status} ${response.statusText}${errorBody ? `: ${errorBody}` : ''}`);
        }

        const data = await response.json();
        if (!data.token) {
            throw new Error('レスポンスにトークンが含まれていません。');
        }

        setAuthToken(data.token, credentials.username);
        alert(successMessage);
        fetchNotes();
    } catch (error) {
        displayError(`${endpoint} 失敗: ${error.message}`);
        throw error;
    }
}

// ----------------------------------------------------
// 認証フォームのイベントハンドラ
// ----------------------------------------------------

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        displayError('ユーザー名とパスワードを入力してください。');
        return;
    }

    try {
        await handleAuthRequest('login', { username, password }, 'ログインしました！');
        event.target.reset();
    } catch (e) {
        // handleAuthRequest内でエラーメッセージを表示しているため、ここでは追加処理のみ
        console.error(e);
    }
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        displayError('ユーザー名とパスワードを入力してください。');
        return;
    }

    try {
        await handleAuthRequest('register', { username, password }, 'ユーザー登録が完了しました！ログイン済みです。');
        event.target.reset();
    } catch (e) {
        console.error(e);
    }
});

document.getElementById('logout-button').addEventListener('click', () => {
    clearAuthToken();
    displayError('');
    document.getElementById('notes-list').innerHTML = '';
    alert('ログアウトしました。');
});

// ----------------------------------------------------
// GET: 全てのメモを取得して表示する
// ----------------------------------------------------
async function fetchNotes() {
    document.getElementById('error-message').textContent = '';
    const listDiv = document.getElementById('notes-list');

    if (!ensureAuthenticated()) {
        listDiv.innerHTML = '';
        return;
    }

    listDiv.innerHTML = 'ロード中...';

    try {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        const notes = await response.json();

        listDiv.innerHTML = '';

        if (notes.length === 0) {
            listDiv.innerHTML = '<p>メモはありません。</p>';
            return;
        }

        notes.forEach(note => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.innerHTML = `
                <strong>ID: ${note.id}</strong><br>
                <strong>タイトル:</strong> ${note.title}<br>
                <strong>内容:</strong> ${note.content.substring(0, 50)}...<br>
                <small>作成日時: ${new Date(note.createdAt).toLocaleString()}</small>
            `;
            listDiv.appendChild(item);
        });

    } catch (error) {
        displayError(`メモ一覧の取得に失敗しました: ${error.message}`);
        listDiv.innerHTML = '';
    }
}


// ----------------------------------------------------
// POST: 新しいメモを作成する
// ----------------------------------------------------
document.getElementById('create-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    displayError('');

    if (!ensureAuthenticated()) {
        return;
    }

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const newNote = { title, content };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(newNote)
        });

        if (response.status === 201) {
            alert('メモが正常に作成されました！');
            document.getElementById('create-form').reset();
            fetchNotes();
        } else if (response.status === 400) {
            const errorBody = await response.json();
            displayError(`作成エラー (400 Bad Request): ${JSON.stringify(errorBody)}`);
        } else {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

    } catch (error) {
        displayError(`メモの作成に失敗しました: ${error.message}`);
    }
});


// ----------------------------------------------------
// GET: IDを指定してメモを検索する
// ----------------------------------------------------
async function fetchNoteById() {
    displayError('');
    const id = document.getElementById('note-id').value;

    if (!ensureAuthenticated()) {
        return;
    }

    if (!id) {
        displayError('検索するIDを入力してください。');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.status === 404) {
            await response.text();
            displayError(`ID ${id} のメモが見つかりません。 (404 Not Found)`);
        } else if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        } else {
            const note = await response.json();
            alert(`メモが見つかりました！\nID: ${note.id}\nタイトル: ${note.title}\n内容: ${note.content.substring(0, 50)}...`);
        }

    } catch (error) {
        displayError(`メモの検索に失敗しました: ${error.message}`);
    }
}


// ----------------------------------------------------
// DELETE: IDを指定してメモを削除する
// ----------------------------------------------------
async function deleteNote() {
    displayError('');
    const id = document.getElementById('note-id').value;

    if (!ensureAuthenticated()) {
        return;
    }

    if (!id || !confirm(`本当にID ${id} のメモを削除しますか？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.status === 204) {
            alert(`ID ${id} のメモを削除しました。`);
            fetchNotes();
        } else if (response.status === 404) {
            displayError(`削除しようとしたID ${id} のメモが見つかりませんでした。 (404 Not Found)`);
        } else {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

    } catch (error) {
        displayError(`メモの削除に失敗しました: ${error.message}`);
    }
}

// ページロード時の初期化
window.addEventListener('load', () => {
    updateAuthStatus();
});

// グローバルアクセスが必要な関数を明示的に公開
window.fetchNotes = fetchNotes;
window.fetchNoteById = fetchNoteById;
window.deleteNote = deleteNote;
