const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer'); //upload관련
const fs = require('fs');

try{
    fs.readdirSync('uploads');
}catch(error){
    console.error('upload폴더 없음 upload폴더 생성합니다.');
    fs.mkdirSync('uploads');
}

const app = express();

const urlencodedParser = bodyParser.urlencoded({extended:false});

/*
    storage에는 어디에, 어떻게 저장할지 destinamtion에 filename으로 
    첫번째 인자는 에러, 두번째 인자 실제 경로 또는 파일 이름, done은 함수로 
    file또는 req를 가공해 넘기는 형태 
*/
const upload = multer({
    storage:multer.diskStorage({
        destination(req, file,done){
            done(null,'uploads/');
        },
        filename(req, file,done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext)+Date.now()+ext);
            // 이름+현재시간+확장자로 저장
        },
    }),
    limits:{fileSize:5*1024*1024} //최대 5MB
});

dotenv.config();
app.set('port',process.env.PORT || 8080);
app.use('/', express.static(path.join(__dirname, 'www')));


// app.use((req,res,next)=>{
//     console.log('모든요청에서 실행됩니다.');
//     next();
// })

app.get('/',(req,res)=>{
    console.log('GET요청이 오면 실행됩니다.');
    // res.sendFile(path.join(__dirname,'/index.html'));
    // next();
});


app.get('/upload',(req, res)=>{
    res.sendFile(path.join(__dirname,'www/upload.html'));
});
app.post('/upload',upload.single('userface'), (req, res)=>{
    console.log(req.file);
    res.send('ok');
});

app.get('/multiupload',(req,res)=>{
    res.sendFile(path.join(__dirname,'www/multiupload.html'));
});
app.post('/multiupload', upload.array('img'),(req,res)=>{
    console.log(req.files, req.body);
    res.send(req.files);
})

app.get('/uploads',(req,res)=>{
    res.sendFile(path.join(__dirname,'/www/uploads.html'));
});
const mUpload = upload.fields([
    {name:'img1'},
    {name:'img2'},
    {name:'img3'}
]);
app.post('/uploads', mUpload, (req, res)=>{
        console.log(req.file, req.body);
        res.send('ok');
    });


app.post('/',urlencodedParser,(req,res)=>{
    const body = req.body;
    let username = body.username;
    let userpass = body.userpass;
    res.send(`${username}님 비번은 ${userpass}입니다.`);
});

//회원가입
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'/www/daum_reg.html'));
});
app.post('/register', urlencodedParser,upload.single('userface'),(req, res)=>{
    const reg = req.body;
    let username = reg.username;
    let userid = reg.userid;
    let userpass = reg.userpass;
    
    let addr = reg.addr;
    let detailaddr = reg.detailaddr;
    let extraaddr = reg.extraaddr;

    res.send(`
                이름 : ${username}<br>
                아이디 : ${userid}<br>
                비밀번호 : ${userpass}<br>
                주소 : ${addr} ${detailaddr} cf.${extraaddr}<br>
                <h1>회원가입 완료!<br> 회원가입을 축하드립니다 ${username}님!!</h1>
                `)

   
});

// err처리
app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).send(err.message);
});


app.listen(app.get('port'), ()=>{
    console.log(`${app.get('port')}번 포트에서 대기중`);
});