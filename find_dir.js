const Client=require('ssh2').Client;
const conn=new Client();
conn.on('ready',()=>{
  conn.exec('find / -maxdepth 5 -type d -name "atsolar*" 2>/dev/null', (err,stream)=>{
    stream.on('close',()=>conn.end()).on('data',d=>console.log(d.toString()));
  });
}).connect({
  host:'172.104.130.208',
  port:2722,
  username:'master-94099776',
  password:'j0PhbaxkNl0ORIH'
});
