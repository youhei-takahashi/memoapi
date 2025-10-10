// app.js

const API_BASE_URL = 'http://localhost:8080/api/notes'; // 適切なAPIのベースURLに変更してください

// エラーメッセージを表示するヘルパー関数
function displayError(message) {
    document.getElementById('error-message').textContent = 'エラー: ' + message;
}

// ----------------------------------------------------
// GET: 全てのメモを取得して表示する
// ----------------------------------------------------
async function fetchNotes() {
    document.getElementById('error-message').textContent = ''; // エラーをクリア
    const listDiv = document.getElementById('notes-list');
    listDiv.innerHTML = 'ロード中...';

    try {
        const response = await fetch(API_BASE_URL);

        // 2xx 以外のステータスコードをチェック
        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

        const notes = await response.json();

        listDiv.innerHTML = ''; // リストをクリア

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
    event.preventDefault(); // フォームのデフォルト送信を防止
    document.getElementById('error-message').textContent = '';

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const newNote = { title, content };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newNote)
        });

        if (response.status === 201) { // 201 Created を想定
            alert('メモが正常に作成されました！');
            document.getElementById('create-form').reset(); // フォームをリセット
            fetchNotes(); // 一覧を更新
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
    document.getElementById('error-message').textContent = '';
    const id = document.getElementById('note-id').value;
    if (!id) {
        displayError('検索するIDを入力してください。');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);

        if (response.status === 404) {
            // 404の場合、APIが本文にエラーメッセージを返していれば表示
            const errorText = await response.text();
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
    document.getElementById('error-message').textContent = '';
    const id = document.getElementById('note-id').value;
    if (!id || !confirm(`本当にID ${id} のメモを削除しますか？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) { // 204 No Content を想定
            alert(`ID ${id} のメモを削除しました。`);
            fetchNotes(); // 一覧を更新
        } else if (response.status === 404) {
            displayError(`削除しようとしたID ${id} のメモが見つかりませんでした。 (404 Not Found)`);
        } else {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }

    } catch (error) {
        displayError(`メモの削除に失敗しました: ${error.message}`);
    }
}

// ページロード時に一覧を取得
window.onload = fetchNotes;