const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const port = process.env.PORT || 3000;
const root = __dirname;
const apiBase = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
function send(res,status,type,body){res.writeHead(status,{'Content-Type':type});res.end(body)}
http.createServer(async (req,res)=>{
  const url = new URL(req.url,`http://localhost:${port}`);
  if(url.pathname === '/api/festivals'){
    if(!process.env.TOUR_API_KEY) return send(res,503,'application/json; charset=utf-8',JSON.stringify({error:'TOUR_API_KEY is not configured'}));
    const query = new URLSearchParams({serviceKey:process.env.TOUR_API_KEY,MobileOS:'WEB',MobileApp:'FestivalFinder',_type:'json',numOfRows:'30',pageNo:'1',arrange:'A',eventStartDate:url.searchParams.get('eventStartDate')||''});
    for(const key of ['eventEndDate','lDongRegnCd']) if(url.searchParams.get(key)) query.set(key,url.searchParams.get(key));
    try{const response=await fetch(`${apiBase}?${query}`);const data=await response.json();const items=data?.response?.body?.items?.item||[];send(res,response.ok?200:502,'application/json; charset=utf-8',JSON.stringify({items,meta:data?.response?.body||{}}))}catch(error){send(res,502,'application/json; charset=utf-8',JSON.stringify({error:'UPSTREAM_REQUEST_FAILED'}))}
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); const filePath = path.join(root,file);
  if(!filePath.startsWith(root) || !fs.existsSync(filePath)) return send(res,404,'text/plain; charset=utf-8','Not found');
  send(res,200,mime[path.extname(filePath)]||'text/plain; charset=utf-8',fs.readFileSync(filePath));
}).listen(port,()=>console.log(`Festival Finder running at http://localhost:${port}`));
