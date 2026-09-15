const form = document.querySelector('#search-form');
const statusBox = document.querySelector('#status');
const results = document.querySelector('#results');
const count = document.querySelector('#result-count');
const title = document.querySelector('#results-title');

const demoFestivals = [
  {title:'서울빛초롱축제', addr1:'서울특별시 종로구 청계천로', eventstartdate:'20260901', eventenddate:'20260930', firstimage2:''},
  {title:'부산 불꽃축제', addr1:'부산광역시 수영구 광안해변로', eventstartdate:'20261015', eventenddate:'20261017', firstimage2:''},
  {title:'제주 전통문화축제', addr1:'제주특별자치도 제주시', eventstartdate:'20260920', eventenddate:'20260922', firstimage2:''}
];

function dateText(value){return value ? `${value.slice(0,4)}.${value.slice(4,6)}.${value.slice(6,8)}` : '기간 미정'}
function card(item){const imageUrl=item.image || item.firstimage2; const image=imageUrl ? `<img class="card-image" src="${imageUrl}" alt="${item.title} 대표 이미지">` : '<div class="card-image empty-image" aria-label="대표 이미지 없음">✳</div>'; const address=item.address || item.addr1; const start=item.startDate || item.eventstartdate; const end=item.endDate || item.eventenddate; return `<article class="card">${image}<div class="card-body"><h3>${item.title || '제목 없음'}</h3><p class="date">${dateText(start)} — ${dateText(end)}</p><p>${address || '주소 정보 없음'}</p></div></article>`}

form.addEventListener('submit', async (event)=>{
  event.preventDefault();
  const start = document.querySelector('#start-date').value;
  const end = document.querySelector('#end-date').value;
  const region = document.querySelector('#region').value;
  const keyword = document.querySelector('#keyword').value.trim();
  if(!start){statusBox.textContent='시작일을 입력해 주세요.';statusBox.className='status error';return}
  if(end && end < start){statusBox.textContent='종료일은 시작일 이후여야 합니다.';statusBox.className='status error';return}
  statusBox.textContent='축제를 찾는 중입니다…';statusBox.className='status';results.innerHTML='';count.textContent='';
  const params = new URLSearchParams({eventStartDate:start.replaceAll('-','')});
  if(end) params.set('eventEndDate',end.replaceAll('-','')); if(region) params.set('lDongRegnCd',region);
  try{
    params.set('startDate', start); if(end) params.set('endDate', end); if(region) params.set('region', region); if(keyword) params.set('keyword', keyword);
    const response = await fetch(`/api/festivals?${params}`);
    if(!response.ok) throw new Error('API_REQUEST_FAILED');
    let items = (await response.json()).items || [];
    render(items, keyword);
  }catch(error){
    // 서버가 없거나 키가 설정되지 않은 경우에도 화면을 확인할 수 있게 데모 상태를 제공합니다.
    let items = demoFestivals.filter(item => !region || item.addr1.includes(document.querySelector('#region').selectedOptions[0].textContent));
    if(keyword) items = items.filter(item => item.title.includes(keyword)); render(items, keyword, true);
  }
});

function render(items, keyword, demo=false){title.textContent=keyword ? `‘${keyword}’ 축제` : '추천 축제';count.textContent=`${items.length}건`;if(!items.length){statusBox.textContent='조건에 맞는 축제가 없습니다. 기간이나 키워드를 바꿔보세요.';statusBox.className='status';return}statusBox.textContent=demo?'API 연결 전 미리보기 결과입니다. 서버에 서비스키를 설정하면 실제 결과가 표시됩니다.':'';statusBox.className='status';results.innerHTML=items.map(card).join('')}
