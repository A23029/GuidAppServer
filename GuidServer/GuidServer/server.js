const express = require('express');
const axios = require('axios');
const cors = require('cors');  // CORSモジュールを追加
const app = express();
const port8080 = 8080;
const port3000 = 3000;

let latestAuthCode = null;  // 最新の認証コードを保持する変数

app.use(cors());
app.use(express.json());  // JSONボディの解析を有効化

// Unreal Engineからの認証コード取得リクエストに応答
app.get('/get-auth-code', (req, res) => {
    console.log('Received request for auth code');
    if (latestAuthCode) {
        res.json({ code: latestAuthCode });
        latestAuthCode = null;  // コードを返したらリセット
    } else {
        console.log('No auth code available at the moment');
        // 一定時間後に再度リトライする処理を追加
        setTimeout(() => {
            if (latestAuthCode) {
                res.json({ code: latestAuthCode });
                latestAuthCode = null;
            } else {
                res.status(404).json({ error: "No auth code available" });
            }
        }, 2000);  // 2秒後に再度確認
    }
});



// 8080ポートで動作する認証サーバー
app.get('/auth', async (req, res) => {
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=213688804532-fllms9d8c5jv09qsdf9i6iblr5if4d52.apps.googleusercontent.com&redirect_uri=http://localhost:8080/callback&response_type=code&scope=https://www.googleapis.com/auth/drive&access_type=offline&prompt=consent';

    try {
        const open = await import('open');
        await open.default(authUrl);
        res.send('Opening Google OAuth authentication page...');
    } catch (error) {
        console.error('Error opening auth URL:', error);
        res.send('Failed to open authentication page.');
    }
});

// 認証後のコールバック処理
app.get('/callback', (req, res) => {
    const authCode = req.query.code;
    if (authCode) {
        latestAuthCode = authCode;  // 最新の認証コードを保存
        res.send(`Received authentication code: ${authCode}`);
        console.log(`Auth Code: ${authCode}`);
    } else {
        res.send('No authentication code received.');
    }
});

app.listen(port3000, () => {
    console.log(`Unreal Engine receive server running at http://localhost:${port3000}`);
});

app.listen(port8080, () => {
    console.log(`Auth server running at http://localhost:${port8080}`);
});

    