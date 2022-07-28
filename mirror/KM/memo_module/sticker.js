const dbAccess = require('./mirror_db.js')

let memo_contents = {};
const memo_ui = document.getElementsByClassName('memo_ui');

dbAccess.select('*', 'memo', 'user_id=1')
.then(value => {
    for(let i=0;i<value.length;i++){
        const memo = document.createElement('div');
        memo.id = value[i].seq;
        memo.innerText = value[i].contents;
        memo_ui[0].append(memo);
    }
});


